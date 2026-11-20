import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useGameStore } from '../../stores/gameStore';
import {
  setTextureAnisotropy,
  createRoadTexture,
  createSidewalkTexture,
  createCrosswalkTexture,
  createUrbanGroundTexture,
  createCurbTexture,
  createCompoundWallTexture,
} from './materials';
import {
  ArticulatedCharacterRig,
  BoxCollider,
  createArticulatedCharacter,
  createShopModel,
  createUrbanBuilding,
  createMosqueSkylineLandmark,
  createPoliceStationLandmark,
  createShoppingMallLandmark,
  createPlayerHQLandmark,
  createRoadsideUmbrellaStall,
  createElectricPolesAndWires,
  createRickshawModel,
  createCNGModel,
  createMurirTinBusModel,
  createLegunaModel,
  createPickupTruckModel,
  createDeliveryVanModel,
  createPoliceCarModel,
  createCarModel,
  UrbanBuildingOptions,
  createDestructiblePropMesh,
  applyDestructibleVisualState,
  createCityTrees,
  createStreetLampposts,
  createFlyoverPillars,
  createDhakaMetroViaduct,
  createStreetPoliticalPosters,
} from './proceduralModels';
import { WORLD_NPCS_DATA, CITY_ZONES } from '../../data/cityData';
import { DestructibleObject, HeroExpression, WorldNPCData } from '../../types/game';
import { soundManager } from '../../audio/soundManager';
import { setCharacterTextureAnisotropy, disposeCharacterTextures } from './characterTextures';
import {
  StylizedCharacterRig,
  CharacterAnimAction,
  createHeroCharacterFromEquipped,
  createNPCCharacter,
  setCharacterExpression,
  animateCharacterRig,
  disposeCharacterRig,
} from './characterSystem';

export interface SceneInteractionTarget {
  type: 'shop' | 'vehicle' | 'destructible' | 'delivery';
  id: string;
  name: string;
  distance: number;
}

interface PedestrianAgent {
  rig: StylizedCharacterRig;
  isFemale: boolean;
  axis: 'x' | 'z';
  fixedCoord: number;
  minRange: number;
  maxRange: number;
  direction: 1 | -1;
  speed: number;
  phase: number;
  chatPauseTimer: number;
}

interface WorldNPCAgent {
  data: WorldNPCData;
  rig: StylizedCharacterRig;
  homePos: THREE.Vector3;
  walkAngle: number;
  phase: number;
  socialPauseTimer: number;
}

interface TrafficAgent {
  mesh: THREE.Group;
  axis: 'x' | 'z';
  laneCoord: number;
  minRange: number;
  maxRange: number;
  direction: 1 | -1;
  speed: number;
}

interface DebrisParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
}

export class ChandaCityScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private isSoftwareGl: boolean;
  private animationFrameId: number | null = null;
  private softwareTimerId: number | null = null;
  private isDestroyed = false;

  // Player & Controls
  private playerRig: StylizedCharacterRig | null = null;
  private lastHeroExpression: HeroExpression = 'neutral';
  private playerVelocity = new THREE.Vector3();
  private playerSpeed = 8.5;
  private isGrounded = true;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private isSprinting = false;
  private touchMoveX = 0;
  private touchMoveY = 0;
  private cameraAngleYaw = 0;
  private cameraAnglePitch = 0.36;
  private cameraDistance = 7.5;
  private currentCamDistance = 7.5;
  private kickAnimTimer = 0;
  private animWalkCycle = 0;

  // Colliders & Dynamic Elements
  private colliders: BoxCollider[] = [];
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;
  private destructibleMeshes: Map<string, THREE.Group> = new Map();
  private shopKeepers: Map<string, { rig: ArticulatedCharacterRig; hitTimer: number; category: string }> = new Map();
  private worldNpcs: WorldNPCAgent[] = [];
  private standingShopId: string | null = null;
  private shopStandTimer = 0;
  private policeAgents: { rig: StylizedCharacterRig; homePos: THREE.Vector3 }[] = [];
  private policePhaseTimer = 0;
  private catchingCopIdx = 0;
  private prevPoliceStatus: 'idle' | 'arriving' | 'chasing' | 'caught' = 'idle';
  private pedestrians: PedestrianAgent[] = [];
  private trafficVehicles: TrafficAgent[] = [];
  private debrisParticles: DebrisParticle[] = [];
  private debrisGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  private debrisMaterials: Map<number, THREE.MeshStandardMaterial> = new Map();
  private deliveryBeacon: THREE.Group | null = null;
  private deliveryRing: THREE.Mesh | null = null;

  // Reusable math & environment refs to avoid per-frame GC allocations
  private envTarget: THREE.WebGLRenderTarget | null = null;
  private onContextLostHandler: ((e: Event) => void) | null = null;
  private camLookTarget = new THREE.Vector3();
  private camTargetPos = new THREE.Vector3();
  private readonly skyMorning = new THREE.Color(0xfef3c7).lerp(new THREE.Color(0xbae6fd), 0.45);
  private readonly skyAfternoon = new THREE.Color(0xfdf2d0).lerp(new THREE.Color(0x93c5fd), 0.38);
  private readonly skyEvening = new THREE.Color(0xf59e0b).lerp(new THREE.Color(0x7c2d12), 0.32);
  private readonly skyNight = new THREE.Color(0x0b1120);

  // Store listeners & event cleanup
  private unsubStore: (() => void) | null = null;
  private cleanupListeners: (() => void) | null = null;
  private lastPositionSync = 0;

  // Interaction detection callback
  public onNearbyTargetChange?: (target: SceneInteractionTarget | null) => void;
  private currentNearbyTarget: SceneInteractionTarget | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    setTextureAnisotropy(maxAniso);
    setCharacterTextureAnisotropy(maxAniso);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdbeafe).lerp(new THREE.Color(0xfef3c7), 0.55);
    this.scene.fog = new THREE.FogExp2(0xeae6d2, 0.0036);

    this.camera = new THREE.PerspectiveCamera(
      56,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.2,
      600
    );
    this.camera.position.set(0, 5, 19);

    // 4. Studio Environment Lighting (PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    this.scene.environment = this.envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 5. Lighting Rig
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.85);
    this.sunLight.position.set(45, 70, 35);
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 190;
    const shadowD = 75;
    this.sunLight.shadow.camera.left = -shadowD;
    this.sunLight.shadow.camera.right = shadowD;
    this.sunLight.shadow.camera.top = shadowD;
    this.sunLight.shadow.camera.bottom = -shadowD;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    this.hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, 0.95);
    this.scene.add(this.hemiLight);

    // 6. Apply graphics quality & build world
    this.applyGraphicsQuality();
    this.buildCityWorld();
    this.setupRainParticles();
    this.setupDeliveryBeacon();
    this.setupPolicePatrols();
    this.setupWorldNPCs();
    this.setupPedestrians();
    this.setupTraffic();
    this.setupInputListeners();

    // Subscribe to destructibles changes
    let prevDestructibles = useGameStore.getState().destructibles;
    this.unsubStore = useGameStore.subscribe((state) => {
      if (state.destructibles !== prevDestructibles) {
        prevDestructibles = state.destructibles;
        this.syncDestructibles(state.destructibles);
      }
    });

    this.onContextLostHandler = (e: Event) => {
      e.preventDefault();
    };
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLostHandler, false);
    window.addEventListener('resize', this.handleResize);

    // Start render loop
    this.tick();
  }

  public applyGraphicsQuality() {
    const quality = useGameStore.getState().settings.graphicsQuality;
    if (this.isSoftwareGl || quality === 'low') {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
      this.sunLight.castShadow = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));
      this.renderer.shadowMap.enabled = true;
      this.sunLight.castShadow = true;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.sunLight.castShadow = true;
    }
  }

  private buildCityWorld() {
    const store = useGameStore.getState();

    // 1. Textured Urban Concrete Base Ground (expanded 640x640m)
    const groundTex = createUrbanGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.92 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(640, 640), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Paved Divided Metro Avenue Grid (Main NS/EW + Rings ±50, ±105, ±165)
    const mainRoadMat = new THREE.MeshStandardMaterial({ map: createRoadTexture(34), roughness: 0.84 });
    const ringRoadMat = new THREE.MeshStandardMaterial({ map: createRoadTexture(24), roughness: 0.84 });

    // Main Divided NS Boulevard (x in [-9.5, 9.5], z in [-230, 230])
    const nsRoad = new THREE.Mesh(new THREE.PlaneGeometry(19, 460), mainRoadMat);
    nsRoad.rotation.x = -Math.PI / 2;
    nsRoad.position.set(0, 0.02, 0);
    nsRoad.receiveShadow = true;
    this.scene.add(nsRoad);

    // Main EW Avenue (z in [-7, 7], x in [-230, 230])
    const ewRoad = new THREE.Mesh(new THREE.PlaneGeometry(460, 14), mainRoadMat);
    ewRoad.rotation.x = -Math.PI / 2;
    ewRoad.rotation.z = Math.PI / 2;
    ewRoad.position.set(0, 0.025, 0);
    ewRoad.receiveShadow = true;
    this.scene.add(ewRoad);

    // Inner Ring Roads (x = ±50, z = ±50), Mid Ring (±105), Outer Express Ring (±165)
    [-50, 50].forEach((offset) => {
      const rNS = new THREE.Mesh(new THREE.PlaneGeometry(10, 360), ringRoadMat);
      rNS.rotation.x = -Math.PI / 2;
      rNS.position.set(offset, 0.015, 0);
      rNS.receiveShadow = true;
      this.scene.add(rNS);

      const rEW = new THREE.Mesh(new THREE.PlaneGeometry(10, 360), ringRoadMat);
      rEW.rotation.x = -Math.PI / 2;
      rEW.rotation.z = Math.PI / 2;
      rEW.position.set(0, 0.018, offset);
      rEW.receiveShadow = true;
      this.scene.add(rEW);
    });

    [-105, 105].forEach((offset) => {
      const oNS = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), ringRoadMat);
      oNS.rotation.x = -Math.PI / 2;
      oNS.position.set(offset, 0.014, 0);
      oNS.receiveShadow = true;
      this.scene.add(oNS);

      const oEW = new THREE.Mesh(new THREE.PlaneGeometry(10, 400), ringRoadMat);
      oEW.rotation.x = -Math.PI / 2;
      oEW.rotation.z = Math.PI / 2;
      oEW.position.set(0, 0.017, offset);
      oEW.receiveShadow = true;
      this.scene.add(oEW);
    });

    [-165, 165].forEach((offset) => {
      const xNS = new THREE.Mesh(new THREE.PlaneGeometry(10, 440), ringRoadMat);
      xNS.rotation.x = -Math.PI / 2;
      xNS.position.set(offset, 0.013, 0);
      xNS.receiveShadow = true;
      this.scene.add(xNS);

      const xEW = new THREE.Mesh(new THREE.PlaneGeometry(10, 440), ringRoadMat);
      xEW.rotation.x = -Math.PI / 2;
      xEW.rotation.z = Math.PI / 2;
      xEW.position.set(0, 0.016, offset);
      xEW.receiveShadow = true;
      this.scene.add(xEW);
    });

    // 3. Raised Brick Herringbone Footpaths + Yellow-Black Dhaka Curbs & Drain Grates
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: createSidewalkTexture(), roughness: 0.88 });
    const curbMat = new THREE.MeshStandardMaterial({ map: createCurbTexture(48), roughness: 0.82 });
    const drainMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 });

    [-11.25, 11.25].forEach((sx) => {
      const walkN = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 212), sidewalkMat);
      walkN.position.set(sx, 0.09, -116);
      walkN.receiveShadow = true;
      this.scene.add(walkN);

      const walkS = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 212), sidewalkMat);
      walkS.position.set(sx, 0.09, 116);
      walkS.receiveShadow = true;
      this.scene.add(walkS);

      // Bold Yellow-Black Curb along road edge
      const curbX = sx > 0 ? 9.6 : -9.6;
      const curbN = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 212), curbMat);
      curbN.position.set(curbX, 0.11, -116);
      this.scene.add(curbN);

      const curbS = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 212), curbMat);
      curbS.position.set(curbX, 0.11, 116);
      this.scene.add(curbS);

      // Storm drain grates embedded on the brick footpath
      [-190, -148, -130, -88, -44, -20, 20, 44, 88, 130, 148, 190].forEach((dz) => {
        const grate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 1.35), drainMat);
        grate.position.set(sx > 0 ? 10.2 : -10.2, 0.19, dz);
        this.scene.add(grate);
      });
    });

    [-8.75, 8.75].forEach((sz) => {
      const walkW = new THREE.Mesh(new THREE.BoxGeometry(206, 0.16, 3.5), sidewalkMat);
      walkW.position.set(-116, 0.08, sz);
      walkW.receiveShadow = true;
      this.scene.add(walkW);

      const walkE = new THREE.Mesh(new THREE.BoxGeometry(206, 0.16, 3.5), sidewalkMat);
      walkE.position.set(116, 0.08, sz);
      walkE.receiveShadow = true;
      this.scene.add(walkE);
    });

    // Dhaka Compound Walls behind outer sidewalk gaps
    const wallMat = new THREE.MeshStandardMaterial({ map: createCompoundWallTexture(), roughness: 0.8 });
    [-13.2, 13.2].forEach((wx) => {
      [-168, -104, -74, 84, 104, 168].forEach((wz) => {
        const cWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 12), wallMat);
        cWall.position.set(wx, 1.2, wz);
        this.scene.add(cWall);
      });
    });

    // Zebra Crosswalks at main roundabout entries
    const crosswalkMat = new THREE.MeshStandardMaterial({ map: createCrosswalkTexture(), roughness: 0.85 });
    [
      [0, -11.5, 0],
      [0, 11.5, 0],
      [-12.5, 0, Math.PI / 2],
      [12.5, 0, Math.PI / 2],
    ].forEach(([cx, cz, rot]) => {
      const cw = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.4), crosswalkMat);
      cw.rotation.x = -Math.PI / 2;
      cw.rotation.z = rot;
      cw.position.set(cx, 0.032, cz);
      this.scene.add(cw);
    });

    // 4. Central Bazaar Roundabout Plaza & Low Monument (clears Metro Viaduct overhead at y=9.8!)
    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(7.2, 7.6, 0.32, 32),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.72 })
    );
    island.position.set(0, 0.16, 0);
    island.receiveShadow = true;
    this.scene.add(island);

    const fountainPool = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.2, 0.85, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    fountainPool.position.set(0, 0.58, 0);
    this.scene.add(fountainPool);

    const monumentPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 1.15, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.3 })
    );
    monumentPillar.position.set(0, 2.2, 0);
    monumentPillar.castShadow = true;
    this.scene.add(monumentPillar);

    this.colliders.push({ minX: -4.5, maxX: 4.5, minZ: -4.5, maxZ: 4.5 });

    // Elevated Dhaka Metro Rail Viaduct + Poster-wrapped Pillars + Station Signboards
    const metro = createDhakaMetroViaduct();
    this.scene.add(metro.group);
    this.colliders.push(...metro.colliders);

    // 5. Interactive Shops (+ colliders & keeper rigs)
    store.shops.forEach((shop) => {
      const { group, collider, keeperRig } = createShopModel(shop);
      this.scene.add(group);
      this.colliders.push(collider);
      this.shopKeepers.set(shop.id, { rig: keeperRig, hitTimer: 0, category: shop.category });
    });

    // 6. District Landmarks & Multi-Story Urban Skyline Buildings
    const mosque = createMosqueSkylineLandmark(-32, -134);
    this.scene.add(mosque.group);
    this.colliders.push(mosque.collider);

    const mall = createShoppingMallLandmark(-36, 64);
    this.scene.add(mall.group);
    this.colliders.push(mall.collider);

    const policeHQ = createPoliceStationLandmark(-26, 92);
    this.scene.add(policeHQ.group);
    this.colliders.push(policeHQ.collider);

    const playerHQ = createPlayerHQLandmark(64, -74);
    this.scene.add(playerHQ.group);
    this.colliders.push(playerHQ.collider);

    // Dense tall 4-to-7 story Dhaka apartment, commercial & signboard towers along Metro & outer avenues
    const urbanBlocks: [
      number,
      number,
      number,
      number,
      number,
      string,
      string,
      UrbanBuildingOptions?,
    ][] = [
      // Avenue-facing tall commercial buildings in clear gaps with Bengali signboards & green louvres
      [
        -18.5,
        -75,
        10,
        10,
        6,
        '#e5d5be',
        '#fef3c7',
        {
          facing: 'east',
          shopSign: { title: 'আদর্শ লাইব্রেরি', sub: 'স্থাপিত ১৯৮৮ ইং • বই ও স্টেশনারি', bg: '#111827' },
          greenLouvres: true,
        },
      ],
      [
        -18.5,
        75,
        10,
        10,
        6,
        '#c97b63',
        '#fde68a',
        {
          facing: 'east',
          shopSign: { title: 'নিউ ঢাকা স্টোর', sub: 'জেনারেল ও কসমেটিকস', bg: '#0f766e' },
          midSign: { title: 'মা ফার্মেসি', sub: '২৪ ঘণ্টা খোলা • ঔষধ ও চিকিৎসা', bg: '#ea580c' },
        },
      ],
      [
        -18.5,
        148,
        10,
        10,
        5,
        '#d6c3a5',
        '#fef08a',
        {
          facing: 'east',
          shopSign: { title: 'ঢাকা টেক্সটাইল হাউজ', sub: 'পাইকারি ও খুচরা কাপড়', bg: '#1e3a8a' },
        },
      ],
      [
        18.5,
        -75,
        10,
        10,
        6,
        '#d4a373',
        '#fef3c7',
        {
          facing: 'west',
          shopSign: { title: 'বাবার দোয়া হার্ডওয়্যার', sub: 'রং, সিমেন্ট ও স্যানিটারি', bg: '#14532d' },
          midSign: { title: 'নূর কম্পিউটার', sub: 'ল্যাপটপ ও প্রিন্টিং', bg: '#1d4ed8' },
        },
      ],
      [
        18.5,
        88,
        10,
        11,
        6,
        '#b86b52',
        '#fde68a',
        {
          facing: 'west',
          shopSign: { title: 'রহমান বস্ত্রালয়', sub: 'ঈদ ও উৎসব কালেকশন', bg: '#7f1d1d' },
          midSign: { title: 'আল-মদিনা ফার্নিচার', sub: 'স্থাপিত ১৯৯৮ ইং', bg: '#b91c1c' },
          greenLouvres: true,
        },
      ],
      [
        18.5,
        148,
        10,
        10,
        5,
        '#e5d3b3',
        '#fef9c3',
        {
          facing: 'west',
          shopSign: { title: 'মিরপুর সুপার স্টোর', sub: 'নিত্যপ্রয়োজনীয় পণ্য', bg: '#0f766e' },
        },
      ],
      [
        18.5,
        -176,
        10,
        10,
        6,
        '#d6c3a5',
        '#e0f2fe',
        {
          facing: 'west',
          midSign: { title: 'বসুন্ধরা ডেন্টাল কেয়ার', sub: 'দাঁতের আধুনিক চিকিৎসা', bg: '#0369a1' },
        },
      ],

      // Tall 5-to-7 story Dhaka apartment & commercial towers backing the 2-story street shops
      [-26, 32, 10, 10, 6, '#d6c3a5', '#fef3c7', { facing: 'east', greenLouvres: true }],
      [
        -26,
        58,
        10,
        10,
        6,
        '#c2785c',
        '#fde68a',
        { facing: 'east', midSign: { title: 'মা ডায়াগনস্টিক', sub: 'ডিজিটাল এক্স-রে ও প্যাথলজি', bg: '#ea580c' } },
      ],
      [
        26,
        -32,
        10,
        10,
        6,
        '#cbd5e1',
        '#e0f2fe',
        { facing: 'west', midSign: { title: 'গ্রামীণ টেলিকম', sub: 'মোবাইল ও রিচার্জ পয়েন্ট', bg: '#0369a1' } },
      ],
      [
        26,
        32,
        10,
        10,
        6,
        '#be6e5a',
        '#ffe4e6',
        { facing: 'west', midSign: { title: 'রয়েল কোচিং সেন্টার', sub: 'ভর্তি ও একাডেমিক কেয়ার', bg: '#9f1239' } },
      ],
      [-26, -58, 10, 10, 7, '#b8a99a', '#fef3c7', { facing: 'east', greenLouvres: true }],
      [26, -58, 10, 10, 6, '#9a6b52', '#fed7aa', { facing: 'west' }],
      [28, 21, 9, 9, 5, '#0f766e', '#ccfbf1', { facing: 'west', greenLouvres: true }],
      [-28, 21, 9, 9, 5, '#4338ca', '#e0e7ff', { facing: 'east' }],
      [28, -21, 9, 9, 6, '#d4a373', '#fef08a', { facing: 'west' }],
      [-28, -21, 9, 9, 5, '#865d4f', '#fae8ff', { facing: 'east' }],
      [64, 34, 12, 10, 6, '#0e7490', '#cffafe'],
      [68, 76, 12, 12, 7, '#1e3a8a', '#f472b6'],
      [-64, -36, 10, 10, 5, '#475569', '#f59e0b'],
      [64, -34, 10, 10, 5, '#065f46', '#a7f3d0'],
      // Expanded Outer Districts & Tall Skyline Blocks
      [-35, -88, 14, 12, 7, '#c7b8a1', '#fef3c7'],
      [35, -88, 14, 12, 7, '#1e293b', '#f59e0b'],
      [32, -122, 12, 12, 6, '#0f766e', '#5eead4'],
      [32, 122, 12, 12, 6, '#1e3a8a', '#fde047'],
      [-32, 122, 12, 12, 6, '#881337', '#fda4af'],
      [78, -28, 12, 14, 5, '#365314', '#bef264'],
      [78, 34, 12, 14, 5, '#4c1d95', '#ddd6fe'],
      [-78, -32, 12, 14, 5, '#1e293b', '#38bdf8'],
      [-78, 32, 12, 14, 6, '#7c2d12', '#fdba74'],
      [132, -32, 14, 18, 6, '#312e81', '#a5b4fc'],
      [132, 32, 14, 18, 6, '#7c2d12', '#fdba74'],
      [132, -82, 14, 16, 5, '#064e3b', '#6ee7b7'],
      [132, 82, 14, 16, 6, '#701a75', '#f0abfc'],
      [-80, -82, 14, 14, 6, '#1e293b', '#93c5fd'],
      [80, 126, 16, 14, 6, '#0f172a', '#eab308'],
      [-76, 126, 16, 14, 5, '#334155', '#fcd34d'],
      // Outer Ring Skyline Blocks (±165..±225 districts)
      [-34, -188, 16, 14, 6, '#1e293b', '#f59e0b'],
      [34, -188, 16, 14, 6, '#0f766e', '#5eead4'],
      [-34, 188, 16, 14, 6, '#312e81', '#a5b4fc'],
      [34, 188, 16, 14, 6, '#7c2d12', '#fdba74'],
      [-192, -36, 16, 18, 6, '#334155', '#38bdf8'],
      [-192, 36, 16, 18, 5, '#4c1d95', '#ddd6fe'],
      [192, -36, 16, 18, 6, '#065f46', '#a7f3d0'],
      [192, 36, 16, 18, 6, '#881337', '#fda4af'],
      [-192, -138, 14, 16, 6, '#1e3a8a', '#fef08a'],
      [192, -138, 14, 16, 6, '#701a75', '#f0abfc'],
      [-192, 138, 14, 16, 5, '#365314', '#bef264'],
      [192, 138, 14, 16, 6, '#0f172a', '#fb923c'],
      [-80, -196, 18, 14, 6, '#334155', '#cbd5e1'],
      [80, -196, 18, 14, 6, '#1e293b', '#f59e0b'],
      [-80, 196, 18, 14, 5, '#0369a1', '#e0f2fe'],
      [80, 196, 18, 14, 6, '#be123c', '#ffe4e6'],
    ];
    urbanBlocks.forEach(([bx, bz, bw, bd, floors, wall, trim, opts]) => {
      const b = createUrbanBuilding(bx, bz, bw, bd, floors, wall, trim, opts);
      this.scene.add(b.group);
      this.colliders.push(b.collider);
    });

    // Dense colorful Bangladeshi footpath umbrella stalls (টং ও হকার স্টল) along both brick footpaths
    const stallPlacements: [number, number, number, number][] = [
      // Main NS West brick footpath (x = -10.65, facing East towards boulevard)
      [-10.65, -188, 0xfacc15, Math.PI / 2],
      [-10.65, -154, 0x0284c7, Math.PI / 2],
      [-10.65, -124, 0xef4444, Math.PI / 2],
      [-10.65, -76, 0x16a34a, Math.PI / 2],
      [-10.65, -62, 0xf97316, Math.PI / 2],
      [-10.65, -34, 0x16a34a, Math.PI / 2],
      [-10.65, -20, 0x2563eb, Math.PI / 2],
      [-10.65, 20, 0xfacc15, Math.PI / 2],
      [-10.65, 32, 0x0284c7, Math.PI / 2],
      [-10.65, 62, 0xef4444, Math.PI / 2],
      [-10.65, 74, 0x10b981, Math.PI / 2],
      [-10.65, 124, 0xf59e0b, Math.PI / 2],
      [-10.65, 152, 0x9333ea, Math.PI / 2],
      [-10.65, 184, 0xea580c, Math.PI / 2],
      // Main NS East brick footpath (x = 10.65, facing West towards boulevard)
      [10.65, -188, 0xef4444, -Math.PI / 2],
      [10.65, -154, 0xf59e0b, -Math.PI / 2],
      [10.65, -124, 0x0284c7, -Math.PI / 2],
      [10.65, -76, 0x9333ea, -Math.PI / 2],
      [10.65, -62, 0x16a34a, -Math.PI / 2],
      [10.65, -34, 0xef4444, -Math.PI / 2],
      [10.65, -20, 0xfacc15, -Math.PI / 2],
      [10.65, 20, 0x2563eb, -Math.PI / 2],
      [10.65, 32, 0x16a34a, -Math.PI / 2],
      [10.65, 62, 0xf59e0b, -Math.PI / 2],
      [10.65, 74, 0xea580c, -Math.PI / 2],
      [10.65, 124, 0x10b981, -Math.PI / 2],
      [10.65, 152, 0x0284c7, -Math.PI / 2],
      [10.65, 184, 0xfacc15, -Math.PI / 2],
      // EW Avenue brick footpaths (z = ±8.6)
      [-24, 8.6, 0xef4444, Math.PI],
      [-64, 8.6, 0x16a34a, Math.PI],
      [-32, -8.6, 0xea580c, 0],
      [24, 8.6, 0x9333ea, Math.PI],
      [36, -8.6, 0x0284c7, 0],
      [64, -8.6, 0xfacc15, 0],
    ];
    stallPlacements.forEach(([ux, uz, col, rot]) => {
      this.scene.add(createRoadsideUmbrellaStall(ux, uz, col, rot));
    });

    // Overhead power lines & poles
    this.scene.add(createElectricPolesAndWires());

    // 7. Interactive Parked Vehicles (+ colliders)
    store.vehicles.forEach((veh) => {
      let vehMesh: THREE.Group;
      if (veh.type === 'bus') vehMesh = createMurirTinBusModel(veh);
      else if (veh.type === 'cng') vehMesh = createCNGModel(veh);
      else if (veh.type === 'rickshaw') vehMesh = createRickshawModel(veh);
      else if (veh.type === 'van') vehMesh = createDeliveryVanModel(veh);
      else vehMesh = createPoliceCarModel(veh);
      this.scene.add(vehMesh);

      const radius = veh.type === 'bus' ? 2.6 : 1.4;
      this.colliders.push({
        minX: veh.position[0] - radius,
        maxX: veh.position[0] + radius,
        minZ: veh.position[2] - radius,
        maxZ: veh.position[2] + radius,
      });
    });

    // 8. Destructible Props
    store.destructibles.forEach((prop) => {
      const mesh = createDestructiblePropMesh(prop);
      this.destructibleMeshes.set(prop.id, mesh);
      this.scene.add(mesh);
    });

    // 9. Environment Decor
    this.scene.add(createCityTrees());
    this.scene.add(createStreetLampposts());
    this.scene.add(createFlyoverPillars());
    this.scene.add(createStreetPoliticalPosters());

    // 10. Player Character Rig
    this.rebuildPlayerMesh();

    // 11. Subtle Zone Floor Rings
    CITY_ZONES.forEach((zone) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.6, 3.0, 28),
        new THREE.MeshBasicMaterial({
          color: zone.color,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(zone.position[0], 0.04, zone.position[2]);
      this.scene.add(ring);
    });
  }

  public rebuildPlayerMesh() {
    if (this.playerRig) {
      this.scene.remove(this.playerRig.root);
      disposeCharacterRig(this.playerRig);
    }
    const store = useGameStore.getState();
    this.playerRig = createHeroCharacterFromEquipped(
      store.equipped,
      store.customizations,
      true
    );
    setCharacterExpression(this.playerRig, store.heroExpression);
    this.lastHeroExpression = store.heroExpression;
    this.playerRig.root.position.set(store.playerPosition[0], 0, store.playerPosition[2]);
    this.playerRig.root.rotation.y = store.playerRotation;
    this.scene.add(this.playerRig.root);
  }

  private syncDestructibles(destructibles: DestructibleObject[]) {
    destructibles.forEach((prop) => {
      const mesh = this.destructibleMeshes.get(prop.id);
      if (mesh) {
        applyDestructibleVisualState(mesh, prop);
      }
    });
  }

  private setupDeliveryBeacon() {
    const group = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 1.2, 22, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    beam.position.y = 11;
    group.add(beam);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.14, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.25;
    group.add(ring);

    group.visible = false;
    this.scene.add(group);
    this.deliveryBeacon = group;
    this.deliveryRing = ring;
  }

  private setupRainParticles() {
    const rainCount = this.isSoftwareGl ? 700 : 1800;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 110;
      positions[i + 1] = Math.random() * 40;
      positions[i + 2] = (Math.random() - 0.5) * 110;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.24,
      transparent: true,
      opacity: 0.65,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  private setupPolicePatrols() {
    const copPositions: [number, number, number][] = [
      [-18, 0, 76],
      [6, 0, 32],
      [-6, 0, -32],
    ];

    copPositions.forEach((pos, idx) => {
      const rig = createNPCCharacter('police_officer');
      const [rx, rz] = this.resolveCollisions(pos[0], pos[2], 0.55);
      rig.root.position.set(rx, pos[1], rz);
      rig.root.name = `cop_npc_${idx}`;
      this.policeAgents.push({ rig, homePos: new THREE.Vector3(rx, pos[1], rz) });
      this.scene.add(rig.root);
    });
  }

  private setupWorldNPCs() {
    WORLD_NPCS_DATA.forEach((npcData, idx) => {
      const rig = createNPCCharacter(npcData.archetype, {
        variantSeed: idx,
        showMarkerArrow: npcData.archetype === 'boss_villain',
      });
      const [rx, rz] = this.resolveCollisions(npcData.position[0], npcData.position[2], 0.52);
      rig.root.position.set(rx, npcData.position[1], rz);
      rig.root.rotation.y = npcData.rotation;
      rig.root.name = npcData.id;
      this.scene.add(rig.root);
      this.worldNpcs.push({
        data: { ...npcData, position: [rx, npcData.position[1], rz] },
        rig,
        homePos: new THREE.Vector3(rx, npcData.position[1], rz),
        walkAngle: idx * 1.4,
        phase: idx * 0.9,
        socialPauseTimer: 0,
      });
    });
  }

  private setupPedestrians() {
    const outfitCombos = [
      [0xf59e0b, 0x1e293b],
      [0x10b981, 0x0f172a],
      [0xec4899, 0x312e81],
      [0xeab308, 0x334155],
      [0x06b6d4, 0x1e293b],
      [0xf8fafc, 0x15803d],
      [0xef4444, 0x0f172a],
      [0x6366f1, 0x18181b],
      [0xf97316, 0x334155],
    ];

    // Busy Dhaka crowds walking along both NS brick footpaths (x = ±11.9 inner lane & ±11.4 outer lane)
    for (let i = 0; i < 40; i++) {
      const isFemale = i % 3 === 1;
      const [shirt, bottom] = outfitCombos[i % outfitCombos.length];
      const rig = isFemale
        ? createNPCCharacter('female_citizen', { variantSeed: i })
        : createArticulatedCharacter({ shirtColor: shirt, bottomColor: bottom });
      const side = i % 2 === 0 ? -1 : 1;
      const laneOffset = i % 4 < 2 ? 11.85 : 11.45;
      const fixedX = side * laneOffset;
      const startZ = -196 + i * 10.1;
      rig.root.position.set(fixedX, 0.18, startZ);
      this.scene.add(rig.root);
      this.pedestrians.push({
        rig,
        isFemale,
        axis: 'z',
        fixedCoord: fixedX,
        minRange: -206,
        maxRange: 206,
        direction: i % 2 === 0 ? 1 : -1,
        speed: 1.35 + (i % 4) * 0.25,
        phase: i * 0.85,
        chatPauseTimer: i % 7 === 0 ? 1.8 : 0,
      });
    }

    // Walkers along EW brick sidewalks (z = ±8.8)
    for (let i = 0; i < 16; i++) {
      const isFemale = i % 2 === 0;
      const [shirt, bottom] = outfitCombos[(i + 2) % outfitCombos.length];
      const rig = isFemale
        ? createNPCCharacter('female_citizen', { variantSeed: i + 5 })
        : createArticulatedCharacter({ shirtColor: shirt, bottomColor: bottom });
      const fixedZ = i % 2 === 0 ? -8.8 : 8.8;
      const startX = -180 + i * 24;
      rig.root.position.set(startX, 0.16, fixedZ);
      this.scene.add(rig.root);
      this.pedestrians.push({
        rig,
        isFemale,
        axis: 'x',
        fixedCoord: fixedZ,
        minRange: -195,
        maxRange: 195,
        direction: i % 2 === 0 ? 1 : -1,
        speed: 1.4 + (i % 3) * 0.25,
        phase: i * 0.9,
        chatPauseTimer: 0,
      });
    }
  }

  private setupTraffic() {
    // Rich Bangladeshi street traffic: Buses, Legunas, Pickup Trucks, CNGs, Rickshaws, Delivery Vans & Sedans
    const addTraffic = (
      mesh: THREE.Group,
      axis: 'x' | 'z',
      laneCoord: number,
      startPos: number,
      direction: 1 | -1,
      speed: number,
      minRange: number,
      maxRange: number
    ) => {
      if (axis === 'z') {
        mesh.position.set(laneCoord, 0, startPos);
        mesh.rotation.y = direction > 0 ? 0 : Math.PI;
      } else {
        mesh.position.set(startPos, 0, laneCoord);
        mesh.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
      this.scene.add(mesh);
      this.trafficVehicles.push({ mesh, axis, laneCoord, minRange, maxRange, direction, speed });
    };

    // --- Main Divided NS Metro Boulevard (Southbound x = -3.8 / -7.0, Northbound x = 3.8 / 7.0) ---
    // South half (z in [16, 208]) — right in front of spawn & visible down the boulevard!
    addTraffic(
      createMurirTinBusModel(undefined, 0xdc2626, 'মিরপুর ১০ ➔ গুলিস্তান', 'বিআরটিসি লাল বাস'),
      'z',
      -3.8,
      36,
      1,
      6.4,
      16,
      208
    );
    addTraffic(
      createMurirTinBusModel(undefined, 0x059669, 'উত্তরা ➔ মতিঝিল', 'গ্রিন ঢাকা এক্সপ্রেস'),
      'z',
      3.8,
      68,
      -1,
      6.6,
      16,
      208
    );
    addTraffic(
      createMurirTinBusModel(undefined, 0x2563eb, 'মিরপুর ১২ ➔ ফার্মগেট', 'রোডমাস্টার সুপার'),
      'z',
      3.8,
      148,
      -1,
      6.2,
      16,
      208
    );
    addTraffic(createLegunaModel(0x16a34a), 'z', -6.8, 78, 1, 7.6, 16, 208);
    addTraffic(createLegunaModel(0x0284c7), 'z', 6.8, 118, -1, 7.8, 16, 208);
    addTraffic(createPickupTruckModel(0x0284c7), 'z', -3.8, 114, 1, 7.4, 16, 208);
    addTraffic(createDeliveryVanModel(), 'z', 3.8, 28, -1, 7.2, 16, 208);
    addTraffic(createRickshawModel(), 'z', -7.2, 24, 1, 4.3, 16, 208);
    addTraffic(createRickshawModel(), 'z', 7.2, 48, -1, 4.4, 16, 208);
    addTraffic(createCNGModel(), 'z', 6.8, 86, -1, 7.0, 16, 208);
    addTraffic(createCarModel(0xf8fafc), 'z', -3.8, 174, 1, 8.6, 16, 208);

    // North half of Main NS Metro Boulevard (z in [-208, -16])
    addTraffic(
      createMurirTinBusModel(undefined, 0x16a34a, 'ফার্মগেট ➔ মিরপুর ১০', 'প্রভাতী বনশ্রী সার্ভিস'),
      'z',
      -3.8,
      -44,
      1,
      6.4,
      -208,
      -16
    );
    addTraffic(
      createMurirTinBusModel(undefined, 0xdc2626, 'আগারগাঁও ➔ উত্তরা', 'সিটি সার্কুলার বাস'),
      'z',
      3.8,
      -74,
      -1,
      6.6,
      -208,
      -16
    );
    addTraffic(
      createMurirTinBusModel(undefined, 0xea580c, 'সদরঘাট ➔ গাবতলী', 'লাব্বাইক এক্সপ্রেস'),
      'z',
      -3.8,
      -146,
      1,
      6.2,
      -208,
      -16
    );
    addTraffic(createCarModel(0xf8fafc), 'z', -3.8, -96, 1, 8.4, -208, -16);
    addTraffic(createCarModel(0xe2e8f0), 'z', 3.8, -124, -1, 8.5, -208, -16);
    addTraffic(createPickupTruckModel(0xb91c1c), 'z', 3.8, -32, -1, 7.5, -208, -16);
    addTraffic(createLegunaModel(0xd97706), 'z', -6.8, -62, 1, 7.5, -208, -16);
    addTraffic(createCNGModel(), 'z', 6.8, -48, -1, 7.2, -208, -16);
    addTraffic(createRickshawModel(), 'z', -7.2, -26, 1, 4.4, -208, -16);
    addTraffic(createRickshawModel(), 'z', 7.2, -104, -1, 4.3, -208, -16);

    // --- Main EW Avenue & Ring Roads ---
    addTraffic(
      createMurirTinBusModel(undefined, 0x0284c7, 'মহাখালী ➔ গুলশান', 'ঢাকা চাকা এসি'),
      'x',
      -4.2,
      -82,
      1,
      6.4,
      -198,
      -16
    );
    addTraffic(
      createMurirTinBusModel(undefined, 0xdc2626, 'যাত্রাবাড়ী ➔ মিরপুর', 'বিআরটিসি ডাবল সার্ভিস'),
      'x',
      4.2,
      88,
      -1,
      6.4,
      16,
      198
    );
    addTraffic(createRickshawModel(), 'x', 5.4, 55, -1, 4.2, 16, 198);
    addTraffic(createDeliveryVanModel(), 'x', -4.8, -45, 1, 6.6, -198, -16);
    addTraffic(createPickupTruckModel(0x15803d), 'x', 4.6, 36, -1, 7.2, 16, 198);
    addTraffic(createMurirTinBusModel(), 'z', -50 + 2.5, -45, 1, 6.0, -170, 170);
    addTraffic(createCarModel(0xf8fafc), 'z', 50 - 2.5, 45, -1, 7.8, -170, 170);
    addTraffic(createCNGModel(), 'z', 105 - 2.4, -70, 1, 7.0, -185, 185);
    addTraffic(createCarModel(0xfef08a), 'x', -105 + 2.4, 30, -1, 7.5, -185, 185);
    addTraffic(createMurirTinBusModel(undefined, 0x059669, 'বনানী ➔ উত্তরা', 'এয়ারপোর্ট শাটল'), 'z', 165 - 2.4, -90, 1, 6.4, -205, 205);
    addTraffic(createCarModel(0x38bdf8), 'z', -165 + 2.4, 90, -1, 8.0, -205, 205);
    addTraffic(createDeliveryVanModel(), 'x', -165 + 2.4, -60, 1, 6.8, -205, 205);
    addTraffic(createCNGModel(), 'x', 165 - 2.4, 60, -1, 7.2, -205, 205);
  }

  private setupInputListeners() {
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useGameStore.getState();
      if (store.activeModal || store.gameMode !== 'playing') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = true;
          break;
        case 'Space':
          this.triggerJump();
          break;
        case 'KeyE':
          this.triggerInteraction();
          break;
        case 'KeyF':
          this.triggerAttackOrSmash();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveForward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveBackward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.isSprinting = false;
          break;
      }
    };

    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      this.cameraAngleYaw -= deltaX * 0.006;
      this.cameraAnglePitch = Math.max(0.14, Math.min(1.15, this.cameraAnglePitch + deltaY * 0.005));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      this.adjustCameraDistance(e.deltaY * 0.008);
    };

    // Touch camera orbit & 2-finger pinch zoom directly on WebGL canvas (never blocks HUD buttons)
    let activeTouchId: number | null = null;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let lastPinchDist: number | null = null;

    const onCanvasTouchStart = (e: TouchEvent) => {
      const store = useGameStore.getState();
      if (store.activeModal || store.gameMode !== 'playing') return;

      if (e.touches.length === 2) {
        activeTouchId = null;
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      } else if (e.touches.length === 1 && activeTouchId === null) {
        const t = e.changedTouches[0];
        activeTouchId = t.identifier;
        lastTouchX = t.clientX;
        lastTouchY = t.clientY;
        lastPinchDist = null;
      }
    };

    const onCanvasTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDist !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = lastPinchDist - dist;
        lastPinchDist = dist;
        this.adjustCameraDistance(diff * 0.03);
        return;
      }
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === activeTouchId) {
          const dx = t.clientX - lastTouchX;
          const dy = t.clientY - lastTouchY;
          lastTouchX = t.clientX;
          lastTouchY = t.clientY;
          this.rotateCamera(-dx * 0.008, dy * 0.006);
          break;
        }
      }
    };

    const onCanvasTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastPinchDist = null;
      }
      if (activeTouchId !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchId) {
            activeTouchId = null;
            break;
          }
        }
      }
    };

    const onWindowBlur = () => {
      this.clearMovementKeys();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        this.clearMovementKeys();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    this.renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    this.renderer.domElement.addEventListener('touchstart', onCanvasTouchStart, { passive: true });
    this.renderer.domElement.addEventListener('touchmove', onCanvasTouchMove, { passive: true });
    this.renderer.domElement.addEventListener('touchend', onCanvasTouchEnd, { passive: true });
    this.renderer.domElement.addEventListener('touchcancel', onCanvasTouchEnd, { passive: true });

    this.cleanupListeners = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      this.renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.renderer.domElement.removeEventListener('wheel', onWheel);
      this.renderer.domElement.removeEventListener('touchstart', onCanvasTouchStart);
      this.renderer.domElement.removeEventListener('touchmove', onCanvasTouchMove);
      this.renderer.domElement.removeEventListener('touchend', onCanvasTouchEnd);
      this.renderer.domElement.removeEventListener('touchcancel', onCanvasTouchEnd);
    };
  }

  private clearMovementKeys() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.touchMoveX = 0;
    this.touchMoveY = 0;
  }

  public setTouchMovement(dx: number, dy: number, sprint = false) {
    this.touchMoveX = dx;
    this.touchMoveY = dy;
    this.moveForward = dy < -0.2;
    this.moveBackward = dy > 0.2;
    this.moveLeft = dx < -0.2;
    this.moveRight = dx > 0.2;
    this.isSprinting = sprint;
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    this.cameraAngleYaw += deltaYaw;
    this.cameraAnglePitch = Math.max(0.14, Math.min(1.15, this.cameraAnglePitch + deltaPitch));
  }

  public adjustCameraDistance(delta: number) {
    this.cameraDistance = Math.max(4.5, Math.min(16, this.cameraDistance + delta));
  }

  public triggerJump() {
    if (this.isGrounded) {
      this.playerVelocity.y = 7.2;
      this.isGrounded = false;
    }
  }

  private spawnDebrisBurst(origin: THREE.Vector3, colorHex = 0xd97706) {
    let mat = this.debrisMaterials.get(colorHex);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.7 });
      this.debrisMaterials.set(colorHex, mat);
    }
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(this.debrisGeo, mat);
      m.position.set(origin.x, origin.y + 0.8, origin.z);
      this.scene.add(m);
      this.debrisParticles.push({
        mesh: m,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          3.5 + Math.random() * 4,
          (Math.random() - 0.5) * 6
        ),
        life: 1.0,
      });
    }
  }

  public triggerAttackOrSmash() {
    const store = useGameStore.getState();
    if (!this.playerRig) return;

    this.kickAnimTimer = 0.28;
    soundManager.playPunch();

    const playerPos = this.playerRig.root.position;
    let closestProp: { id: string; shopId?: string; dist: number; pos: [number, number, number] } | null = null;

    for (const p of store.destructibles) {
      if (p.isDestroyed) continue;
      const dist = Math.hypot(p.position[0] - playerPos.x, p.position[2] - playerPos.z);
      if (dist < 4.2 && (!closestProp || dist < closestProp.dist)) {
        closestProp = { id: p.id, shopId: p.shopId, dist, pos: p.position };
      }
    }

    let closestShop: { id: string; dist: number; pos: [number, number, number] } | null = null;
    for (const s of store.shops) {
      const dist = Math.hypot(s.position[0] - playerPos.x, s.position[2] - playerPos.z);
      if (dist < 6.4 && (!closestShop || dist < closestShop.dist)) {
        closestShop = { id: s.id, dist, pos: s.position };
      }
    }

    if (closestProp) {
      const targetShopId = closestProp.shopId || closestShop?.id;
      if (targetShopId) {
        soundManager.playVangchurVoice();
      } else {
        soundManager.playBreak();
      }
      store.damageObject(closestProp.id, 45);
      this.spawnDebrisBurst(new THREE.Vector3(closestProp.pos[0], closestProp.pos[1], closestProp.pos[2]));

      if (targetShopId) {
        const keeper = this.shopKeepers.get(targetShopId);
        if (keeper) keeper.hitTimer = 0.35;
        store.damageShopBrawl(targetShopId, 12, 38, 'ভাঙ!');
      }
      return;
    }

    if (closestShop) {
      soundManager.playVangchurVoice();
      const keeper = this.shopKeepers.get(closestShop.id);
      if (keeper) keeper.hitTimer = 0.42;

      this.spawnDebrisBurst(
        new THREE.Vector3(
          (playerPos.x + closestShop.pos[0]) * 0.5,
          0.6,
          (playerPos.z + closestShop.pos[2]) * 0.5
        ),
        0xfacc15
      );
      store.damageShopBrawl(closestShop.id, 30, 14);
      return;
    }

    store.notify(
      'আশেপাশে দোকান বা ভাঙার কিছু নেই!',
      'যেকোনো দোকানের সামনে গিয়ে [F] চেপে মারামারি ও ভাঙচুর শুরু করুন!',
      'info'
    );
  }

  public triggerInteraction() {
    const store = useGameStore.getState();
    if (!this.currentNearbyTarget) return;

    if (this.currentNearbyTarget.type === 'delivery') {
      store.completeActiveDelivery();
      return;
    }

    if (this.currentNearbyTarget.type === 'shop') {
      // Shop proximity triggers Lathi Smash/Vangchur directly (talk modal removed per user request)
      this.triggerAttackOrSmash();
      return;
    } else if (this.currentNearbyTarget.type === 'vehicle') {
      const veh = store.vehicles.find((v) => v.id === this.currentNearbyTarget?.id);
      if (veh) {
        store.setSelectedVehicle(veh);
        store.openModal('vehicle');
      }
    } else if (this.currentNearbyTarget.type === 'destructible') {
      this.triggerAttackOrSmash();
    }
  }

  private resolveCollisions(x: number, z: number, radius = 0.48): [number, number] {
    let rx = x;
    let rz = z;
    for (const c of this.colliders) {
      const minX = c.minX - radius;
      const maxX = c.maxX + radius;
      const minZ = c.minZ - radius;
      const maxZ = c.maxZ + radius;

      if (rx > minX && rx < maxX && rz > minZ && rz < maxZ) {
        const penLeft = Math.abs(rx - minX);
        const penRight = Math.abs(maxX - rx);
        const penTop = Math.abs(rz - minZ);
        const penBottom = Math.abs(maxZ - rz);
        const minPen = Math.min(penLeft, penRight, penTop, penBottom);

        if (minPen === penLeft) rx = minX;
        else if (minPen === penRight) rx = maxX;
        else if (minPen === penTop) rz = minZ;
        else rz = maxZ;
      }
    }
    return [rx, rz];
  }

  private animateRig(
    rig: StylizedCharacterRig,
    speedRatio: number,
    isAirborne: boolean,
    kickTimer: number,
    phase: number,
    actionOverride?: CharacterAnimAction
  ) {
    if (actionOverride) {
      animateCharacterRig(rig, { action: actionOverride, speedRatio, phase });
      return;
    }
    if (kickTimer > 0) {
      animateCharacterRig(rig, { action: 'action_kick', phase });
      return;
    }
    if (isAirborne) {
      animateCharacterRig(rig, { action: 'jump', phase });
      return;
    }
    if (speedRatio > 0.08) {
      animateCharacterRig(rig, {
        action: speedRatio > 1.12 ? 'run' : 'walk',
        speedRatio,
        phase,
      });
      return;
    }
    animateCharacterRig(rig, { action: 'idle', phase });
  }

  private updateNearbyInteractions(delta: number) {
    if (!this.playerRig) return;
    const store = useGameStore.getState();
    const pPos = this.playerRig.root.position;

    let closest: SceneInteractionTarget | null = null;
    let minDist = 6.2;

    // Only play "এই, চান্দা দে!" -> refusal -> molom chain while standing in front of a shop
    if (store.gameMode === 'playing' && store.activeModal === null) {
      let frontShop: { id: string; nameBn: string; dist: number } | null = null;
      for (const shop of store.shops) {
        const dShop = Math.hypot(shop.position[0] - pPos.x, shop.position[2] - pPos.z);
        if (dShop < 6.4 && (!frontShop || dShop < frontShop.dist)) {
          frontShop = { id: shop.id, nameBn: shop.nameBn, dist: dShop };
        }
      }

      if (frontShop) {
        store.markShopVisited(frontShop.id);
        const hSpeed = Math.hypot(this.playerVelocity.x, this.playerVelocity.z);
        const isStandingStill =
          hSpeed < 1.1 &&
          !this.moveForward &&
          !this.moveBackward &&
          !this.moveLeft &&
          !this.moveRight;

        if (this.standingShopId !== frontShop.id) {
          this.standingShopId = frontShop.id;
          this.shopStandTimer = 0;
        }

        if (isStandingStill) {
          this.shopStandTimer += delta;
          if (this.shopStandTimer >= 0.12 && !store.demandedChandaShopIds.includes(frontShop.id)) {
            store.triggerChandaCallout(frontShop.nameBn, frontShop.id);
          }
        } else {
          this.shopStandTimer = 0;
        }
      } else {
        this.standingShopId = null;
        this.shopStandTimer = 0;
        soundManager.stopShopChandaAudio();
      }
    } else {
      this.standingShopId = null;
      this.shopStandTimer = 0;
      soundManager.stopShopChandaAudio();
    }

    // 1. Check Active Delivery Destination Drop-off first (higher priority when close)
    if (store.activeDelivery) {
      const target = store.activeDelivery.targetPosition;
      const d = Math.hypot(target[0] - pPos.x, target[2] - pPos.z);
      if (d < 6.2) {
        closest = {
          type: 'delivery',
          id: store.activeDelivery.id,
          name: `ডেলিভারি দিন: ${store.activeDelivery.titleBn}`,
          distance: d,
        };
        minDist = d;
      }
    }

    // 2. Check shops
    if (!closest || closest.type !== 'delivery') {
      store.shops.forEach((shop) => {
        const d = Math.hypot(shop.position[0] - pPos.x, shop.position[2] - pPos.z);
        if (d < minDist && (!closest || d < closest.distance)) {
          closest = { type: 'shop', id: shop.id, name: shop.nameBn, distance: d };
        }
      });

      // 3. Check vehicles
      store.vehicles.forEach((veh) => {
        const d = Math.hypot(veh.position[0] - pPos.x, veh.position[2] - pPos.z);
        if (d < minDist && (!closest || d < closest.distance)) {
          closest = { type: 'vehicle', id: veh.id, name: veh.nameBn, distance: d };
        }
      });

      // 4. Check intact destructibles (prefer shop interaction if close, else prop)
      store.destructibles.forEach((prop) => {
        if (prop.isDestroyed) return;
        const d = Math.hypot(prop.position[0] - pPos.x, prop.position[2] - pPos.z);
        if (d < 3.4 && (!closest || (closest.type !== 'shop' && d < closest.distance))) {
          closest = { type: 'destructible', id: prop.id, name: prop.nameBn, distance: d };
        }
      });
    }

    if (
      closest?.id !== this.currentNearbyTarget?.id ||
      closest?.type !== this.currentNearbyTarget?.type
    ) {
      this.currentNearbyTarget = closest;
      this.onNearbyTargetChange?.(closest);
    }
  }

  private updatePlayer(delta: number) {
    if (!this.playerRig) return;
    const store = useGameStore.getState();

    // Update Hero 3D facial expression whenever changed
    if (store.heroExpression !== this.lastHeroExpression) {
      this.lastHeroExpression = store.heroExpression;
      setCharacterExpression(this.playerRig, store.heroExpression);
    }

    // Sync abrupt external teleports (e.g., police caught station reset)
    const storeDist = Math.hypot(
      store.playerPosition[0] - this.playerRig.root.position.x,
      store.playerPosition[2] - this.playerRig.root.position.z
    );
    if (storeDist > 12) {
      this.playerRig.root.position.set(store.playerPosition[0], 0, store.playerPosition[2]);
      this.playerVelocity.set(0, 0, 0);
    }

    const t = this.clock.getElapsedTime();

    // Freeze & animate appropriately while caught by police or modal open or paused
    if (store.policeState.status === 'caught') {
      this.clearMovementKeys();
      this.playerVelocity.set(0, 0, 0);
      if (this.playerRig.root.position.y > 0) {
        this.playerRig.root.position.y = 0;
        this.isGrounded = true;
      }
      this.animateRig(this.playerRig, 0, false, 0, t, 'reaction_shocked');
      return;
    }

    if (store.gameMode !== 'playing' || store.activeModal !== null) {
      this.clearMovementKeys();
      this.playerVelocity.set(0, 0, 0);
      if (this.playerRig.root.position.y > 0) {
        this.playerRig.root.position.y = 0;
        this.isGrounded = true;
      }
      const modalAction: CharacterAnimAction | undefined =
        store.activeModal === 'police_encounter' ? 'reaction_shocked' : undefined;
      this.animateRig(this.playerRig, 0, false, 0, t, modalAction);
      return;
    }

    if (this.kickAnimTimer > 0) {
      this.kickAnimTimer = Math.max(0, this.kickAnimTimer - delta);
    }

    // Mobile virtual joystick auto-rotates the camera smoothly in the steering direction
    if (Math.abs(this.touchMoveX) > 0.14 && Math.abs(this.touchMoveY) < 0.92) {
      this.cameraAngleYaw -= this.touchMoveX * 2.1 * delta;
    }

    const forward = new THREE.Vector3(-Math.sin(this.cameraAngleYaw), 0, -Math.cos(this.cameraAngleYaw));
    const right = new THREE.Vector3(Math.cos(this.cameraAngleYaw), 0, -Math.sin(this.cameraAngleYaw));

    const moveDir = new THREE.Vector3();
    if (Math.abs(this.touchMoveX) > 0.14 || Math.abs(this.touchMoveY) > 0.14) {
      moveDir.addScaledVector(forward, -this.touchMoveY);
      moveDir.addScaledVector(right, this.touchMoveX);
    } else {
      if (this.moveForward) moveDir.add(forward);
      if (this.moveBackward) moveDir.sub(forward);
      if (this.moveRight) moveDir.add(right);
      if (this.moveLeft) moveDir.sub(right);
    }

    const isMoving = moveDir.lengthSq() > 0.01;
    if (isMoving) {
      moveDir.normalize();
      const speedMult = this.isSprinting ? 1.62 : 1.0;
      const currentSpeed = this.playerSpeed * speedMult;
      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, moveDir.x * currentSpeed, 15, delta);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, moveDir.z * currentSpeed, 15, delta);

      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      // Shortest angular interpolation
      let diff = targetRotation - this.playerRig.root.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerRig.root.rotation.y += diff * Math.min(1, delta * 11);
    } else {
      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, 0, 12, delta);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, 0, 12, delta);
    }

    const horizSpeed = Math.hypot(this.playerVelocity.x, this.playerVelocity.z);
    const speedRatio = horizSpeed / this.playerSpeed;
    if (speedRatio > 0.08) {
      const cycleRate = speedRatio > 1.12 ? 7.2 * speedRatio : 6.9 * Math.max(0.75, speedRatio);
      this.animWalkCycle += delta * cycleRate;
    }

    // Gravity & Floor
    this.playerVelocity.y -= 20.0 * delta;
    let nextX = this.playerRig.root.position.x + this.playerVelocity.x * delta;
    let nextZ = this.playerRig.root.position.z + this.playerVelocity.z * delta;
    const nextY = this.playerRig.root.position.y + this.playerVelocity.y * delta;

    // Gentle separation from World NPCs so characters never overlap cleanly
    for (const npc of this.worldNpcs) {
      const dx = nextX - npc.rig.root.position.x;
      const dz = nextZ - npc.rig.root.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.001 && dist < 0.88) {
        const push = (0.88 - dist) * 0.7;
        nextX += (dx / dist) * push;
        nextZ += (dz / dist) * push;
      }
    }

    // Resolve AABB building collisions + expanded city clamp [-218, 218]
    const [resolvedX, resolvedZ] = this.resolveCollisions(nextX, nextZ, 0.48);
    this.playerRig.root.position.x = Math.max(-218, Math.min(218, resolvedX));
    this.playerRig.root.position.z = Math.max(-218, Math.min(218, resolvedZ));
    this.playerRig.root.position.y = nextY;

    if (this.playerRig.root.position.y <= 0) {
      this.playerRig.root.position.y = 0;
      this.playerVelocity.y = 0;
      this.isGrounded = true;
    }

    // Keep contact shadow anchored on ground even when jumping
    this.playerRig.shadowBlob.position.y = 0.03 - this.playerRig.root.position.y;
    const shadowScale = Math.max(0.4, 1 - this.playerRig.root.position.y * 0.25);
    this.playerRig.shadowBlob.scale.set(shadowScale, shadowScale, 1);

    // Limb animation (GTA 6 walk/run/idle)
    this.animateRig(
      this.playerRig,
      speedRatio,
      !this.isGrounded,
      this.kickAnimTimer,
      speedRatio > 0.08 ? this.animWalkCycle : t
    );

    // Sync store periodically
    const now = performance.now();
    if (isMoving && now - this.lastPositionSync > 80) {
      this.lastPositionSync = now;
      store.setPlayerPosition(
        [this.playerRig.root.position.x, this.playerRig.root.position.y, this.playerRig.root.position.z],
        this.playerRig.root.rotation.y
      );
    }
  }

  private updateCamera(delta: number) {
    if (!this.playerRig) return;

    this.camLookTarget.set(
      this.playerRig.root.position.x,
      this.playerRig.root.position.y + 1.45,
      this.playerRig.root.position.z
    );

    const dirX = Math.sin(this.cameraAngleYaw) * Math.cos(this.cameraAnglePitch);
    const dirY = Math.sin(this.cameraAnglePitch);
    const dirZ = Math.cos(this.cameraAngleYaw) * Math.cos(this.cameraAnglePitch);

    // Camera wall collision pullback
    let safeDist = this.cameraDistance;
    for (let d = 1.5; d <= this.cameraDistance; d += 0.6) {
      const sampleX = this.camLookTarget.x + dirX * d;
      const sampleY = this.camLookTarget.y + dirY * d;
      const sampleZ = this.camLookTarget.z + dirZ * d;
      if (sampleY < 4.5) {
        const hit = this.colliders.some(
          (c) => sampleX > c.minX && sampleX < c.maxX && sampleZ > c.minZ && sampleZ < c.maxZ
        );
        if (hit) {
          safeDist = Math.max(2.6, d - 0.5);
          break;
        }
      }
    }

    this.currentCamDistance = THREE.MathUtils.damp(this.currentCamDistance, safeDist, 10, delta);

    this.camTargetPos.set(
      this.camLookTarget.x + dirX * this.currentCamDistance,
      Math.max(0.8, this.camLookTarget.y + dirY * this.currentCamDistance),
      this.camLookTarget.z + dirZ * this.currentCamDistance
    );

    this.camera.position.lerp(this.camTargetPos, Math.min(1, delta * 9));
    this.camera.lookAt(this.camLookTarget);
  }

  private updateLightingAndWeather(delta: number) {
    const store = useGameStore.getState();
    if (store.gameMode === 'playing' && !store.activeModal) {
      store.advanceGameTime(delta * 3.5);
    }

    const bgColor = this.scene.background as THREE.Color;
    if (store.timeOfDay === 'morning') {
      bgColor.copy(this.skyMorning);
      this.sunLight.color.setHex(0xffedd5);
      this.sunLight.intensity = 1.65;
      this.hemiLight.intensity = 0.95;
    } else if (store.timeOfDay === 'afternoon') {
      bgColor.copy(this.skyAfternoon);
      this.sunLight.color.setHex(0xffffff);
      this.sunLight.intensity = 2.0;
      this.hemiLight.intensity = 1.05;
    } else if (store.timeOfDay === 'evening') {
      bgColor.copy(this.skyEvening);
      this.sunLight.color.setHex(0xfb923c);
      this.sunLight.intensity = 1.45;
      this.hemiLight.intensity = 0.8;
    } else {
      bgColor.copy(this.skyNight);
      this.sunLight.color.setHex(0x60a5fa);
      this.sunLight.intensity = 0.55;
      this.hemiLight.intensity = 0.45;
    }

    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.copy(bgColor);
    }

    if (this.rainParticles) {
      const isRaining = store.weather === 'rainy' || store.weather === 'stormy';
      this.rainParticles.visible = isRaining;

      if (isRaining && this.playerRig) {
        this.rainParticles.position.x = this.playerRig.root.position.x;
        this.rainParticles.position.z = this.playerRig.root.position.z;
        const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 36;
          if (positions[i] < 0) positions[i] = 40;
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update Delivery Waypoint Beacon
    if (this.deliveryBeacon) {
      if (store.activeDelivery) {
        this.deliveryBeacon.visible = true;
        const [bx, , bz] = store.activeDelivery.targetPosition;
        this.deliveryBeacon.position.set(bx, 0, bz);
        if (this.deliveryRing) {
          const pulse = 1 + Math.sin(this.clock.getElapsedTime() * 4) * 0.15;
          this.deliveryRing.scale.set(pulse, pulse, 1);
        }
      } else {
        this.deliveryBeacon.visible = false;
      }
    }
  }

  private updateWorldNPCs(delta: number) {
    if (!this.playerRig) return;
    const t = this.clock.getElapsedTime();
    const camPos = this.camera.position;

    for (let i = 0; i < this.worldNpcs.length; i++) {
      const npc = this.worldNpcs[i];
      const pos = npc.rig.root.position;
      const distToCam = Math.hypot(pos.x - camPos.x, pos.z - camPos.z);

      // LOD optimization: skip off-screen distant limb updates
      if (distToCam > 85) continue;

      if (npc.data.patrolRadius > 0 && npc.data.patrolSpeed > 0) {
        if (npc.socialPauseTimer > 0) {
          npc.socialPauseTimer = Math.max(0, npc.socialPauseTimer - delta);
          animateCharacterRig(npc.rig, { action: 'talk', phase: t + npc.phase });
          continue;
        }

        // Pause near player or another pedestrian briefly to create lively social chats
        const distPlayer = Math.hypot(
          pos.x - this.playerRig.root.position.x,
          pos.z - this.playerRig.root.position.z
        );
        if (distPlayer < 2.2) {
          const dx = this.playerRig.root.position.x - pos.x;
          const dz = this.playerRig.root.position.z - pos.z;
          npc.rig.root.rotation.y = Math.atan2(dx, dz);
          animateCharacterRig(npc.rig, { action: 'idle', phase: t + npc.phase });
          continue;
        }

        npc.walkAngle += delta * (npc.data.patrolSpeed / npc.data.patrolRadius);
        const targetX = npc.homePos.x + Math.cos(npc.walkAngle) * npc.data.patrolRadius;
        const targetZ = npc.homePos.z + Math.sin(npc.walkAngle) * npc.data.patrolRadius;
        const [rx, rz] = this.resolveCollisions(targetX, targetZ, 0.45);
        const dx = rx - pos.x;
        const dz = rz - pos.z;
        pos.x = rx;
        pos.z = rz;
        if (Math.hypot(dx, dz) > 0.001) {
          npc.rig.root.rotation.y = Math.atan2(dx, dz);
        }
        animateCharacterRig(npc.rig, {
          action: npc.data.archetype === 'female_citizen' ? 'female_stroll' : 'walk',
          speedRatio: 0.72,
          phase: t * 6 + npc.phase,
        });
        continue;
      }

      // Stationary signature archetype behaviors
      const actionMap: Record<WorldNPCData['archetype'], CharacterAnimAction> = {
        tea_vendor: 'tea_serve',
        grocer: 'grocer_counter',
        rickshaw_driver: 'rickshaw_pedal',
        bus_driver: 'bus_drive',
        police_officer: 'idle',
        female_citizen: 'idle',
        boss_villain: 'boss_command',
      };
      animateCharacterRig(npc.rig, {
        action: actionMap[npc.data.archetype] || 'idle',
        phase: t + npc.phase,
      });

      if (npc.rig.hoverArrow) {
        npc.rig.hoverArrow.position.y = 0.65 + Math.sin(t * 3 + i) * 0.08;
      }
    }
  }

  private updatePedestrians(delta: number) {
    const t = this.clock.getElapsedTime();
    const camPos = this.camera.position;

    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      const pos = p.rig.root.position;
      if (Math.hypot(pos.x - camPos.x, pos.z - camPos.z) > 85) continue;

      if (p.chatPauseTimer > 0) {
        p.chatPauseTimer = Math.max(0, p.chatPauseTimer - delta);
        animateCharacterRig(p.rig, { action: 'talk', phase: t + p.phase });
        continue;
      }

      if (p.axis === 'z') {
        pos.z += p.speed * p.direction * delta;
        if (pos.z > p.maxRange) p.direction = -1;
        else if (pos.z < p.minRange) p.direction = 1;
        p.rig.root.rotation.y = p.direction > 0 ? 0 : Math.PI;
      } else {
        pos.x += p.speed * p.direction * delta;
        if (pos.x > p.maxRange) p.direction = -1;
        else if (pos.x < p.minRange) p.direction = 1;
        p.rig.root.rotation.y = p.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
      }

      // Check occasional friendly street chat pause between nearby pedestrians
      for (let j = i + 1; j < this.pedestrians.length; j++) {
        const other = this.pedestrians[j];
        if (other.chatPauseTimer > 0) continue;
        const d = Math.hypot(pos.x - other.rig.root.position.x, pos.z - other.rig.root.position.z);
        if (d < 1.25 && Math.sin(t * 2 + i) > 0.94) {
          p.chatPauseTimer = 2.6;
          other.chatPauseTimer = 2.6;
          p.rig.root.rotation.y = Math.atan2(other.rig.root.position.x - pos.x, other.rig.root.position.z - pos.z);
          other.rig.root.rotation.y = Math.atan2(pos.x - other.rig.root.position.x, pos.z - other.rig.root.position.z);
          break;
        }
      }

      animateCharacterRig(p.rig, {
        action: p.isFemale ? 'female_stroll' : 'walk',
        speedRatio: 0.72,
        phase: t * 6.5 + p.phase,
      });
    }
  }

  private updatePolicePatrol(delta: number) {
    const store = useGameStore.getState();
    if (!this.playerRig || this.policeAgents.length === 0) return;

    const playerPos = this.playerRig.root.position;
    const policeStatus = store.policeState.status;
    const t = this.clock.getElapsedTime();

    // Detect police phase transitions
    if (policeStatus !== this.prevPoliceStatus) {
      this.prevPoliceStatus = policeStatus;
      if (policeStatus === 'arriving') {
        this.policePhaseTimer = 5.0;
      } else if (policeStatus === 'chasing') {
        this.policePhaseTimer = 7.0;
        // Bring nearest police officer within ~16m behind the player so chase is visible anywhere in the city
        let nearestIdx = 0;
        let minDist = Infinity;
        this.policeAgents.forEach((cop, idx) => {
          const d = Math.hypot(cop.rig.root.position.x - playerPos.x, cop.rig.root.position.z - playerPos.z);
          if (d < minDist) {
            minDist = d;
            nearestIdx = idx;
          }
        });
        const chaser = this.policeAgents[nearestIdx];
        if (chaser && (minDist > 24 || minDist < 6)) {
          const backAngle = this.playerRig.root.rotation.y + Math.PI;
          const rawX = Math.max(-212, Math.min(212, playerPos.x + Math.sin(backAngle) * 16));
          const rawZ = Math.max(-212, Math.min(212, playerPos.z + Math.cos(backAngle) * 16));
          const [sx, sz] = this.resolveCollisions(rawX, rawZ, 0.55);
          chaser.rig.root.position.set(sx, 0, sz);
        }
      } else if (policeStatus === 'caught') {
        this.policePhaseTimer = 2.0;
      } else {
        this.policePhaseTimer = 0;
      }
    }

    // Tick active arrival (5s), chase (7s), or caught-notice delay (2s) during active gameplay
    if (store.gameMode === 'playing' && store.activeModal === null) {
      if (policeStatus === 'arriving') {
        this.policePhaseTimer -= delta;
        store.setPoliceDisplaySec(Math.max(1, Math.ceil(this.policePhaseTimer)));
        if (this.policePhaseTimer <= 0) {
          store.activateArrivedPoliceChase();
        }
      } else if (policeStatus === 'chasing') {
        this.policePhaseTimer -= delta;
        store.setPoliceDisplaySec(Math.max(1, Math.ceil(this.policePhaseTimer)));
        if (this.policePhaseTimer <= 0) {
          store.endPoliceChase();
        }
      } else if (policeStatus === 'caught') {
        this.policePhaseTimer -= delta;
        if (this.policePhaseTimer <= 0) {
          store.showPoliceEncounterNotice();
          this.teleportPlayer([-18, 0, 84]);
          return;
        }
      }
    }

    const isActivelyChasing =
      store.policeState.status === 'chasing' &&
      store.gameMode === 'playing' &&
      store.activeModal === null;

    this.policeAgents.forEach((cop, idx) => {
      const copPos = cop.rig.root.position;
      const dist = Math.hypot(copPos.x - playerPos.x, copPos.z - playerPos.z);

      if (
        (policeStatus === 'caught' && idx === this.catchingCopIdx) ||
        (store.activeModal === 'police_encounter' && idx === 0)
      ) {
        const dx = playerPos.x - copPos.x;
        const dz = playerPos.z - copPos.z;
        cop.rig.root.rotation.y = Math.atan2(dx, dz);
        this.animateRig(cop.rig, 0, false, 0, t, 'police_alert');
        return;
      }

      if (isActivelyChasing && dist < 56) {
        const dirX = playerPos.x - copPos.x;
        const dirZ = playerPos.z - copPos.z;
        const len = Math.max(0.001, Math.hypot(dirX, dirZ));
        const copSpeed = 5.4 + store.playerStats.wantedStars * 0.55;
        const nextX = copPos.x + (dirX / len) * copSpeed * delta;
        const nextZ = copPos.z + (dirZ / len) * copSpeed * delta;
        const [rx, rz] = this.resolveCollisions(nextX, nextZ, 0.45);
        copPos.x = rx;
        copPos.z = rz;
        cop.rig.root.rotation.y = Math.atan2(dirX, dirZ);
        this.animateRig(cop.rig, 1.25, false, 0, t * 12 + idx);

        if (dist < 1.85) {
          this.catchingCopIdx = idx;
          store.caughtByPolice();
        }
      } else {
        const offset = Math.sin(t * 0.7 + idx * 2) * 10;
        const targetZ = cop.homePos.z + offset;
        const prevZ = copPos.z;
        copPos.z = THREE.MathUtils.damp(copPos.z, targetZ, 3, delta);
        copPos.x = THREE.MathUtils.damp(copPos.x, cop.homePos.x, 3, delta);
        cop.rig.root.rotation.y = copPos.z >= prevZ ? 0 : Math.PI;
        this.animateRig(cop.rig, 0.6, false, 0, t * 6 + idx);
      }
    });
  }

  private updateTraffic(delta: number) {
    for (const v of this.trafficVehicles) {
      if (v.axis === 'z') {
        v.mesh.position.z += v.speed * v.direction * delta;
        if (v.direction > 0 && v.mesh.position.z > v.maxRange) v.mesh.position.z = v.minRange;
        else if (v.direction < 0 && v.mesh.position.z < v.minRange) v.mesh.position.z = v.maxRange;
      } else {
        v.mesh.position.x += v.speed * v.direction * delta;
        if (v.direction > 0 && v.mesh.position.x > v.maxRange) v.mesh.position.x = v.minRange;
        else if (v.direction < 0 && v.mesh.position.x < v.minRange) v.mesh.position.x = v.maxRange;
      }
    }
  }

  private updateDebris(delta: number) {
    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      p.life -= delta * 1.4;
      p.vel.y -= 14 * delta;
      p.mesh.position.addScaledVector(p.vel, delta);
      p.mesh.rotation.x += delta * 6;
      p.mesh.rotation.y += delta * 5;
      p.mesh.scale.setScalar(Math.max(0.01, p.life));

      if (p.life <= 0 || p.mesh.position.y < -0.5) {
        this.scene.remove(p.mesh);
        this.debrisParticles.splice(i, 1);
      }
    }
  }

  public handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private afterDraw(fn: () => void) {
    if (this.isSoftwareGl) {
      // Allow browser compositor/events breathing room on software WebGL
      this.softwareTimerId = window.setTimeout(() => {
        if (!this.isDestroyed) {
          this.animationFrameId = requestAnimationFrame(fn);
        }
      }, 16);
    } else {
      this.animationFrameId = requestAnimationFrame(fn);
    }
  }

  private updateShopKeepers(delta: number) {
    const store = useGameStore.getState();
    const t = this.clock.getElapsedTime();

    this.shopKeepers.forEach((entry, shopId) => {
      const isBrawlTarget = store.activeBrawl?.shopId === shopId;
      const surrendered = isBrawlTarget && store.activeBrawl?.surrendered;

      if (entry.hitTimer > 0) {
        entry.hitTimer = Math.max(0, entry.hitTimer - delta);
        entry.rig.torsoGroup.rotation.x = -0.45 * Math.sin(entry.hitTimer * 18);
        entry.rig.leftArmPivot.rotation.x = -2.1;
        entry.rig.rightArmPivot.rotation.x = -2.1;
        return;
      }

      if (surrendered) {
        // Surrender: arms up in comic fear!
        entry.rig.torsoGroup.rotation.x = 0.12;
        entry.rig.leftArmPivot.rotation.x = -2.5;
        entry.rig.rightArmPivot.rotation.x = -2.5;
      } else if (isBrawlTarget) {
        // Fighting back pose!
        const punch = Math.sin(t * 14);
        entry.rig.torsoGroup.rotation.x = 0.1;
        entry.rig.leftArmPivot.rotation.x = -1.2 + punch * 0.7;
        entry.rig.rightArmPivot.rotation.x = -1.2 - punch * 0.7;
      } else {
        const keeperAction: CharacterAnimAction | undefined =
          entry.category === 'tea'
            ? 'tea_serve'
            : entry.category === 'grocery' || entry.category === 'vegetable' || entry.category === 'bakery'
            ? 'grocer_counter'
            : undefined;
        this.animateRig(entry.rig, 0, false, 0, t + shopId.length, keeperAction);
      }
    });
  }

  private tick = () => {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);

    this.updatePlayer(delta);
    this.updateCamera(delta);
    this.updateLightingAndWeather(delta);
    this.updateWorldNPCs(delta);
    this.updatePedestrians(delta);
    this.updatePolicePatrol(delta);
    this.updateShopKeepers(delta);
    this.updateTraffic(delta);
    this.updateDebris(delta);
    this.updateNearbyInteractions(delta);

    this.renderer.render(this.scene, this.camera);
    this.afterDraw(this.tick);
  };

  public teleportPlayer(position: [number, number, number]) {
    if (this.playerRig) {
      const [rx, rz] = this.resolveCollisions(position[0], position[2], 0.5);
      this.playerRig.root.position.set(rx, 0.2, rz);
      this.playerVelocity.set(0, 0, 0);
      useGameStore.getState().setPlayerPosition([rx, 0, rz]);
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.softwareTimerId !== null) {
      clearTimeout(this.softwareTimerId);
    }
    if (this.unsubStore) {
      this.unsubStore();
    }
    if (this.cleanupListeners) {
      this.cleanupListeners();
    }
    if (this.onContextLostHandler) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLostHandler);
      this.onContextLostHandler = null;
    }
    window.removeEventListener('resize', this.handleResize);

    disposeCharacterRig(this.playerRig);
    this.worldNpcs.forEach((n) => disposeCharacterRig(n.rig));
    this.policeAgents.forEach((p) => disposeCharacterRig(p.rig));
    this.pedestrians.forEach((p) => disposeCharacterRig(p.rig));
    this.shopKeepers.forEach((s) => disposeCharacterRig(s.rig));
    disposeCharacterTextures();

    this.envTarget?.dispose();
    this.envTarget = null;
    this.debrisGeo.dispose();
    this.debrisMaterials.forEach((m) => m.dispose());
    this.debrisMaterials.clear();
    if (this.rainParticles) {
      this.rainParticles.geometry.dispose();
      (this.rainParticles.material as THREE.Material).dispose();
    }

    // Traverse and dispose geometries, materials, and CanvasTextures
    const disposedTextures = new Set<THREE.Texture>();
    const disposeMaterial = (mat: THREE.Material) => {
      const stdMat = mat as THREE.MeshStandardMaterial;
      if (stdMat.map && !disposedTextures.has(stdMat.map)) {
        disposedTextures.add(stdMat.map);
        stdMat.map.dispose();
      }
      if (stdMat.emissiveMap && !disposedTextures.has(stdMat.emissiveMap)) {
        disposedTextures.add(stdMat.emissiveMap);
        stdMat.emissiveMap.dispose();
      }
      mat.dispose();
    };

    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(disposeMaterial);
        } else if (mesh.material) {
          disposeMaterial(mesh.material);
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
