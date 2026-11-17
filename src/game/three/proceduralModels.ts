import * as THREE from 'three';
import { ShopData, VehicleData, DestructibleObject } from '../../types/game';
import {
  createBengaliSignTexture,
  createBuildingFacadeTexture,
  createRickshawArtTexture,
  createTinRoofTexture,
  createAwningTexture,
  createCurbTexture,
  createMetroPosterTexture,
  createMetroStationSignTexture,
} from './materials';

import {
  StylizedCharacterRig,
  buildStylizedCharacter,
  createNPCCharacter,
} from './characterSystem';

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 14);
const sphereGeo = new THREE.SphereGeometry(1, 14, 12);
const coneGeo = new THREE.ConeGeometry(1, 1, 12);

// Shared reusable PBR materials
const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.88 });
const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.78, roughness: 0.32 });
const blackRubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xbae6fd,
  transparent: true,
  opacity: 0.65,
  roughness: 0.12,
});
const brassMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.85, roughness: 0.25 });
const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export type ArticulatedCharacterRig = StylizedCharacterRig;

// ==========================================
// 1. ARTICULATED CARTOON CHARACTERS (UNIFIED SYSTEM)
// ==========================================

export function createArticulatedCharacter(options: {
  shirtColor?: number;
  bottomColor?: number;
  hatType?: string;
  glassesType?: string;
  showMarkerArrow?: boolean;
  skinColor?: number;
  isPolice?: boolean;
}): ArticulatedCharacterRig {
  if (options.isPolice) {
    return createNPCCharacter('police_officer', {
      showMarkerArrow: options.showMarkerArrow,
    });
  }

  const shirtHex = '#' + (options.shirtColor ?? 0xdc2626).toString(16).padStart(6, '0');
  const bottomHex = '#' + (options.bottomColor ?? 0x16a34a).toString(16).padStart(6, '0');

  return buildStylizedCharacter({
    bodyType: 'regular',
    shirtStyle: 'solid',
    shirtHex,
    bottomStyle: 'solid',
    bottomHex,
    skinHex: options.skinColor,
    hairStyle: 'short_parted',
    beardStyle: 'light_beard',
    hatStyle: options.hatType || 'none',
    glassesStyle: options.glassesType || 'none',
    shoesStyle: 'sandals',
    showMarkerArrow: options.showMarkerArrow,
  });
}

// ==========================================
// 2. DETAILED 2-STORY BANGLADESHI SHOPS
// ==========================================

export function createShopModel(shop: ShopData): {
  group: THREE.Group;
  collider: BoxCollider;
  keeperRig: ArticulatedCharacterRig;
} {
  const group = new THREE.Group();
  group.name = shop.id;

  const palette: Record<ShopData['category'], { wall: string; awning: string; sign: string }> = {
    tea: { wall: '#d97706', awning: '#ea580c', sign: '#78350f' },
    grocery: { wall: '#0284c7', awning: '#2563eb', sign: '#075985' },
    restaurant: { wall: '#b91c1c', awning: '#dc2626', sign: '#7f1d1d' },
    clothing: { wall: '#7e22ce', awning: '#9333ea', sign: '#4c1d95' },
    electronics: { wall: '#1d4ed8', awning: '#0f172a', sign: '#0f172a' },
    vegetable: { wall: '#15803d', awning: '#16a34a', sign: '#14532d' },
    pharmacy: { wall: '#0f766e', awning: '#059669', sign: '#064e3b' },
    mobile: { wall: '#be185d', awning: '#db2777', sign: '#831843' },
    hardware: { wall: '#475569', awning: '#d97706', sign: '#1e293b' },
    bakery: { wall: '#ea580c', awning: '#f59e0b', sign: '#9a3412' },
    salon: { wall: '#0891b2', awning: '#ef4444', sign: '#164e63' },
    furniture: { wall: '#92400e', awning: '#b45309', sign: '#451a03' },
    books: { wall: '#4338ca', awning: '#3b82f6', sign: '#1e1b4b' },
    tailor: { wall: '#9d174d', awning: '#ec4899', sign: '#500724' },
    gold: { wall: '#b45309', awning: '#facc15', sign: '#713f12' },
  };
  const colors = palette[shop.category] || palette.grocery;

  // Ground + 2nd Floor Facade
  const facadeTex = createBuildingFacadeTexture(colors.wall, '#f8fafc', 2, false);
  const wallMat = new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.72 });

  const body = new THREE.Mesh(boxGeo, wallMat);
  body.scale.set(6.4, 7.2, 5.4);
  body.position.y = 3.6;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Upper 2nd-floor balcony railing (typical Dhaka shop building)
  const balconyDeck = new THREE.Mesh(boxGeo, darkConcreteMat);
  balconyDeck.scale.set(6.6, 0.22, 1.3);
  balconyDeck.position.set(0, 4.1, 3.15);
  balconyDeck.castShadow = true;
  group.add(balconyDeck);

  const balconyRail = new THREE.Mesh(boxGeo, metalMat);
  balconyRail.scale.set(6.5, 0.75, 0.1);
  balconyRail.position.set(0, 4.55, 3.72);
  group.add(balconyRail);

  // Ground-floor dark interior recess + wood counter
  const interiorBack = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
  interiorBack.scale.set(5.4, 2.9, 0.2);
  interiorBack.position.set(0, 1.5, 2.65);
  group.add(interiorBack);

  const counter = new THREE.Mesh(boxGeo, darkWoodMat);
  counter.scale.set(5.2, 1.05, 1.0);
  counter.position.set(0, 0.52, 2.9);
  counter.castShadow = true;
  group.add(counter);

  // Shopkeeper NPC standing right by front counter using stylized archetypes
  const keeper =
    shop.category === 'tea'
      ? createNPCCharacter('tea_vendor')
      : shop.category === 'grocery' || shop.category === 'vegetable' || shop.category === 'bakery'
      ? createNPCCharacter('grocer')
      : buildStylizedCharacter({
          bodyType: 'regular',
          shirtStyle: shop.category === 'restaurant' ? 'white_punjabi' : 'solid',
          shirtHex: shop.category === 'gold' ? '#eab308' : shop.category === 'pharmacy' ? '#0d9488' : '#38bdf8',
          bottomStyle: shop.category === 'restaurant' ? 'check_lungi' : 'black_cargo',
          hairStyle: 'short_parted',
          beardStyle: 'thick_moustache',
          hatStyle: shop.category === 'restaurant' ? 'topi' : 'none',
          shoesStyle: 'sandals',
        });
  keeper.root.position.set(1.6, 0.16, 3.65);
  group.add(keeper.root);

  // Striped Awning
  const awningTex = createAwningTexture(colors.awning, '#fef9c3');
  const awning = new THREE.Mesh(
    boxGeo,
    new THREE.MeshStandardMaterial({ map: awningTex, roughness: 0.5 })
  );
  awning.scale.set(6.6, 0.14, 2.1);
  awning.position.set(0, 3.25, 3.6);
  awning.rotation.x = 0.24;
  awning.castShadow = true;
  group.add(awning);

  // Glowing Bengali Neon Signboard
  const signTex = createBengaliSignTexture(
    shop.nameBn,
    `মালিক: ${shop.ownerName} • [F] ভাঙচুর`,
    colors.sign,
    '#ffffff',
    shop.hasTask ? '#34d399' : '#facc15'
  );
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: signTex,
    emissiveIntensity: 0.48,
    roughness: 0.3,
  });
  const signboard = new THREE.Mesh(boxGeo, signMat);
  signboard.scale.set(5.8, 1.35, 0.16);
  signboard.position.set(0, 3.85, 2.8);
  signboard.castShadow = true;
  group.add(signboard);

  // Tin / Concrete Roof with rooftop water tank (পানির ট্যাংক - iconic Dhaka!)
  const tinTex = createTinRoofTexture();
  const roof = new THREE.Mesh(
    boxGeo,
    new THREE.MeshStandardMaterial({ map: tinTex, roughness: 0.5, metalness: 0.4 })
  );
  roof.scale.set(6.8, 0.28, 5.8);
  roof.position.set(0, 7.3, 0);
  roof.castShadow = true;
  group.add(roof);

  const waterTank = new THREE.Mesh(
    cylinderGeo,
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
  );
  waterTank.scale.set(0.75, 1.3, 0.75);
  waterTank.position.set(-1.6, 8.1, -1.2);
  waterTank.castShadow = true;
  group.add(waterTank);

  // Warm shop hanging bulb (mesh only — cheap lighting via scene sun/hemi + emissive)
  const bulb = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  bulb.scale.set(0.18, 0.18, 0.18);
  bulb.position.set(0, 2.9, 3.0);
  group.add(bulb);

  // Category signature props on counter
  if (shop.category === 'tea') {
    const kettle = new THREE.Mesh(cylinderGeo, brassMat);
    kettle.scale.set(0.28, 0.42, 0.28);
    kettle.position.set(-1.4, 1.25, 2.95);
    group.add(kettle);
  } else if (shop.category === 'restaurant') {
    const degchi = new THREE.Mesh(cylinderGeo, metalMat);
    degchi.scale.set(0.45, 0.5, 0.45);
    degchi.position.set(-1.5, 1.3, 2.95);
    group.add(degchi);
  } else if (shop.category === 'pharmacy') {
    const crossV = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    crossV.scale.set(0.22, 0.65, 0.1);
    crossV.position.set(2.5, 4.9, 2.8);
    group.add(crossV);
    const crossH = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    crossH.scale.set(0.65, 0.22, 0.1);
    crossH.position.set(2.5, 4.9, 2.8);
    group.add(crossH);
  }

  group.position.set(...shop.position);
  group.rotation.y = shop.rotation;

  // Compute rotated world-space AABB collider
  const halfW = Math.abs(Math.cos(shop.rotation)) * 3.3 + Math.abs(Math.sin(shop.rotation)) * 2.8;
  const halfD = Math.abs(Math.sin(shop.rotation)) * 3.3 + Math.abs(Math.cos(shop.rotation)) * 2.8;

  return {
    group,
    collider: {
      minX: shop.position[0] - halfW,
      maxX: shop.position[0] + halfW,
      minZ: shop.position[2] - halfD,
      maxZ: shop.position[2] + halfD,
    },
    keeperRig: keeper,
  };
}

// ==========================================
// 3. MULTI-STORY URBAN BUILDINGS & LANDMARKS
// ==========================================

export function createUrbanBuilding(
  x: number,
  z: number,
  width: number,
  depth: number,
  floors: number,
  wallHex: string,
  trimHex = '#f8fafc'
): { group: THREE.Group; collider: BoxCollider } {
  const group = new THREE.Group();
  const floorHeight = 3.2;
  const totalHeight = floors * floorHeight;

  const facadeTex = createBuildingFacadeTexture(wallHex, trimHex, floors, true);
  const mat = new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.78 });

  const body = new THREE.Mesh(boxGeo, mat);
  body.scale.set(width, totalHeight, depth);
  body.position.y = totalHeight / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Rooftop parapet wall
  const roof = new THREE.Mesh(boxGeo, darkConcreteMat);
  roof.scale.set(width + 0.3, 0.35, depth + 0.3);
  roof.position.y = totalHeight + 0.15;
  group.add(roof);

  // Rooftop black water tank
  const tank = new THREE.Mesh(cylinderGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }));
  tank.scale.set(0.65, 1.1, 0.65);
  tank.position.set(width * 0.25, totalHeight + 0.85, -depth * 0.2);
  group.add(tank);

  group.position.set(x, 0, z);
  return {
    group,
    collider: {
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2,
    },
  };
}

export function createMosqueSkylineLandmark(x: number, z: number): { group: THREE.Group; collider: BoxCollider } {
  const group = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 });
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.35, roughness: 0.4 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6 });

  const hall = new THREE.Mesh(boxGeo, marbleMat);
  hall.scale.set(16, 10, 14);
  hall.position.y = 5;
  hall.castShadow = true;
  hall.receiveShadow = true;
  group.add(hall);

  const trim = new THREE.Mesh(boxGeo, accentMat);
  trim.scale.set(16.4, 0.8, 14.4);
  trim.position.y = 10.1;
  group.add(trim);

  // Grand Central Dome
  const dome = new THREE.Mesh(sphereGeo, domeMat);
  dome.scale.set(5.2, 4.8, 5.2);
  dome.position.set(0, 12.2, 0);
  dome.castShadow = true;
  group.add(dome);

  const spire = new THREE.Mesh(cylinderGeo, brassMat);
  spire.scale.set(0.18, 2.2, 0.18);
  spire.position.set(0, 17.5, 0);
  group.add(spire);

  // Twin Minarets
  [-7.5, 7.5].forEach((mx) => {
    const tower = new THREE.Mesh(cylinderGeo, marbleMat);
    tower.scale.set(1.2, 20, 1.2);
    tower.position.set(mx, 10, 5.5);
    tower.castShadow = true;
    group.add(tower);

    const cap = new THREE.Mesh(sphereGeo, domeMat);
    cap.scale.set(1.3, 1.4, 1.3);
    cap.position.set(mx, 20.6, 5.5);
    group.add(cap);
  });

  group.position.set(x, 0, z);
  return {
    group,
    collider: { minX: x - 8, maxX: x + 8, minZ: z - 7, maxZ: z + 7 },
  };
}

export function createPoliceStationLandmark(x: number, z: number): { group: THREE.Group; collider: BoxCollider } {
  const group = new THREE.Group();
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

  const body = new THREE.Mesh(boxGeo, whiteMat);
  body.scale.set(12, 6.5, 9);
  body.position.y = 3.25;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const stripe = new THREE.Mesh(boxGeo, blueMat);
  stripe.scale.set(12.2, 1.4, 9.2);
  stripe.position.y = 5.6;
  group.add(stripe);

  const signTex = createBengaliSignTexture('কোতোয়ালী মডেল থানা', 'Chanda City Police HQ', '#1e3a8a', '#ffffff', '#60a5fa');
  const sign = new THREE.Mesh(
    boxGeo,
    new THREE.MeshStandardMaterial({ map: signTex, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.35 })
  );
  sign.scale.set(8, 1.8, 0.2);
  sign.position.set(0, 4.4, -4.65);
  group.add(sign);

  group.position.set(x, 0, z);
  return {
    group,
    collider: { minX: x - 6, maxX: x + 6, minZ: z - 4.5, maxZ: z + 4.5 },
  };
}

export function createShoppingMallLandmark(x: number, z: number): { group: THREE.Group; collider: BoxCollider } {
  const group = new THREE.Group();
  const facadeTex = createBuildingFacadeTexture('#312e81', '#a855f7', 4, false);
  const body = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.5 }));
  body.scale.set(16, 13, 12);
  body.position.y = 6.5;
  body.castShadow = true;
  group.add(body);

  const atrium = new THREE.Mesh(boxGeo, glassMat);
  atrium.scale.set(6, 11, 0.4);
  atrium.position.set(0, 5.5, -6.1);
  group.add(atrium);

  const signTex = createBengaliSignTexture('চান্দা প্লাজা শপিং মল', 'শপিং, ফ্যাশন ও ইলেকট্রনিক্স', '#581c87', '#fef08a', '#ec4899');
  const sign = new THREE.Mesh(
    boxGeo,
    new THREE.MeshStandardMaterial({ map: signTex, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.5 })
  );
  sign.scale.set(10, 2.2, 0.2);
  sign.position.set(0, 11.2, -6.2);
  group.add(sign);

  group.position.set(x, 0, z);
  return {
    group,
    collider: { minX: x - 8, maxX: x + 8, minZ: z - 6, maxZ: z + 6 },
  };
}

export function createPlayerHQLandmark(x: number, z: number): { group: THREE.Group; collider: BoxCollider } {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
  const body = new THREE.Mesh(boxGeo, wallMat);
  body.scale.set(12, 9, 10);
  body.position.y = 4.5;
  body.castShadow = true;
  group.add(body);

  const goldTrim = new THREE.Mesh(boxGeo, brassMat);
  goldTrim.scale.set(12.4, 0.6, 10.4);
  goldTrim.position.y = 9.0;
  group.add(goldTrim);

  const crown = new THREE.Mesh(cylinderGeo, brassMat);
  crown.scale.set(1.8, 1.5, 1.8);
  crown.position.set(0, 10.1, 0);
  group.add(crown);

  const signTex = createBengaliSignTexture('বসের আস্তানা (HQ)', 'চান্দা সাম্রাজ্যের সদর দপ্তর', '#78350f', '#fef08a', '#facc15');
  const sign = new THREE.Mesh(
    boxGeo,
    new THREE.MeshStandardMaterial({ map: signTex, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.5 })
  );
  sign.scale.set(8.5, 1.9, 0.2);
  sign.position.set(0, 6.2, 5.15);
  group.add(sign);

  group.position.set(x, 0, z);
  return {
    group,
    collider: { minX: x - 6, maxX: x + 6, minZ: z - 5, maxZ: z + 5 },
  };
}

export function createRoadsideUmbrellaStall(x: number, z: number, colorHex = 0xef4444): THREE.Group {
  const group = new THREE.Group();
  const table = new THREE.Mesh(boxGeo, woodMat);
  table.scale.set(1.8, 0.85, 1.1);
  table.position.y = 0.42;
  table.castShadow = true;
  group.add(table);

  const pole = new THREE.Mesh(cylinderGeo, metalMat);
  pole.scale.set(0.05, 2.7, 0.05);
  pole.position.y = 1.35;
  group.add(pole);

  const canopy = new THREE.Mesh(coneGeo, new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.55 }));
  canopy.scale.set(1.65, 0.55, 1.65);
  canopy.position.y = 2.75;
  canopy.castShadow = true;
  group.add(canopy);

  group.position.set(x, 0, z);
  return group;
}

export function createElectricPolesAndWires(): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.4 });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  const zNodes = [-196, -168, -140, -112, -84, -56, -28, 28, 56, 84, 112, 140, 168, 196];
  [-10.2, 10.2].forEach((xSide) => {
    zNodes.forEach((zPos, i) => {
      const pole = new THREE.Mesh(cylinderGeo, poleMat);
      pole.scale.set(0.14, 7.2, 0.14);
      pole.position.set(xSide, 3.6, zPos);
      group.add(pole);

      const crossbar = new THREE.Mesh(boxGeo, poleMat);
      crossbar.scale.set(1.2, 0.1, 0.1);
      crossbar.position.set(xSide, 6.8, zPos);
      group.add(crossbar);

      // Connect sagging overhead power cables to next pole
      if (i < zNodes.length - 1) {
        const nextZ = zNodes[i + 1];
        [-0.45, 0.45].forEach((wireOffset) => {
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(xSide + wireOffset, 6.75, zPos),
            new THREE.Vector3(xSide + wireOffset, 5.75, (zPos + nextZ) / 2),
            new THREE.Vector3(xSide + wireOffset, 6.75, nextZ),
          ]);
          const cableGeo = new THREE.TubeGeometry(curve, 10, 0.03, 4, false);
          const cable = new THREE.Mesh(cableGeo, wireMat);
          group.add(cable);
        });
      }
    });
  });

  // Overhead wires crossing the main street at key spots (Dhaka street aesthetic)
  [-184, -126, -78, -48, -22, 22, 48, 78, 126, 184].forEach((zCross) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10.2, 6.7, zCross),
      new THREE.Vector3(0, 6.0, zCross),
      new THREE.Vector3(10.2, 6.7, zCross),
    ]);
    const cableGeo = new THREE.TubeGeometry(curve, 12, 0.035, 4, false);
    group.add(new THREE.Mesh(cableGeo, wireMat));
  });

  return group;
}

// ==========================================
// 4. BANGLADESHI VEHICLES
// ==========================================

export function createRickshawModel(vehicle?: VehicleData): THREE.Group {
  const group = new THREE.Group();
  if (vehicle) group.name = vehicle.id;

  const chassis = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 }));
  chassis.scale.set(1.4, 0.12, 2.4);
  chassis.position.set(0, 0.5, 0);
  chassis.castShadow = true;
  group.add(chassis);

  const seat = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 }));
  seat.scale.set(1.3, 0.32, 0.9);
  seat.position.set(0, 0.8, -0.4);
  seat.castShadow = true;
  group.add(seat);

  const hood = new THREE.Mesh(cylinderGeo, new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }));
  hood.scale.set(0.7, 1.32, 0.7);
  hood.position.set(0, 1.5, -0.5);
  hood.rotation.z = Math.PI / 2;
  hood.rotation.y = Math.PI / 2;
  hood.castShadow = true;
  group.add(hood);

  const artTex = createRickshawArtTexture();
  const backboard = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.3 }));
  backboard.scale.set(1.22, 0.78, 0.06);
  backboard.position.set(0, 0.9, -1.22);
  group.add(backboard);

  [
    [-0.75, 0.48, -0.5],
    [0.75, 0.48, -0.5],
    [0, 0.48, 1.2],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(cylinderGeo, blackRubberMat);
    wheel.scale.set(0.48, 0.09, 0.48);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
  });

  const bar = new THREE.Mesh(boxGeo, metalMat);
  bar.scale.set(0.8, 0.05, 0.05);
  bar.position.set(0, 1.1, 1.0);
  group.add(bar);

  const bell = new THREE.Mesh(sphereGeo, brassMat);
  bell.scale.set(0.08, 0.08, 0.08);
  bell.position.set(0.3, 1.15, 1.0);
  group.add(bell);

  if (vehicle) {
    group.position.set(...vehicle.position);
    group.rotation.y = vehicle.rotation;
  }
  return group;
}

export function createCNGModel(vehicle?: VehicleData): THREE.Group {
  const group = new THREE.Group();
  if (vehicle) group.name = vehicle.id;

  const cngBodyMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
  const lowerBody = new THREE.Mesh(boxGeo, cngBodyMat);
  lowerBody.scale.set(1.5, 0.85, 2.45);
  lowerBody.position.set(0, 0.68, 0);
  lowerBody.castShadow = true;
  group.add(lowerBody);

  // Curved mudguard nose
  const nose = new THREE.Mesh(cylinderGeo, cngBodyMat);
  nose.scale.set(0.45, 0.8, 0.45);
  nose.position.set(0, 0.6, 1.15);
  group.add(nose);

  const roof = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 }));
  roof.scale.set(1.45, 0.68, 2.35);
  roof.position.set(0, 1.42, -0.05);
  roof.castShadow = true;
  group.add(roof);

  const cageMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6, roughness: 0.4 });
  [-0.73, 0.73].forEach((cx) => {
    const cage = new THREE.Mesh(boxGeo, cageMat);
    cage.scale.set(0.05, 0.58, 1.1);
    cage.position.set(cx, 1.2, -0.1);
    group.add(cage);
  });

  const windshield = new THREE.Mesh(boxGeo, glassMat);
  windshield.scale.set(1.3, 0.5, 0.08);
  windshield.position.set(0, 1.32, 1.16);
  windshield.rotation.x = -0.2;
  group.add(windshield);

  const headlight = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  headlight.scale.set(0.18, 0.18, 0.18);
  headlight.position.set(0, 0.72, 1.32);
  group.add(headlight);

  [
    [-0.8, 0.35, -0.7],
    [0.8, 0.35, -0.7],
    [0, 0.35, 1.05],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(cylinderGeo, blackRubberMat);
    wheel.scale.set(0.35, 0.15, 0.35);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
  });

  if (vehicle) {
    group.position.set(...vehicle.position);
    group.rotation.y = vehicle.rotation;
  }
  return group;
}

export function createMurirTinBusModel(vehicle?: VehicleData): THREE.Group {
  const group = new THREE.Group();
  if (vehicle) group.name = vehicle.id;

  const busBody = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }));
  busBody.scale.set(2.8, 2.4, 8.2);
  busBody.position.set(0, 1.8, 0);
  busBody.castShadow = true;
  busBody.receiveShadow = true;
  group.add(busBody);

  const stripe = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }));
  stripe.scale.set(2.84, 0.4, 8.24);
  stripe.position.set(0, 1.5, 0);
  group.add(stripe);

  [-1.41, 1.41].forEach((wx) => {
    const win = new THREE.Mesh(boxGeo, glassMat);
    win.scale.set(0.1, 0.72, 6.5);
    win.position.set(wx, 2.1, -0.2);
    group.add(win);
  });

  const frontGlass = new THREE.Mesh(boxGeo, glassMat);
  frontGlass.scale.set(2.4, 0.9, 0.1);
  frontGlass.position.set(0, 2.2, 4.11);
  group.add(frontGlass);

  const headerTex = createBengaliSignTexture('ফার্মগেট ➔ মিরপুর ১০', 'লোকাল সুপার এক্সপ্রেস', '#15803d', '#ffffff');
  const headerBoard = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ map: headerTex, roughness: 0.3 }));
  headerBoard.scale.set(2.2, 0.6, 0.15);
  headerBoard.position.set(0, 2.8, 4.12);
  group.add(headerBoard);

  // Headlights
  [-0.95, 0.95].forEach((hx) => {
    const hl = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    hl.scale.set(0.22, 0.22, 0.12);
    hl.position.set(hx, 1.0, 4.12);
    group.add(hl);
  });

  const rack = new THREE.Mesh(boxGeo, darkWoodMat);
  rack.scale.set(2.2, 0.25, 6.0);
  rack.position.set(0, 3.1, -0.5);
  group.add(rack);

  [
    [-1.4, 0.6, 2.5],
    [1.4, 0.6, 2.5],
    [-1.4, 0.6, -1.8],
    [1.4, 0.6, -1.8],
    [-1.4, 0.6, -2.8],
    [1.4, 0.6, -2.8],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(cylinderGeo, blackRubberMat);
    wheel.scale.set(0.6, 0.25, 0.6);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
  });

  if (vehicle) {
    group.position.set(...vehicle.position);
    group.rotation.y = vehicle.rotation;
  }
  return group;
}

export function createDeliveryVanModel(vehicle?: VehicleData): THREE.Group {
  const group = new THREE.Group();
  if (vehicle) group.name = vehicle.id;

  const vanMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 });
  const cargo = new THREE.Mesh(boxGeo, vanMat);
  cargo.scale.set(2.1, 1.75, 3.2);
  cargo.position.set(0, 1.35, -0.6);
  cargo.castShadow = true;
  group.add(cargo);

  const cab = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 }));
  cab.scale.set(2.0, 1.4, 1.4);
  cab.position.set(0, 1.15, 1.65);
  cab.castShadow = true;
  group.add(cab);

  const windshield = new THREE.Mesh(boxGeo, glassMat);
  windshield.scale.set(1.75, 0.65, 0.08);
  windshield.position.set(0, 1.42, 2.36);
  group.add(windshield);

  const signTex = createBengaliSignTexture('চান্দা এক্সপ্রেস', 'পার্সেল ডেলিভারি সার্ভিস', '#9a3412', '#ffffff');
  const sidePanel = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ map: signTex }));
  sidePanel.scale.set(2.14, 0.9, 2.4);
  sidePanel.position.set(0, 1.45, -0.6);
  group.add(sidePanel);

  [
    [-1.08, 0.42, 1.5],
    [1.08, 0.42, 1.5],
    [-1.08, 0.42, -1.5],
    [1.08, 0.42, -1.5],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(cylinderGeo, blackRubberMat);
    wheel.scale.set(0.42, 0.18, 0.42);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
  });

  if (vehicle) {
    group.position.set(...vehicle.position);
    group.rotation.y = vehicle.rotation;
  }
  return group;
}

export function createPoliceCarModel(vehicle?: VehicleData): THREE.Group {
  const group = new THREE.Group();
  if (vehicle) group.name = vehicle.id;

  const policeMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
  const body = new THREE.Mesh(boxGeo, policeMat);
  body.scale.set(2.2, 1.2, 4.6);
  body.position.set(0, 1.0, 0);
  body.castShadow = true;
  group.add(body);

  const whiteStripe = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }));
  whiteStripe.scale.set(2.24, 0.7, 2.0);
  whiteStripe.position.set(0, 1.0, 0.2);
  group.add(whiteStripe);

  const sirenRed = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  sirenRed.scale.set(0.5, 0.25, 0.25);
  sirenRed.position.set(-0.35, 1.75, 0);
  group.add(sirenRed);

  const sirenBlue = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
  sirenBlue.scale.set(0.5, 0.25, 0.25);
  sirenBlue.position.set(0.35, 1.75, 0);
  group.add(sirenBlue);

  [
    [-1.15, 0.45, 1.4],
    [1.15, 0.45, 1.4],
    [-1.15, 0.45, -1.4],
    [1.15, 0.45, -1.4],
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(cylinderGeo, blackRubberMat);
    wheel.scale.set(0.45, 0.2, 0.45);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
  });

  if (vehicle) {
    group.position.set(...vehicle.position);
    group.rotation.y = vehicle.rotation;
  }
  return group;
}

export function createCarModel(colorHex = 0xf8fafc): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.25 });

  // Lower sedan chassis
  const lower = new THREE.Mesh(boxGeo, bodyMat);
  lower.scale.set(1.95, 0.68, 4.3);
  lower.position.set(0, 0.58, 0);
  lower.castShadow = true;
  group.add(lower);

  // Upper cabin
  const cabin = new THREE.Mesh(boxGeo, bodyMat);
  cabin.scale.set(1.75, 0.58, 2.25);
  cabin.position.set(0, 1.16, -0.15);
  cabin.castShadow = true;
  group.add(cabin);

  // Front & rear tinted glass
  const windshield = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
  windshield.scale.set(1.62, 0.48, 2.3);
  windshield.position.set(0, 1.15, -0.15);
  group.add(windshield);

  // Tail lights & headlights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  [-0.68, 0.68].forEach((lx) => {
    const tail = new THREE.Mesh(boxGeo, tailMat);
    tail.scale.set(0.35, 0.14, 0.06);
    tail.position.set(lx, 0.65, -2.16);
    group.add(tail);

    const head = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    head.scale.set(0.32, 0.14, 0.06);
    head.position.set(lx, 0.62, 2.16);
    group.add(head);
  });

  // Wheels
  [
    [-0.96, 0.34, 1.35],
    [0.96, 0.34, 1.35],
    [-0.96, 0.34, -1.35],
    [0.96, 0.34, -1.35],
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(cylinderGeo, blackRubberMat);
    wheel.scale.set(0.34, 0.18, 0.34);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  return group;
}

// ==========================================
// 5. DESTRUCTIBLE PROPS WITH LIVE STATE SYNC
// ==========================================

export function createDestructiblePropMesh(prop: DestructibleObject): THREE.Group {
  const group = new THREE.Group();
  group.name = prop.id;

  if (prop.type === 'signboard') {
    const post = new THREE.Mesh(boxGeo, woodMat);
    post.scale.set(0.12, 2.2, 0.12);
    post.position.set(0, 1.1, 0);
    post.castShadow = true;
    group.add(post);

    const board = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 }));
    board.scale.set(1.9, 0.85, 0.12);
    board.position.set(0, 2.1, 0);
    board.castShadow = true;
    group.add(board);
  } else if (prop.type === 'chair' || prop.type === 'table') {
    const bench = new THREE.Mesh(boxGeo, woodMat);
    bench.scale.set(1.5, 0.55, 0.65);
    bench.position.set(0, 0.28, 0);
    bench.castShadow = true;
    group.add(bench);
  } else if (prop.type === 'crate') {
    const crate = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.78 }));
    crate.scale.set(0.85, 0.65, 0.85);
    crate.position.set(0, 0.32, 0);
    crate.castShadow = true;
    group.add(crate);
  } else if (prop.type === 'barrel') {
    const drum = new THREE.Mesh(cylinderGeo, new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.4 }));
    drum.scale.set(0.45, 1.05, 0.45);
    drum.position.set(0, 0.52, 0);
    drum.castShadow = true;
    group.add(drum);
  } else {
    const pole = new THREE.Mesh(cylinderGeo, metalMat);
    pole.scale.set(0.06, 2.7, 0.06);
    pole.position.set(0, 1.35, 0);
    group.add(pole);

    const canopy = new THREE.Mesh(coneGeo, new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }));
    canopy.scale.set(1.55, 0.5, 1.55);
    canopy.position.set(0, 2.65, 0);
    canopy.castShadow = true;
    group.add(canopy);
  }

  applyDestructibleVisualState(group, prop);
  return group;
}

export function applyDestructibleVisualState(group: THREE.Group, prop: DestructibleObject) {
  group.position.set(prop.position[0], prop.position[1], prop.position[2]);
  group.rotation.set(prop.rotation[0], prop.rotation[1], prop.rotation[2]);

  if (prop.isDestroyed) {
    group.rotation.z = prop.rotation[2] + 1.15;
    group.rotation.x = prop.rotation[0] + 0.55;
    group.position.y = prop.position[1] + 0.12;
    group.scale.set(0.92, 0.65, 0.92);
  } else if (prop.health < prop.maxHealth) {
    group.rotation.z = prop.rotation[2] + 0.18;
    group.scale.set(1, 1, 1);
  } else {
    group.scale.set(1, 1, 1);
  }
}

// ==========================================
// 6. TREES, LAMPPOSTS & FLYOVER
// ==========================================

export function createCityTrees(): THREE.Group {
  const group = new THREE.Group();
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.72 });

  const treeCoords: [number, number, number][] = [
    [11, 0, 26],
    [-11, 0, 26],
    [11, 0, -40],
    [-11, 0, -40],
    [28, 0, 11],
    [-28, 0, 11],
    [34, 0, -28],
    [-34, 0, 28],
    [54, 0, -14],
    [-54, 0, -14],
    [14, 0, 72],
    [-28, 0, 70],
    [11, 0, -96],
    [-11, 0, -96],
    [11, 0, 96],
    [-11, 0, 96],
    [11, 0, -142],
    [-11, 0, -142],
    [11, 0, 142],
    [-11, 0, 142],
    [64, 0, -14],
    [-64, 0, 14],
    [96, 0, 18],
    [-96, 0, -18],
    [40, 0, -110],
    [-40, 0, -110],
    [40, 0, 110],
    [-40, 0, 110],
    [11, 0, -196],
    [-11, 0, -196],
    [11, 0, 196],
    [-11, 0, 196],
    [142, 0, -24],
    [-142, 0, 24],
    [156, 0, -118],
    [-156, 0, -118],
    [156, 0, 118],
    [-156, 0, 118],
  ];

  treeCoords.forEach(([x, y, z]) => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(cylinderGeo, woodMat);
    trunk.scale.set(0.32, 3.6, 0.32);
    trunk.position.y = 1.8;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(sphereGeo, leafMat);
    foliage.scale.set(1.75, 1.45, 1.75);
    foliage.position.y = 4.1;
    foliage.castShadow = true;
    tree.add(foliage);

    tree.position.set(x, y, z);
    group.add(tree);
  });

  return group;
}

export function createStreetLampposts(): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  const lampPositions: [number, number, number, number][] = [
    [-8.5, 0, 20, 0],
    [8.5, 0, 20, Math.PI],
    [-8.5, 0, -20, 0],
    [8.5, 0, -20, Math.PI],
    [-8.5, 0, 48, 0],
    [8.5, 0, 48, Math.PI],
    [-8.5, 0, -48, 0],
    [8.5, 0, -48, Math.PI],
    [-8.5, 0, 82, 0],
    [8.5, 0, 82, Math.PI],
    [-8.5, 0, -82, 0],
    [8.5, 0, -82, Math.PI],
    [-8.5, 0, 116, 0],
    [8.5, 0, 116, Math.PI],
    [-8.5, 0, -116, 0],
    [8.5, 0, -116, Math.PI],
    [-8.5, 0, 144, 0],
    [8.5, 0, 144, Math.PI],
    [-8.5, 0, -144, 0],
    [8.5, 0, -144, Math.PI],
    [-8.5, 0, 184, 0],
    [8.5, 0, 184, Math.PI],
    [-8.5, 0, -184, 0],
    [8.5, 0, -184, Math.PI],
    [-36, 0, 8.5, -Math.PI / 2],
    [36, 0, -8.5, Math.PI / 2],
    [-76, 0, 8.5, -Math.PI / 2],
    [76, 0, -8.5, Math.PI / 2],
    [-116, 0, 8.5, -Math.PI / 2],
    [116, 0, -8.5, Math.PI / 2],
    [-165, 0, 8.5, -Math.PI / 2],
    [165, 0, -8.5, Math.PI / 2],
  ];

  lampPositions.forEach(([x, y, z, rotY]) => {
    const post = new THREE.Group();
    const pole = new THREE.Mesh(cylinderGeo, poleMat);
    pole.scale.set(0.11, 4.8, 0.11);
    pole.position.y = 2.4;
    post.add(pole);

    const arm = new THREE.Mesh(boxGeo, poleMat);
    arm.scale.set(1.1, 0.1, 0.1);
    arm.position.set(0.5, 4.7, 0);
    post.add(arm);

    const bulb = new THREE.Mesh(sphereGeo, bulbMat);
    bulb.scale.set(0.22, 0.22, 0.22);
    bulb.position.set(1.0, 4.6, 0);
    post.add(bulb);

    post.position.set(x, y, z);
    post.rotation.y = rotY;
    group.add(post);
  });

  return group;
}

export function createFlyoverPillars(): THREE.Group {
  const group = new THREE.Group();
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });

  const deck = new THREE.Mesh(boxGeo, concreteMat);
  deck.scale.set(14, 1.3, 440);
  deck.position.set(-128, 9.0, 0);
  deck.castShadow = true;
  group.add(deck);

  for (let z = -205; z <= 205; z += 34) {
    const pillar = new THREE.Mesh(cylinderGeo, concreteMat);
    pillar.scale.set(2.0, 9.0, 2.0);
    pillar.position.set(-128, 4.5, z);
    pillar.castShadow = true;
    group.add(pillar);
  }

  return group;
}

export function createDhakaMetroViaduct(): { group: THREE.Group; colliders: BoxCollider[] } {
  const group = new THREE.Group();
  const colliders: BoxCollider[] = [];

  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.82 });
  const darkGirderMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const curbMat = new THREE.MeshStandardMaterial({ map: createCurbTexture(48), roughness: 0.8 });
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78 });

  // Elevated Metro Rail Box Girder Viaduct running down center (x = 0, y = 9.8, z in [-230, 230])
  const viaduct = new THREE.Mesh(boxGeo, concreteMat);
  viaduct.scale.set(5.6, 1.6, 460);
  viaduct.position.set(0, 9.8, 0);
  viaduct.castShadow = true;
  group.add(viaduct);

  // Side parapet barriers on Metro deck
  [-2.65, 2.65].forEach((px) => {
    const parapet = new THREE.Mesh(boxGeo, darkGirderMat);
    parapet.scale.set(0.32, 0.9, 460);
    parapet.position.set(px, 11.0, 0);
    group.add(parapet);
  });

  // Overhead Metro Station Bridges with green Bengali signboards ("চান্দা সেন্টার")
  const signTex = createMetroStationSignTexture('চান্দা সেন্টার');
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: signTex,
    emissiveIntensity: 0.25,
    roughness: 0.4,
  });

  [-175, -110, -26, 38, 110, 175].forEach((sz) => {
    const stationBridge = new THREE.Mesh(boxGeo, darkGirderMat);
    stationBridge.scale.set(17.5, 1.9, 6.2);
    stationBridge.position.set(0, 7.8, sz);
    stationBridge.castShadow = true;
    group.add(stationBridge);

    // Front & Back Green Metro Signboards spanning across the lanes
    [-4.8, 4.8].forEach((sx) => {
      [sz + 3.16, sz - 3.16].forEach((signZ) => {
        const board = new THREE.Mesh(boxGeo, signMat);
        board.scale.set(5.4, 1.25, 0.14);
        board.position.set(sx, 7.8, signZ);
        group.add(board);
      });
    });
  });

  // Center Median Islands (North: z in [-219, -13], South: z in [13, 219]) with yellow-black curbs & bushes
  const medianSegments: [number, number][] = [
    [-116, 206],
    [116, 206],
  ];
  medianSegments.forEach(([mz, mLen]) => {
    const medianBase = new THREE.Mesh(boxGeo, curbMat);
    medianBase.scale.set(2.4, 0.26, mLen);
    medianBase.position.set(0, 0.13, mz);
    medianBase.receiveShadow = true;
    group.add(medianBase);

    // Small manicured bushes along the median
    const startZ = mz - mLen / 2 + 3;
    const endZ = mz + mLen / 2 - 3;
    for (let bz = startZ; bz <= endZ; bz += 5.4) {
      if (
        Math.abs(Math.abs(bz) - 50) < 5 ||
        Math.abs(Math.abs(bz) - 105) < 5 ||
        Math.abs(Math.abs(bz) - 165) < 5
      ) {
        continue;
      }
      const bush = new THREE.Mesh(sphereGeo, bushMat);
      bush.scale.set(0.62, 0.52, 0.62);
      bush.position.set(0, 0.48, bz);
      group.add(bush);
    }
  });

  // Metro Pillars along center median (skipping central roundabout & ring road crossings)
  const pillarZCoords = [
    -198, -176, -142, -118, -94, -72, -56, -30, -16, 16, 38, 62, 84, 118, 142, 176, 198,
  ];
  const posterMats = [0, 1, 2].map(
    (v) =>
      new THREE.MeshStandardMaterial({
        map: createMetroPosterTexture(v as 0 | 1 | 2),
        roughness: 0.75,
      })
  );

  pillarZCoords.forEach((pz, idx) => {
    const pillar = new THREE.Mesh(boxGeo, posterMats[idx % posterMats.length]);
    pillar.scale.set(2.1, 9.2, 2.2);
    pillar.position.set(0, 4.6, pz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);

    // Flared Concrete Cap under Viaduct
    const cap = new THREE.Mesh(boxGeo, darkGirderMat);
    cap.scale.set(4.6, 1.1, 2.8);
    cap.position.set(0, 8.85, pz);
    group.add(cap);

    colliders.push({
      minX: -1.15,
      maxX: 1.15,
      minZ: pz - 1.2,
      maxZ: pz + 1.2,
    });
  });

  return { group, colliders };
}
