import * as THREE from 'three';
import {
  CustomizationItem,
  EquippedOutfit,
  HeroExpression,
  NPCArchetype,
} from '../../types/game';
import {
  getBottomTexture,
  getGamchaTexture,
  getShirtTexture,
} from './characterTextures';

// Shared low-overhead unit geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
const sphereGeo = new THREE.SphereGeometry(1, 16, 14);
const coneGeo = new THREE.ConeGeometry(1, 1, 12);
const torusGeo = new THREE.TorusGeometry(1, 0.24, 10, 20);

function createHeroChestGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1, 1, 1, 2, 3, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    const y = pos.getY(i);
    let z = pos.getZ(i);

    // Athletic V-taper: broad shoulders/lats at top, narrow tapered waist at bottom
    const t = THREE.MathUtils.clamp((y + 0.5), 0, 1); // 0 = waist, 1 = shoulders
    const widthScale = THREE.MathUtils.lerp(0.76, 1.16, Math.pow(t, 0.85));
    const depthScale = THREE.MathUtils.lerp(0.82, 1.08, t);
    x *= widthScale;
    z *= depthScale;

    // Sculpted upper chest pec shelf protruding slightly forward
    if (z > 0.15 && y > -0.08 && y < 0.4) {
      const pecWeight = Math.sin(((y + 0.08) / 0.48) * Math.PI);
      const centerGroove = Math.abs(x) < 0.06 ? -0.025 : 0.065;
      z += pecWeight * centerGroove;
    }

    // Slight upper back trapezius / lat taper
    if (z < -0.15 && y > 0.05) {
      z -= ((y - 0.05) / 0.45) * 0.04;
    }

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function createHeroHeadGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Chiseled low-poly masculine jaw & cheekbones
    if (y < -0.15) {
      const jawT = THREE.MathUtils.clamp((-y - 0.15) / 0.85, 0, 1);
      x *= THREE.MathUtils.lerp(0.96, 0.62, jawT);
      if (z > 0) {
        z *= THREE.MathUtils.lerp(1.0, 0.88, jawT);
      } else {
        z *= THREE.MathUtils.lerp(1.0, 0.65, jawT);
      }
      // Subtle chin prominence
      if (z > 0.35 && Math.abs(x) < 0.32 && y < -0.45) {
        z += 0.08;
      }
    }
    // Slight angular brow & cheek definition
    if (y > -0.1 && y < 0.35 && Math.abs(x) > 0.45 && z > 0) {
      x *= 1.04;
      z += 0.04;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function createSculptedLimbGeometry(
  topR: number,
  midR: number,
  botR: number,
  midY = 0.08
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(1, 1, 1, 8, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i); // [-0.5, 0.5]
    const z = pos.getZ(i);
    let rScale: number;
    if (y >= midY) {
      const t = (y - midY) / Math.max(0.001, 0.5 - midY);
      rScale = THREE.MathUtils.lerp(midR, topR, t);
    } else {
      const t = (midY - y) / Math.max(0.001, midY + 0.5);
      rScale = THREE.MathUtils.lerp(midR, botR, t);
    }
    pos.setXYZ(i, x * rScale, y, z * rScale);
  }
  geo.computeVertexNormals();
  return geo;
}

// Cached faceted low-poly Hero geometries (zero per-spawn leaks)
const heroChestGeo = createHeroChestGeometry();
const heroHeadGeo = createHeroHeadGeometry();
const heroCurlyGeo = new THREE.IcosahedronGeometry(1, 0);
const heroUpperArmGeo = createSculptedLimbGeometry(1.08, 1.06, 0.88, 0.05);
const heroForearmGeo = createSculptedLimbGeometry(0.98, 1.12, 0.68, 0.14);
const heroHandGeo = new THREE.IcosahedronGeometry(1, 0);
const heroThighGeo = createSculptedLimbGeometry(1.12, 1.04, 0.86, 0.08);
const heroCalfGeo = createSculptedLimbGeometry(0.92, 1.0, 0.74, 0.12);
const heroBootShaftGeo = createSculptedLimbGeometry(0.95, 0.9, 0.98, 0.0);

export type CharacterAnimAction =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'talk'
  | 'action_kick'
  | 'tea_serve'
  | 'grocer_counter'
  | 'rickshaw_pedal'
  | 'bus_drive'
  | 'police_alert'
  | 'boss_command'
  | 'female_stroll'
  | 'reaction_happy'
  | 'reaction_shocked'
  | 'reaction_angry'
  | 'reaction_laugh'
  | 'reaction_think';

export interface StylizedCharacterRig {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftElbowPivot: THREE.Group;
  rightElbowPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftKneePivot: THREE.Group;
  rightKneePivot: THREE.Group;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  mouthMesh: THREE.Mesh;
  eyeMeshes: THREE.Mesh[];
  shadowBlob: THREE.Mesh;
  hasLungi: boolean;
  lungiSkirt?: THREE.Mesh;
  hoverArrow?: THREE.Mesh;
  isHero?: boolean;
  hasLathi?: boolean;
  disposableMaterials: THREE.Material[];
}

interface CharacterBuildConfig {
  bodyType?: 'hero' | 'stout' | 'heavy_boss' | 'slim_female' | 'regular';
  shirtStyle: string;
  shirtHex?: string;
  bottomStyle: string;
  bottomHex?: string;
  skinHex?: number;
  hairStyle: 'hero_wavy' | 'short_parted' | 'side_part' | 'slick_boss' | 'female_long';
  beardStyle: 'hero_trimmed' | 'thick_moustache' | 'light_beard' | 'clean';
  hatStyle?: string;
  glassesStyle?: string;
  shoesStyle?: string;
  watchStyle?: string;
  necklaceStyle?: string;
  propType?: 'none' | 'tea_glass' | 'handbag' | 'whistle_badge' | 'lathi';
  hasDupatta?: boolean;
  hasEpaulettes?: boolean;
  showMarkerArrow?: boolean;
}

function makeStdMat(
  params: THREE.MeshStandardMaterialParameters,
  bucket: THREE.Material[]
): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial(params);
  bucket.push(m);
  return m;
}

function makeBasicMat(
  params: THREE.MeshBasicMaterialParameters,
  bucket: THREE.Material[]
): THREE.MeshBasicMaterial {
  const m = new THREE.MeshBasicMaterial(params);
  bucket.push(m);
  return m;
}

export function buildStylizedCharacter(cfg: CharacterBuildConfig): StylizedCharacterRig {
  const mats: THREE.Material[] = [];
  const root = new THREE.Group();

  const bodyType = cfg.bodyType || 'regular';
  const isHero = bodyType === 'hero';
  const skinCol = cfg.skinHex ?? (isHero ? 0xd58c57 : 0xdc935b);

  const skinMat = makeStdMat(
    { color: skinCol, roughness: isHero ? 0.56 : 0.62, flatShading: isHero },
    mats
  );
  const hairMat = makeStdMat(
    { color: isHero ? 0x131418 : 0x16161a, roughness: 0.86, flatShading: isHero },
    mats
  );
  const shirtTex = getShirtTexture(cfg.shirtStyle, cfg.shirtHex || '#1f2937');
  const shirtMat = makeStdMat(
    { map: shirtTex, roughness: isHero ? 0.68 : 0.58, flatShading: isHero },
    mats
  );

  const isLungi =
    cfg.bottomStyle === 'check_lungi' ||
    cfg.bottomStyle === 'lungi_blue_yellow' ||
    cfg.bottomStyle === 'lungi_green_gold';
  const bottomTex = getBottomTexture(cfg.bottomStyle, cfg.bottomHex || '#1e293b');
  const bottomMat = makeStdMat(
    { map: bottomTex, roughness: isHero ? 0.76 : 0.72, flatShading: isHero },
    mats
  );

  const goldMat = makeStdMat({ color: 0xfacc15, metalness: 0.85, roughness: 0.22 }, mats);
  const darkBeltMat = makeStdMat({ color: 0x141518, roughness: 0.72, flatShading: isHero }, mats);

  const torsoWidthScale =
    bodyType === 'heavy_boss'
      ? 1.32
      : bodyType === 'stout'
      ? 1.18
      : bodyType === 'slim_female'
      ? 0.86
      : isHero
      ? 1.04
      : 1.0;
  const torsoDepthScale =
    bodyType === 'heavy_boss'
      ? 1.28
      : bodyType === 'stout'
      ? 1.24
      : bodyType === 'slim_female'
      ? 0.85
      : 1.0;

  // Ground contact shadow
  const shadowMat = makeBasicMat(
    { color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false },
    mats
  );
  const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(isHero ? 0.48 : 0.44, 18), shadowMat);
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.y = 0.03;
  root.add(shadowBlob);

  // Shoes Material setup
  const shoesStyle = cfg.shoesStyle || 'white_red';
  const isBoot = shoesStyle === 'combat_boots' || shoesStyle === 'police_boots';
  const shoeMainColor =
    shoesStyle === 'combat_boots'
      ? 0x17191e
      : shoesStyle === 'white_red'
      ? 0xf8fafc
      : shoesStyle === 'black_white'
      ? 0x18181b
      : shoesStyle === 'gold_loafers'
      ? 0xeab308
      : shoesStyle === 'police_boots'
      ? 0x0f172a
      : shoesStyle === 'female_flats'
      ? 0x9333ea
      : 0x451a03;
  const shoeAccentColor =
    shoesStyle === 'combat_boots'
      ? 0x2a2e36
      : shoesStyle === 'white_red'
      ? 0xdc2626
      : shoesStyle === 'black_white'
      ? 0xf8fafc
      : shoesStyle === 'gold_loafers'
      ? 0xfef08a
      : 0x334155;

  const shoeMainMat = makeStdMat(
    { color: shoeMainColor, roughness: isBoot ? 0.56 : 0.45, flatShading: isHero },
    mats
  );
  const shoeAccentMat = makeStdMat(
    { color: shoeAccentColor, roughness: 0.45, flatShading: isHero },
    mats
  );
  const soleMat = makeStdMat(
    {
      color: isBoot ? 0x090a0d : 0xf8fafc,
      roughness: isBoot ? 0.85 : 0.75,
      flatShading: isHero,
    },
    mats
  );

  // ================= LEGS (Hip y = 0.74) =================
  const hipX =
    bodyType === 'heavy_boss' ? 0.18 : bodyType === 'slim_female' ? 0.11 : isHero ? 0.148 : 0.14;
  const legThickness =
    bodyType === 'heavy_boss' ? 0.135 : bodyType === 'slim_female' ? 0.095 : isHero ? 0.122 : 0.115;

  const makeLeg = (xOffset: number) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(xOffset, 0.74, 0);

    const upperLeg = new THREE.Mesh(
      isHero && !isLungi ? heroThighGeo : cylGeo,
      isLungi ? skinMat : bottomMat
    );
    upperLeg.scale.set(legThickness, 0.34, legThickness * (isHero ? 1.05 : 1));
    upperLeg.position.y = -0.17;
    upperLeg.castShadow = true;
    hipPivot.add(upperLeg);

    // 3D Tactical Cargo Thigh Pockets (detailed dual-flap pocket on Hero cargo/jeans)
    if (!isLungi && (cfg.bottomStyle === 'black_cargo' || cfg.bottomStyle === 'blue_jeans')) {
      const sideSign = xOffset < 0 ? -1 : 1;
      const pocket = new THREE.Mesh(boxGeo, bottomMat);
      pocket.scale.set(isHero ? 0.058 : 0.05, isHero ? 0.155 : 0.14, isHero ? 0.128 : 0.11);
      pocket.position.set(sideSign * (legThickness * 0.96), -0.2, 0.01);
      pocket.castShadow = true;
      hipPivot.add(pocket);

      if (isHero) {
        const pocketFlap = new THREE.Mesh(boxGeo, bottomMat);
        pocketFlap.scale.set(0.066, 0.044, 0.136);
        pocketFlap.position.set(sideSign * (legThickness * 0.98), -0.13, 0.01);
        hipPivot.add(pocketFlap);
      }
    }

    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.34, 0);
    hipPivot.add(kneePivot);

    const lowerLeg = new THREE.Mesh(
      isHero && !isLungi ? heroCalfGeo : cylGeo,
      isLungi ? skinMat : bottomMat
    );
    lowerLeg.scale.set(legThickness * 0.92, 0.32, legThickness * 0.94);
    lowerLeg.position.y = -0.16;
    lowerLeg.castShadow = true;
    kneePivot.add(lowerLeg);

    // Subtle bunched cargo pant cuff above boots on Hero
    if (isHero && !isLungi && isBoot) {
      const cuffRing = new THREE.Mesh(heroCalfGeo, bottomMat);
      cuffRing.scale.set(legThickness * 1.0, 0.065, legThickness * 1.02);
      cuffRing.position.y = -0.18;
      kneePivot.add(cuffRing);
    }

    // Detailed Sneakers / Tactical Combat Boots
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.35, 0.05);
    kneePivot.add(shoeGroup);

    if (isBoot && shoesStyle === 'combat_boots') {
      // Rugged thick lugged combat boot sole + heel block
      const bootSole = new THREE.Mesh(boxGeo, soleMat);
      bootSole.scale.set(0.184, 0.044, 0.3);
      bootSole.position.y = -0.028;
      shoeGroup.add(bootSole);

      const heelBlock = new THREE.Mesh(boxGeo, soleMat);
      heelBlock.scale.set(0.175, 0.026, 0.11);
      heelBlock.position.set(0, -0.04, -0.09);
      shoeGroup.add(heelBlock);

      // Lower boot vamp & armored toe box
      const bootUpper = new THREE.Mesh(boxGeo, shoeMainMat);
      bootUpper.scale.set(0.168, 0.098, 0.27);
      bootUpper.position.set(0, 0.032, 0);
      bootUpper.castShadow = true;
      shoeGroup.add(bootUpper);

      const toeCap = new THREE.Mesh(boxGeo, shoeAccentMat);
      toeCap.scale.set(0.158, 0.078, 0.095);
      toeCap.position.set(0, 0.024, 0.102);
      shoeGroup.add(toeCap);

      // Tall tactical ankle shaft rising into cargo cuff
      const shaft = new THREE.Mesh(heroBootShaftGeo, shoeMainMat);
      shaft.scale.set(0.105, 0.195, 0.112);
      shaft.position.set(0, 0.14, -0.048);
      shaft.castShadow = true;
      shoeGroup.add(shaft);

      // Front lace panel & cross-lace ribs
      const tongueStrip = new THREE.Mesh(boxGeo, soleMat);
      tongueStrip.scale.set(0.068, 0.17, 0.03);
      tongueStrip.position.set(0, 0.135, 0.052);
      shoeGroup.add(tongueStrip);

      [0.075, 0.115, 0.155, 0.192].forEach((ly) => {
        const lace = new THREE.Mesh(boxGeo, shoeAccentMat);
        lace.scale.set(0.088, 0.015, 0.04);
        lace.position.set(0, ly, 0.056);
        shoeGroup.add(lace);
      });
    } else {
      const shoeUpper = new THREE.Mesh(boxGeo, shoeMainMat);
      shoeUpper.scale.set(0.165, 0.09, 0.27);
      shoeUpper.position.y = 0.025;
      shoeUpper.castShadow = true;
      shoeGroup.add(shoeUpper);

      const shoeSole = new THREE.Mesh(boxGeo, soleMat);
      shoeSole.scale.set(0.175, 0.035, 0.285);
      shoeSole.position.y = -0.032;
      shoeGroup.add(shoeSole);

      // Signature side swoosh/stripe on sneakers
      if (shoesStyle === 'white_red' || shoesStyle === 'black_white') {
        const stripe = new THREE.Mesh(boxGeo, shoeAccentMat);
        stripe.scale.set(0.176, 0.036, 0.16);
        stripe.position.set(0, 0.028, -0.02);
        shoeGroup.add(stripe);

        const tongue = new THREE.Mesh(boxGeo, shoeAccentMat);
        tongue.scale.set(0.11, 0.06, 0.08);
        tongue.position.set(0, 0.075, 0.04);
        shoeGroup.add(tongue);
      }
    }

    return { hipPivot, kneePivot };
  };

  const leftLeg = makeLeg(-hipX);
  const rightLeg = makeLeg(hipX);
  root.add(leftLeg.hipPivot);
  root.add(rightLeg.hipPivot);

  // ================= TORSO GROUP (y = 0.74) =================
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.74;
  root.add(torsoGroup);

  // Optional 3D Lungi Wrap Skirt
  let lungiSkirt: THREE.Mesh | undefined;
  if (isLungi) {
    lungiSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27 * torsoWidthScale, 0.31 * torsoWidthScale, 0.56, 18),
      bottomMat
    );
    lungiSkirt.position.y = -0.22;
    lungiSkirt.castShadow = true;
    torsoGroup.add(lungiSkirt);
  }

  // Belt & Waistband
  const belt = new THREE.Mesh(boxGeo, darkBeltMat);
  belt.scale.set(
    (isHero ? 0.44 : 0.52) * torsoWidthScale,
    0.075,
    (isHero ? 0.275 : 0.31) * torsoDepthScale
  );
  belt.position.y = 0.04;
  torsoGroup.add(belt);

  if (bodyType === 'heavy_boss' || cfg.shirtStyle === 'police_uniform') {
    const buckle = new THREE.Mesh(boxGeo, goldMat);
    buckle.scale.set(0.09, 0.075, 0.04);
    buckle.position.set(0, 0.04, 0.155 * torsoDepthScale);
    torsoGroup.add(buckle);
  }

  // Chest / Polo / Kurta / Jacket
  const chest = new THREE.Mesh(isHero ? heroChestGeo : boxGeo, shirtMat);
  chest.scale.set(
    (isHero ? 0.52 : 0.54) * torsoWidthScale,
    isHero ? 0.65 : 0.64,
    (isHero ? 0.295 : 0.31) * torsoDepthScale
  );
  chest.position.y = 0.38;
  chest.castShadow = true;
  torsoGroup.add(chest);

  // Female kameez longer flared skirt hem
  if (bodyType === 'slim_female') {
    const kameezSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.32, 0.42, 16),
      shirtMat
    );
    kameezSkirt.position.y = -0.08;
    kameezSkirt.castShadow = true;
    torsoGroup.add(kameezSkirt);
  }

  // Stout / Boss Belly Roundness
  if (bodyType === 'stout' || bodyType === 'heavy_boss') {
    const belly = new THREE.Mesh(sphereGeo, shirtMat);
    belly.scale.set(
      0.27 * torsoWidthScale,
      0.26,
      bodyType === 'heavy_boss' ? 0.25 : 0.22
    );
    belly.position.set(0, 0.26, 0.11);
    belly.castShadow = true;
    torsoGroup.add(belly);
  }

  // Hero Tailored Neck + Folded Polo Collar vs Classic Collar
  const isPoloHero =
    isHero &&
    (cfg.shirtStyle === 'black_polo' ||
      cfg.shirtStyle === 'white_tee' ||
      cfg.shirtStyle === 'emerald_tee');

  if (isHero) {
    // Muscular neck column
    const neck = new THREE.Mesh(cylGeo, skinMat);
    neck.scale.set(0.096, 0.15, 0.098);
    neck.position.set(0, 0.75, 0.0);
    torsoGroup.add(neck);
  }

  if (isPoloHero) {
    const poloCollarColor =
      cfg.shirtStyle === 'white_tee'
        ? 0xe2e8f0
        : cfg.shirtStyle === 'emerald_tee'
        ? 0x059669
        : 0x16181e;
    const poloCollarMat = makeStdMat(
      { color: poloCollarColor, roughness: 0.65, flatShading: true },
      mats
    );

    // Skin V-neck peek at chest top
    const chestSkinV = new THREE.Mesh(boxGeo, skinMat);
    chestSkinV.scale.set(0.088, 0.12, 0.045);
    chestSkinV.position.set(0, 0.67, 0.142);
    chestSkinV.rotation.z = Math.PI / 4;
    torsoGroup.add(chestSkinV);

    if (cfg.shirtStyle === 'black_polo') {
      // Back collar rim
      const backCollar = new THREE.Mesh(boxGeo, poloCollarMat);
      backCollar.scale.set(0.24, 0.068, 0.14);
      backCollar.position.set(0, 0.715, -0.055);
      torsoGroup.add(backCollar);

      // Left & right folded polo collar lapels framing V-neck
      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(boxGeo, poloCollarMat);
        wing.scale.set(0.11, 0.052, 0.13);
        wing.position.set(side * 0.082, 0.706, 0.072);
        wing.rotation.y = side * -0.42;
        wing.rotation.z = side * -0.26;
        wing.rotation.x = 0.22;
        torsoGroup.add(wing);
      });
    }
  } else {
    const collarMat = makeStdMat(
      {
        color:
          cfg.shirtStyle === 'black_floral' || cfg.shirtStyle === 'blue_denim'
            ? 0x1e293b
            : cfg.shirtStyle === 'boss_white_suit'
            ? 0xf8fafc
            : cfg.shirtStyle === 'police_uniform'
            ? 0x1e3a8a
            : 0xfef3c7,
        roughness: 0.5,
      },
      mats
    );
    const collar = new THREE.Mesh(cylGeo, collarMat);
    collar.scale.set(0.155, 0.085, 0.155);
    collar.position.y = 0.71;
    torsoGroup.add(collar);
  }

  // Shoulder Epaulettes (Police / Bus Driver)
  if (cfg.hasEpaulettes) {
    [-0.24 * torsoWidthScale, 0.24 * torsoWidthScale].forEach((ex) => {
      const ep = new THREE.Mesh(boxGeo, goldMat);
      ep.scale.set(0.14, 0.03, 0.12);
      ep.position.set(ex, 0.695, 0);
      torsoGroup.add(ep);
    });
  }

  // Female Dupatta Scarf draped across shoulder & torso
  if (cfg.hasDupatta) {
    const dupattaMat = makeStdMat({ color: 0xc084fc, roughness: 0.65 }, mats);
    const sash = new THREE.Mesh(boxGeo, dupattaMat);
    sash.scale.set(0.14, 0.72, 0.34);
    sash.position.set(-0.1, 0.38, 0.01);
    sash.rotation.z = -0.28;
    torsoGroup.add(sash);

    const drapeBack = new THREE.Mesh(boxGeo, dupattaMat);
    drapeBack.scale.set(0.16, 0.56, 0.06);
    drapeBack.position.set(-0.22, 0.25, -0.15);
    torsoGroup.add(drapeBack);
  }

  // Optional Golden Chain Necklace
  if (cfg.necklaceStyle === 'gold_chain') {
    const chain = new THREE.Mesh(torusGeo, goldMat);
    chain.scale.set(0.14, 0.12, 0.14);
    chain.rotation.x = Math.PI / 2 - 0.45;
    chain.position.set(0, 0.64, 0.11 * torsoDepthScale);
    torsoGroup.add(chain);
  }

  // ================= 2-SEGMENT ARMS =================
  const shoulderX = (isHero ? 0.345 : 0.34) * torsoWidthScale;
  const sleeveLen =
    cfg.shirtStyle === 'boss_white_suit' ||
    cfg.shirtStyle === 'white_punjabi' ||
    cfg.shirtStyle === 'red_kurta' ||
    cfg.shirtStyle === 'gold_sherwani' ||
    cfg.shirtStyle === 'black_silk' ||
    cfg.shirtStyle === 'blue_denim' ||
    cfg.shirtStyle === 'female_kameez'
      ? 'long'
      : 'half';

  const makeArm = (xOffset: number, isLeft: boolean) => {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(xOffset, isHero ? 0.625 : 0.61, 0);

    const armThickness =
      bodyType === 'heavy_boss'
        ? 0.105
        : bodyType === 'slim_female'
        ? 0.072
        : isHero
        ? 0.098
        : 0.09;

    if (isHero && sleeveLen === 'half') {
      // Broad muscular deltoid/sleeve cap + rolled sleeve cuff + exposed bicep
      const sleeveUpper = new THREE.Mesh(heroUpperArmGeo, shirtMat);
      sleeveUpper.scale.set(armThickness * 1.12, 0.16, armThickness * 1.12);
      sleeveUpper.position.y = -0.075;
      sleeveUpper.castShadow = true;
      shoulderPivot.add(sleeveUpper);

      const sleeveCuff = new THREE.Mesh(cylGeo, shirtMat);
      sleeveCuff.scale.set(armThickness * 1.07, 0.032, armThickness * 1.07);
      sleeveCuff.position.y = -0.155;
      shoulderPivot.add(sleeveCuff);

      const bareBicep = new THREE.Mesh(heroUpperArmGeo, skinMat);
      bareBicep.scale.set(armThickness * 0.94, 0.125, armThickness * 0.96);
      bareBicep.position.y = -0.21;
      bareBicep.castShadow = true;
      shoulderPivot.add(bareBicep);
    } else {
      const upperArm = new THREE.Mesh(isHero ? heroUpperArmGeo : cylGeo, shirtMat);
      upperArm.scale.set(armThickness, 0.26, armThickness);
      upperArm.position.y = -0.13;
      upperArm.castShadow = true;
      shoulderPivot.add(upperArm);
    }

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -0.265, 0);
    shoulderPivot.add(elbowPivot);

    const forearm = new THREE.Mesh(
      isHero ? heroForearmGeo : cylGeo,
      sleeveLen === 'long' ? shirtMat : skinMat
    );
    forearm.scale.set(
      armThickness * (isHero ? 0.92 : 0.86),
      0.25,
      armThickness * (isHero ? 0.94 : 0.86)
    );
    forearm.position.y = -0.125;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const hand = new THREE.Mesh(isHero ? heroHandGeo : sphereGeo, skinMat);
    hand.scale.set(
      armThickness * (isHero ? 0.78 : 0.92),
      armThickness * (isHero ? 0.92 : 0.95),
      armThickness * (isHero ? 0.84 : 0.92)
    );
    hand.position.y = -0.275;
    elbowPivot.add(hand);

    // Wristwatch on Left Wrist
    if (isLeft && cfg.watchStyle && cfg.watchStyle !== 'none') {
      const band = new THREE.Mesh(cylGeo, darkBeltMat);
      band.scale.set(armThickness * 0.84, 0.045, armThickness * 0.84);
      band.position.y = -0.215;
      elbowPivot.add(band);

      const dial = new THREE.Mesh(boxGeo, goldMat);
      dial.scale.set(0.055, 0.05, 0.055);
      dial.position.set(0, -0.215, armThickness * 0.78);
      elbowPivot.add(dial);
    }

    // NPC Props attached to right/left hands
    if (!isLeft && cfg.propType === 'tea_glass') {
      const glassMat = makeStdMat(
        { color: 0xe0f2fe, transparent: true, opacity: 0.75, roughness: 0.15 },
        mats
      );
      const chaLiquidMat = makeStdMat({ color: 0xb45309, roughness: 0.4 }, mats);
      const glass = new THREE.Mesh(cylGeo, glassMat);
      glass.scale.set(0.055, 0.14, 0.055);
      glass.position.set(0, -0.29, 0.07);
      elbowPivot.add(glass);

      const tea = new THREE.Mesh(cylGeo, chaLiquidMat);
      tea.scale.set(0.046, 0.1, 0.046);
      tea.position.set(0, -0.3, 0.07);
      elbowPivot.add(tea);
    }

    if (isLeft && cfg.propType === 'handbag') {
      const bagMat = makeStdMat({ color: 0xd6b08c, roughness: 0.65 }, mats);
      const strap = new THREE.Mesh(boxGeo, makeStdMat({ color: 0x78350f, roughness: 0.8 }, mats));
      strap.scale.set(0.03, 0.24, 0.04);
      strap.position.set(-0.04, -0.28, 0.02);
      elbowPivot.add(strap);

      const bag = new THREE.Mesh(boxGeo, bagMat);
      bag.scale.set(0.1, 0.2, 0.22);
      bag.position.set(-0.06, -0.44, 0.03);
      bag.castShadow = true;
      elbowPivot.add(bag);
    }

    // Bamboo/Wooden Lathi (লাঠি) held in Hero's right hand for smashing shops & props
    if (!isLeft && cfg.propType === 'lathi') {
      const lathiGroup = new THREE.Group();
      lathiGroup.position.set(0.01, -0.27, 0.05);
      lathiGroup.rotation.x = Math.PI / 2 - 0.34;
      lathiGroup.rotation.z = -0.08;

      const woodStickMat = makeStdMat({ color: 0xb45309, roughness: 0.62 }, mats);
      const nodeRingMat = makeStdMat({ color: 0x78350f, roughness: 0.72 }, mats);
      const gripMat = makeStdMat({ color: 0x18181b, roughness: 0.85 }, mats);

      const shaft = new THREE.Mesh(cylGeo, woodStickMat);
      shaft.scale.set(0.032, 1.18, 0.032);
      shaft.position.y = 0.24;
      shaft.castShadow = true;
      lathiGroup.add(shaft);

      const grip = new THREE.Mesh(cylGeo, gripMat);
      grip.scale.set(0.038, 0.2, 0.038);
      grip.position.y = -0.02;
      lathiGroup.add(grip);

      [-0.22, 0.16, 0.42, 0.66].forEach((ny) => {
        const ring = new THREE.Mesh(cylGeo, nodeRingMat);
        ring.scale.set(0.038, 0.022, 0.038);
        ring.position.y = ny;
        lathiGroup.add(ring);
      });

      const tipCap = new THREE.Mesh(cylGeo, goldMat);
      tipCap.scale.set(0.034, 0.07, 0.034);
      tipCap.position.y = 0.82;
      lathiGroup.add(tipCap);

      elbowPivot.add(lathiGroup);
    }

    return { shoulderPivot, elbowPivot };
  };

  const leftArm = makeArm(-shoulderX, true);
  const rightArm = makeArm(shoulderX, false);
  torsoGroup.add(leftArm.shoulderPivot);
  torsoGroup.add(rightArm.shoulderPivot);

  // ================= HEAD & EXPRESSIONS (y = 0.90 inside torsoGroup) =================
  const headGroup = new THREE.Group();
  headGroup.position.y = isHero ? 0.91 : 0.89;
  torsoGroup.add(headGroup);

  const head = new THREE.Mesh(isHero ? heroHeadGeo : sphereGeo, skinMat);
  head.scale.set(
    bodyType === 'heavy_boss' ? 0.25 : bodyType === 'slim_female' ? 0.215 : 0.228,
    0.255,
    0.236
  );
  head.castShadow = true;
  headGroup.add(head);

  // Ears
  [-0.222, 0.222].forEach((ex) => {
    const ear = new THREE.Mesh(isHero ? heroHandGeo : sphereGeo, skinMat);
    ear.scale.set(0.04, 0.062, 0.042);
    ear.position.set(ex, 0.0, -0.01);
    headGroup.add(ear);
  });

  // Stylized Hair Variants
  if (cfg.hairStyle === 'hero_wavy') {
    // Tapered fade back & sides
    const fadeCap = new THREE.Mesh(isHero ? heroCurlyGeo : sphereGeo, hairMat);
    fadeCap.scale.set(0.236, 0.145, 0.242);
    fadeCap.position.set(0, 0.145, -0.02);
    headGroup.add(fadeCap);

    // Sideburns / tapered temple fade
    [-0.205, 0.205].forEach((sx) => {
      const sb = new THREE.Mesh(boxGeo, hairMat);
      sb.scale.set(0.034, 0.125, 0.075);
      sb.position.set(sx, 0.04, 0.03);
      headGroup.add(sb);
    });

    // Dense curly voluminous top cluster matching reference photo
    const curlClusters: [number, number, number, number, number, number][] = [
      [0.0, 0.245, 0.02, 0.135, 0.095, 0.125],
      [-0.085, 0.235, 0.065, 0.105, 0.085, 0.1],
      [0.088, 0.242, 0.055, 0.11, 0.09, 0.1],
      [0.01, 0.255, 0.115, 0.095, 0.078, 0.09],
      [-0.14, 0.205, -0.01, 0.095, 0.075, 0.095],
      [0.142, 0.21, -0.005, 0.095, 0.075, 0.095],
      [-0.065, 0.235, -0.085, 0.105, 0.08, 0.1],
      [0.072, 0.232, -0.085, 0.105, 0.08, 0.1],
      [0.0, 0.21, -0.155, 0.115, 0.085, 0.095],
      [0.12, 0.225, 0.105, 0.078, 0.072, 0.078],
      [-0.115, 0.22, 0.11, 0.076, 0.07, 0.075],
    ];
    curlClusters.forEach(([cx, cy, cz, sx, sy, sz], idx) => {
      const puff = new THREE.Mesh(heroCurlyGeo, hairMat);
      puff.scale.set(sx, sy, sz);
      puff.position.set(cx, cy, cz);
      puff.rotation.set(idx * 0.45, idx * 0.8, idx * 0.35);
      puff.castShadow = true;
      headGroup.add(puff);
    });
  } else if (cfg.hairStyle === 'female_long') {
    const topHair = new THREE.Mesh(sphereGeo, hairMat);
    topHair.scale.set(0.235, 0.18, 0.245);
    topHair.position.set(0, 0.13, -0.02);
    headGroup.add(topHair);

    const backLocks = new THREE.Mesh(boxGeo, hairMat);
    backLocks.scale.set(0.38, 0.56, 0.16);
    backLocks.position.set(0, -0.12, -0.15);
    backLocks.castShadow = true;
    headGroup.add(backLocks);

    [-0.17, 0.17].forEach((lx) => {
      const frontStrand = new THREE.Mesh(cylGeo, hairMat);
      frontStrand.scale.set(0.05, 0.34, 0.06);
      frontStrand.position.set(lx, -0.06, 0.08);
      headGroup.add(frontStrand);
    });
  } else if (cfg.hairStyle === 'slick_boss') {
    const slick = new THREE.Mesh(sphereGeo, hairMat);
    slick.scale.set(0.255, 0.14, 0.245);
    slick.position.set(0, 0.155, -0.02);
    headGroup.add(slick);
  } else {
    const shortCap = new THREE.Mesh(sphereGeo, hairMat);
    shortCap.scale.set(0.238, 0.145, 0.24);
    shortCap.position.set(0, 0.145, -0.02);
    headGroup.add(shortCap);
  }

  // Expressive Eyes & Eyebrows
  const eyeWhiteMat = makeBasicMat({ color: 0xffffff }, mats);
  const pupilMat = makeBasicMat({ color: 0x0f172a }, mats);
  const eyeMeshes: THREE.Mesh[] = [];
  [-0.082, 0.082].forEach((ex) => {
    const eye = new THREE.Mesh(sphereGeo, eyeWhiteMat);
    eye.scale.set(0.048, 0.052, 0.03);
    eye.position.set(ex, 0.04, 0.205);
    headGroup.add(eye);
    eyeMeshes.push(eye);

    const pupil = new THREE.Mesh(sphereGeo, pupilMat);
    pupil.scale.set(0.025, 0.03, 0.02);
    pupil.position.set(ex, 0.04, 0.23);
    headGroup.add(pupil);
  });

  const leftBrow = new THREE.Mesh(boxGeo, hairMat);
  leftBrow.scale.set(0.088, 0.024, 0.03);
  leftBrow.position.set(-0.082, 0.105, 0.22);
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(boxGeo, hairMat);
  rightBrow.scale.set(0.088, 0.024, 0.03);
  rightBrow.position.set(0.082, 0.105, 0.22);
  headGroup.add(rightBrow);

  // Nose (faceted angular bridge on Hero, rounded on others)
  const nose = new THREE.Mesh(isHero ? boxGeo : sphereGeo, skinMat);
  nose.scale.set(isHero ? 0.044 : 0.038, isHero ? 0.072 : 0.045, isHero ? 0.058 : 0.052);
  nose.position.set(0, isHero ? -0.005 : -0.01, isHero ? 0.236 : 0.242);
  if (isHero) nose.rotation.x = -0.18;
  headGroup.add(nose);

  // Animated 3D Mouth (subtle confident smirk baseline on Hero)
  const mouthMat = makeStdMat({ color: isHero ? 0x994b3b : 0x7f1d1d, roughness: 0.5 }, mats);
  const mouthMesh = new THREE.Mesh(boxGeo, mouthMat);
  mouthMesh.scale.set(isHero ? 0.105 : 0.11, isHero ? 0.02 : 0.026, 0.035);
  mouthMesh.position.set(0, -0.095, 0.218);
  if (isHero) mouthMesh.rotation.z = 0.05;
  headGroup.add(mouthMesh);

  // Beard / Moustache variants
  if (cfg.beardStyle === 'hero_trimmed') {
    // Neat trimmed mustache + thin soul patch + contoured chin goatee matching reference photo
    [-1, 1].forEach((side) => {
      const stacheWing = new THREE.Mesh(boxGeo, hairMat);
      stacheWing.scale.set(0.072, 0.018, 0.032);
      stacheWing.position.set(side * 0.036, -0.062, 0.222);
      stacheWing.rotation.z = side * -0.12;
      headGroup.add(stacheWing);
    });

    const soulPatch = new THREE.Mesh(boxGeo, hairMat);
    soulPatch.scale.set(0.028, 0.028, 0.028);
    soulPatch.position.set(0, -0.126, 0.214);
    headGroup.add(soulPatch);

    const chinGoatee = new THREE.Mesh(boxGeo, hairMat);
    chinGoatee.scale.set(0.11, 0.034, 0.068);
    chinGoatee.position.set(0, -0.178, 0.172);
    headGroup.add(chinGoatee);

    const jawStubble = new THREE.Mesh(cylGeo, hairMat);
    jawStubble.scale.set(0.145, 0.042, 0.155);
    jawStubble.position.set(0, -0.188, 0.055);
    headGroup.add(jawStubble);
  } else if (cfg.beardStyle === 'thick_moustache') {
    const stache = new THREE.Mesh(boxGeo, hairMat);
    stache.scale.set(0.21, 0.048, 0.055);
    stache.position.set(0, -0.058, 0.228);
    headGroup.add(stache);
  } else if (cfg.beardStyle === 'light_beard') {
    const stache = new THREE.Mesh(boxGeo, hairMat);
    stache.scale.set(0.17, 0.032, 0.045);
    stache.position.set(0, -0.055, 0.228);
    headGroup.add(stache);

    const chin = new THREE.Mesh(sphereGeo, hairMat);
    chin.scale.set(0.14, 0.09, 0.14);
    chin.position.set(0, -0.15, 0.1);
    headGroup.add(chin);
  }

  // Eyewear / Wayfarer Black Sunglasses / Aviators / Gold Shades
  const glassesStyle = cfg.glassesStyle || 'none';
  if (glassesStyle !== 'none') {
    const isGold = glassesStyle === 'gold_shades';
    const frameMat = makeStdMat(
      { color: isGold ? 0xfacc15 : 0x101216, metalness: isGold ? 0.8 : 0.35, roughness: 0.22 },
      mats
    );
    const lensMat = makeStdMat(
      {
        color: isGold ? 0x1e293b : 0x050609,
        metalness: 0.7,
        roughness: 0.08,
      },
      mats
    );

    [-0.082, 0.082].forEach((lx) => {
      const lens = new THREE.Mesh(boxGeo, lensMat);
      lens.scale.set(0.125, 0.082, 0.026);
      lens.position.set(lx, 0.045, 0.244);
      headGroup.add(lens);

      const frame = new THREE.Mesh(boxGeo, frameMat);
      frame.scale.set(0.144, 0.098, 0.02);
      frame.position.set(lx, 0.046, 0.237);
      headGroup.add(frame);

      // Temple arms extending back along head to ears
      const armSign = lx < 0 ? -1 : 1;
      const templeArm = new THREE.Mesh(boxGeo, frameMat);
      templeArm.scale.set(0.018, 0.024, 0.22);
      templeArm.position.set(armSign * 0.185, 0.062, 0.125);
      templeArm.rotation.y = armSign * -0.12;
      headGroup.add(templeArm);
    });

    // Top brow bar + bridge for crisp wayfarer silhouette
    const browBar = new THREE.Mesh(boxGeo, frameMat);
    browBar.scale.set(0.32, 0.022, 0.024);
    browBar.position.set(0, 0.086, 0.24);
    headGroup.add(browBar);

    const bridge = new THREE.Mesh(boxGeo, frameMat);
    bridge.scale.set(0.075, 0.022, 0.024);
    bridge.position.set(0, 0.06, 0.244);
    headGroup.add(bridge);
  }

  // Headwear (Gamcha / Police Cap / Driver Cap / Red Cap / Snapback / Topi / Golden Crown)
  const hatStyle = cfg.hatStyle || 'none';
  if (hatStyle === 'gamcha') {
    const gamchaMat = makeStdMat({ map: getGamchaTexture(), roughness: 0.75 }, mats);
    const band = new THREE.Mesh(cylGeo, gamchaMat);
    band.scale.set(0.245, 0.13, 0.245);
    band.position.set(0, 0.16, -0.01);
    headGroup.add(band);

    const knot = new THREE.Mesh(sphereGeo, gamchaMat);
    knot.scale.set(0.09, 0.08, 0.08);
    knot.position.set(-0.2, 0.16, -0.06);
    headGroup.add(knot);
  } else if (hatStyle === 'police_cap' || hatStyle === 'driver_cap') {
    const isDriver = hatStyle === 'driver_cap';
    const capMat = makeStdMat(
      { color: isDriver ? 0x3b82f6 : 0x1e3a8a, roughness: 0.52 },
      mats
    );
    const topBandMat = makeStdMat(
      { color: isDriver ? 0xf8fafc : 0x172554, roughness: 0.5 },
      mats
    );
    const visorMat = makeStdMat({ color: 0x09090b, roughness: 0.25 }, mats);

    const crownCap = new THREE.Mesh(cylGeo, topBandMat);
    crownCap.scale.set(0.265, 0.11, 0.265);
    crownCap.position.set(0, 0.22, -0.01);
    headGroup.add(crownCap);

    const bandCap = new THREE.Mesh(cylGeo, capMat);
    bandCap.scale.set(0.24, 0.08, 0.24);
    bandCap.position.set(0, 0.16, -0.01);
    headGroup.add(bandCap);

    const visor = new THREE.Mesh(boxGeo, visorMat);
    visor.scale.set(0.26, 0.03, 0.19);
    visor.position.set(0, 0.135, 0.21);
    visor.rotation.x = 0.18;
    headGroup.add(visor);

    const badge = new THREE.Mesh(sphereGeo, goldMat);
    badge.scale.set(0.048, 0.055, 0.03);
    badge.position.set(0, 0.2, 0.248);
    headGroup.add(badge);
  } else if (hatStyle === 'red_cap' || hatStyle === 'snapback') {
    const capColor = hatStyle === 'red_cap' ? 0xdc2626 : 0x9333ea;
    const capMat = makeStdMat({ color: capColor, roughness: 0.58 }, mats);
    const dome = new THREE.Mesh(sphereGeo, capMat);
    dome.scale.set(0.248, 0.16, 0.248);
    dome.position.set(0, 0.15, -0.01);
    headGroup.add(dome);

    const brim = new THREE.Mesh(boxGeo, capMat);
    brim.scale.set(0.25, 0.032, 0.22);
    brim.position.set(0, 0.145, 0.21);
    headGroup.add(brim);

    const logo = new THREE.Mesh(
      boxGeo,
      makeBasicMat({ color: 0xffffff }, mats)
    );
    logo.scale.set(0.07, 0.06, 0.02);
    logo.position.set(0, 0.205, 0.23);
    headGroup.add(logo);
  } else if (hatStyle === 'topi') {
    const topiMat = makeStdMat({ color: 0xf8fafc, roughness: 0.72 }, mats);
    const topi = new THREE.Mesh(cylGeo, topiMat);
    topi.scale.set(0.215, 0.14, 0.215);
    topi.position.set(0, 0.21, -0.01);
    headGroup.add(topi);
  } else if (hatStyle === 'crown') {
    const crownBase = new THREE.Mesh(cylGeo, goldMat);
    crownBase.scale.set(0.22, 0.12, 0.22);
    crownBase.position.set(0, 0.24, 0);
    headGroup.add(crownBase);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const tip = new THREE.Mesh(coneGeo, goldMat);
      tip.scale.set(0.055, 0.14, 0.055);
      tip.position.set(Math.sin(angle) * 0.17, 0.34, Math.cos(angle) * 0.17);
      headGroup.add(tip);
    }
  }

  let hoverArrow: THREE.Mesh | undefined;
  if (cfg.showMarkerArrow) {
    hoverArrow = new THREE.Mesh(
      coneGeo,
      makeBasicMat({ color: 0xfacc15 }, mats)
    );
    hoverArrow.scale.set(0.14, 0.28, 0.14);
    hoverArrow.rotation.x = Math.PI;
    hoverArrow.position.set(0, 0.65, 0);
    hoverArrow.name = 'hover_arrow';
    headGroup.add(hoverArrow);
  }

  return {
    root,
    torsoGroup,
    headGroup,
    leftArmPivot: leftArm.shoulderPivot,
    rightArmPivot: rightArm.shoulderPivot,
    leftElbowPivot: leftArm.elbowPivot,
    rightElbowPivot: rightArm.elbowPivot,
    leftLegPivot: leftLeg.hipPivot,
    rightLegPivot: rightLeg.hipPivot,
    leftKneePivot: leftLeg.kneePivot,
    rightKneePivot: rightLeg.kneePivot,
    leftBrow,
    rightBrow,
    mouthMesh,
    eyeMeshes,
    shadowBlob,
    hasLungi: isLungi,
    lungiSkirt,
    hoverArrow,
    isHero,
    hasLathi: cfg.propType === 'lathi',
    disposableMaterials: mats,
  };
}

// ==================================================
// HERO BUILDER FROM WARDROBE STATE
// ==================================================
export function createHeroCharacterFromEquipped(
  equipped: EquippedOutfit,
  customizations: CustomizationItem[],
  showMarkerArrow = true
): StylizedCharacterRig {
  const findItem = (id: string) => customizations.find((c) => c.id === id);

  const shirt = findItem(equipped.shirt);
  const bottom = findItem(equipped.bottom);
  const glasses = findItem(equipped.glasses);
  const hat = findItem(equipped.hat);
  const shoes = findItem(equipped.shoes);
  const watch = findItem(equipped.watch);
  const necklace = findItem(equipped.necklace);

  return buildStylizedCharacter({
    bodyType: 'hero',
    shirtStyle: shirt?.styleName || 'black_polo',
    shirtHex: shirt?.color || '#14161a',
    bottomStyle: bottom?.styleName || 'black_cargo',
    bottomHex: bottom?.color || '#25282e',
    hairStyle: 'hero_wavy',
    beardStyle: 'hero_trimmed',
    hatStyle: hat?.styleName || 'none',
    glassesStyle: glasses?.styleName || 'black_shades',
    shoesStyle: shoes?.styleName || 'combat_boots',
    watchStyle: watch?.styleName || 'none',
    necklaceStyle: necklace?.styleName || 'none',
    propType: 'lathi',
    showMarkerArrow,
  });
}

// ==================================================
// ALL 7 REFERENCE NPC ARCHETYPES
// ==================================================
export function createNPCCharacter(
  archetype: NPCArchetype,
  options?: { variantSeed?: number; showMarkerArrow?: boolean }
): StylizedCharacterRig {
  const seed = options?.variantSeed ?? 0;

  switch (archetype) {
    case 'tea_vendor':
      return buildStylizedCharacter({
        bodyType: 'regular',
        shirtStyle: 'tea_white_shirt',
        shirtHex: '#f8fafc',
        bottomStyle: 'lungi_blue_yellow',
        skinHex: 0xd08952,
        hairStyle: 'short_parted',
        beardStyle: 'thick_moustache',
        shoesStyle: 'sandals',
        propType: 'tea_glass',
        showMarkerArrow: options?.showMarkerArrow,
      });

    case 'grocer':
      return buildStylizedCharacter({
        bodyType: 'stout',
        shirtStyle: 'yellow_blue_polo',
        bottomStyle: 'khaki_pants',
        skinHex: 0xd48e57,
        hairStyle: 'short_parted',
        beardStyle: 'thick_moustache',
        shoesStyle: 'sandals',
        showMarkerArrow: options?.showMarkerArrow,
      });

    case 'rickshaw_driver':
      return buildStylizedCharacter({
        bodyType: 'regular',
        shirtStyle: 'rickshaw_beige_shirt',
        shirtHex: '#e7d5b2',
        bottomStyle: 'lungi_green_gold',
        skinHex: 0xc27742,
        hairStyle: 'short_parted',
        beardStyle: 'light_beard',
        hatStyle: 'gamcha',
        shoesStyle: 'sandals',
        showMarkerArrow: options?.showMarkerArrow,
      });

    case 'bus_driver':
      return buildStylizedCharacter({
        bodyType: 'regular',
        shirtStyle: 'bus_driver_uniform',
        bottomStyle: 'navy_pants',
        bottomHex: '#1e3a8a',
        skinHex: 0xd58f58,
        hairStyle: 'short_parted',
        beardStyle: 'thick_moustache',
        hatStyle: 'driver_cap',
        glassesStyle: 'black_shades',
        watchStyle: 'gold_black',
        shoesStyle: 'police_boots',
        hasEpaulettes: true,
        showMarkerArrow: options?.showMarkerArrow,
      });

    case 'police_officer':
      return buildStylizedCharacter({
        bodyType: 'regular',
        shirtStyle: 'police_uniform',
        bottomStyle: 'navy_pants',
        bottomHex: '#172554',
        skinHex: 0xd48d56,
        hairStyle: 'short_parted',
        beardStyle: 'thick_moustache',
        hatStyle: 'police_cap',
        glassesStyle: 'aviators',
        shoesStyle: 'police_boots',
        hasEpaulettes: true,
        showMarkerArrow: options?.showMarkerArrow,
      });

    case 'female_citizen':
      return buildStylizedCharacter({
        bodyType: 'slim_female',
        shirtStyle: 'female_kameez',
        bottomStyle: 'female_salwar',
        bottomHex: seed % 2 === 0 ? '#a855f7' : '#9333ea',
        skinHex: 0xe3a87c,
        hairStyle: 'female_long',
        beardStyle: 'clean',
        shoesStyle: 'female_flats',
        propType: 'handbag',
        hasDupatta: true,
        showMarkerArrow: options?.showMarkerArrow,
      });

    case 'boss_villain':
      return buildStylizedCharacter({
        bodyType: 'heavy_boss',
        shirtStyle: 'boss_white_suit',
        bottomStyle: 'boss_white_pants',
        skinHex: 0xd48d58,
        hairStyle: 'slick_boss',
        beardStyle: 'thick_moustache',
        glassesStyle: 'black_shades',
        necklaceStyle: 'gold_chain',
        watchStyle: 'gold_black',
        shoesStyle: 'gold_loafers',
        showMarkerArrow: options?.showMarkerArrow,
      });
  }
}

// ==================================================
// FACIAL EXPRESSIONS (5 SHOWCASE + NEUTRAL)
// ==================================================
export function setCharacterExpression(rig: StylizedCharacterRig, expression: HeroExpression) {
  rig.leftBrow.position.y = 0.105;
  rig.rightBrow.position.y = 0.105;
  rig.leftBrow.rotation.z = 0;
  rig.rightBrow.rotation.z = 0;
  rig.eyeMeshes.forEach((e) => e.scale.set(0.048, 0.052, 0.03));

  switch (expression) {
    case 'happy':
      rig.leftBrow.position.y = 0.115;
      rig.rightBrow.position.y = 0.115;
      rig.mouthMesh.scale.set(0.145, 0.038, 0.035);
      break;
    case 'shocked':
      rig.leftBrow.position.y = 0.135;
      rig.rightBrow.position.y = 0.135;
      rig.eyeMeshes.forEach((e) => e.scale.set(0.06, 0.068, 0.035));
      rig.mouthMesh.scale.set(0.075, 0.09, 0.04);
      break;
    case 'angry':
      rig.leftBrow.rotation.z = -0.35;
      rig.rightBrow.rotation.z = 0.35;
      rig.leftBrow.position.y = 0.095;
      rig.rightBrow.position.y = 0.095;
      rig.mouthMesh.scale.set(0.13, 0.048, 0.035);
      break;
    case 'laugh':
      rig.leftBrow.position.y = 0.125;
      rig.rightBrow.position.y = 0.125;
      rig.mouthMesh.scale.set(0.16, 0.075, 0.04);
      break;
    case 'thinking':
      rig.leftBrow.position.y = 0.125;
      rig.rightBrow.position.y = 0.098;
      rig.rightBrow.rotation.z = 0.15;
      rig.mouthMesh.scale.set(0.075, 0.022, 0.035);
      break;
    default:
      rig.mouthMesh.scale.set(rig.isHero ? 0.105 : 0.11, rig.isHero ? 0.02 : 0.026, 0.035);
      break;
  }
}

// ==================================================
// FULL BODY PROCEDURAL ANIMATION ENGINE (GTA 6 LOCOMOTION)
// ==================================================
function computeStrideKnee(legPhase: number, swingFoldAmp: number, plantBend: number): number {
  // Phase-shifted knee bend: folds deeply during swing recovery, extends before heel strike, softens on plant
  const swingRecovery = Math.max(0, Math.cos(legPhase - 0.34)) * swingFoldAmp;
  const weightPlant = Math.max(0, Math.sin(legPhase)) * plantBend;
  return swingRecovery + weightPlant;
}

export function animateCharacterRig(
  rig: StylizedCharacterRig,
  opts: {
    action: CharacterAnimAction;
    speedRatio?: number;
    phase: number;
  }
) {
  const { action, speedRatio = 0, phase } = opts;

  // Clean reset of sub-joints & axes each frame
  rig.leftElbowPivot.rotation.set(0, 0, 0);
  rig.rightElbowPivot.rotation.set(0, 0, 0);
  rig.leftKneePivot.rotation.set(0, 0, 0);
  rig.rightKneePivot.rotation.set(0, 0, 0);
  rig.leftArmPivot.rotation.set(0, 0, 0);
  rig.rightArmPivot.rotation.set(0, 0, 0);
  rig.leftLegPivot.rotation.set(0, 0, 0);
  rig.rightLegPivot.rotation.set(0, 0, 0);
  rig.torsoGroup.rotation.set(0, 0, 0);
  rig.headGroup.rotation.set(0, 0, 0);

  if (action === 'action_kick') {
    rig.rightLegPivot.rotation.x = -1.15;
    rig.rightKneePivot.rotation.x = 0.22;
    rig.leftLegPivot.rotation.x = 0.22;
    rig.rightArmPivot.rotation.x = -1.65;
    rig.rightArmPivot.rotation.z = -0.22;
    rig.rightElbowPivot.rotation.x = -0.55;
    rig.leftArmPivot.rotation.x = 0.55;
    rig.torsoGroup.rotation.x = 0.25;
    rig.torsoGroup.rotation.y = -0.24;
    return;
  }

  if (action === 'jump') {
    rig.leftLegPivot.rotation.x = 0.48;
    rig.leftKneePivot.rotation.x = 0.65;
    rig.rightLegPivot.rotation.x = -0.35;
    rig.rightKneePivot.rotation.x = 0.55;
    rig.leftArmPivot.rotation.x = -1.1;
    rig.leftArmPivot.rotation.z = 0.14;
    rig.rightArmPivot.rotation.x = -2.0;
    rig.rightArmPivot.rotation.z = -0.14;
    rig.torsoGroup.rotation.x = 0.1;
    return;
  }

  if (action === 'walk' || action === 'run' || action === 'female_stroll') {
    const isRun = action === 'run';
    const isStroll = action === 'female_stroll';
    const normSpeed = isRun
      ? THREE.MathUtils.clamp((speedRatio || 1.45) / 1.5, 0.72, 1.25)
      : isStroll
      ? 0.68
      : THREE.MathUtils.clamp(speedRatio || 0.92, 0.45, 1.15);

    const hipAmp = isRun ? 0.88 : isStroll ? 0.44 : 0.56;
    const rawSin = Math.sin(phase);
    const secondHarmonic = Math.sin(phase * 2) * (isRun ? 0.08 : 0.04);

    // Asymmetric human stride: slightly longer forward reach, crisp push-off
    const leftHip = (rawSin + secondHarmonic) * hipAmp * normSpeed;
    const rightHip = (-rawSin + secondHarmonic) * hipAmp * normSpeed;
    rig.leftLegPivot.rotation.x = leftHip;
    rig.rightLegPivot.rotation.x = rightHip;

    // Realistic heel-strike -> stance cushion -> swing knee fold
    const foldAmp = isRun ? 1.18 * normSpeed : isStroll ? 0.52 : 0.74 * normSpeed;
    const plantBend = isRun ? 0.2 : 0.14;
    rig.leftKneePivot.rotation.x = computeStrideKnee(phase, foldAmp, plantBend);
    rig.rightKneePivot.rotation.x = computeStrideKnee(phase + Math.PI, foldAmp, plantBend);

    // Athletic shoulder flare + counter-swinging bent elbows (GTA 6 grounded swagger)
    const shoulderFlare = rig.isHero ? (isRun ? 0.14 : 0.095) : 0.05;
    const armAmp = isRun ? 0.98 * normSpeed : isStroll ? 0.38 : 0.48 * normSpeed;
    const armSwing = rawSin * armAmp;
    const rightArmScale = rig.hasLathi ? (isRun ? 0.82 : 0.72) : 1.0;

    rig.leftArmPivot.rotation.x = -armSwing;
    rig.rightArmPivot.rotation.x = armSwing * rightArmScale;
    rig.leftArmPivot.rotation.z = shoulderFlare;
    rig.rightArmPivot.rotation.z = -shoulderFlare;

    if (isRun) {
      // Sprint pump across slightly inward toward chest centerline
      rig.leftArmPivot.rotation.y = Math.max(0, -armSwing) * 0.22;
      rig.rightArmPivot.rotation.y = -Math.max(0, armSwing) * 0.2;
      rig.leftElbowPivot.rotation.x = -1.04 - Math.max(0, -rawSin) * 0.34;
      rig.rightElbowPivot.rotation.x = -0.96 - Math.max(0, rawSin) * 0.3;
    } else {
      // Confident relaxed street swagger: arm bends smoothly on forward swing
      rig.leftArmPivot.rotation.y = Math.max(0, -armSwing) * 0.08;
      rig.rightArmPivot.rotation.y = -Math.max(0, armSwing) * 0.06;
      rig.leftElbowPivot.rotation.x = -0.22 - Math.max(0, -rawSin) * 0.26;
      rig.rightElbowPivot.rotation.x =
        (rig.hasLathi ? -0.36 : -0.22) - Math.max(0, rawSin) * 0.22;
    }

    // Weighty torso bob, forward sprint lean, shoulder/hip counter-rotation & lateral weight shift
    const verticalBounce = isRun
      ? -0.032 + Math.abs(rawSin) * 0.058 * normSpeed
      : -0.018 + (1 - Math.cos(phase * 2)) * 0.02 * normSpeed;
    rig.torsoGroup.position.y = 0.74 + verticalBounce;
    rig.torsoGroup.rotation.x = isRun
      ? 0.22 * normSpeed + Math.sin(phase * 2) * 0.025
      : (rig.isHero ? 0.055 : 0.045) * normSpeed;
    rig.torsoGroup.rotation.y =
      -rawSin * (isRun ? 0.145 : isStroll ? 0.08 : rig.isHero ? 0.105 : 0.065) * normSpeed;
    rig.torsoGroup.rotation.z =
      rawSin * (isRun ? 0.042 : isStroll ? 0.035 : rig.isHero ? 0.034 : 0.018) * normSpeed;

    // Head stabilization countering torso twist & keeping gaze level during sprint lean
    rig.headGroup.rotation.y =
      rawSin * (isRun ? 0.105 : rig.isHero ? 0.075 : 0.04) * normSpeed;
    rig.headGroup.rotation.x = isRun ? -0.13 * normSpeed : -0.02;
    rig.headGroup.rotation.z = -rawSin * 0.022 * normSpeed;

    if (rig.lungiSkirt) {
      rig.lungiSkirt.rotation.x = rawSin * 0.06;
    }
    return;
  }

  if (action === 'talk') {
    const gesture = Math.sin(phase * 3.5);
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 2) * 0.02;
    rig.torsoGroup.rotation.x = 0.04;
    rig.rightArmPivot.rotation.x = -0.75 + gesture * 0.28;
    rig.rightElbowPivot.rotation.x = -0.85;
    rig.leftArmPivot.rotation.x = -0.35 - gesture * 0.15;
    rig.leftElbowPivot.rotation.x = -0.6;
    rig.headGroup.rotation.y = Math.sin(phase * 1.8) * 0.14;
    rig.headGroup.rotation.x = Math.sin(phase * 3.2) * 0.07;
    return;
  }

  if (action === 'tea_serve') {
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 1.5) * 0.02;
    rig.rightArmPivot.rotation.x = -0.85 + Math.sin(phase * 1.6) * 0.12;
    rig.rightElbowPivot.rotation.x = -0.95;
    rig.leftArmPivot.rotation.x = -0.15;
    rig.headGroup.rotation.y = Math.sin(phase * 0.9) * 0.1;
    return;
  }

  if (action === 'grocer_counter') {
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 1.2) * 0.018;
    rig.leftArmPivot.rotation.x = -0.55;
    rig.leftArmPivot.rotation.z = 0.25;
    rig.leftElbowPivot.rotation.x = -0.95;
    rig.rightArmPivot.rotation.x = -0.55;
    rig.rightArmPivot.rotation.z = -0.25;
    rig.rightElbowPivot.rotation.x = -0.95;
    return;
  }

  if (action === 'rickshaw_pedal') {
    const lean = Math.sin(phase * 1.4) * 0.08;
    rig.torsoGroup.position.y = 0.74 + Math.abs(lean) * 0.15;
    rig.torsoGroup.rotation.x = 0.12;
    rig.leftArmPivot.rotation.x = -0.45 + lean;
    rig.rightArmPivot.rotation.x = -0.45 - lean;
    rig.leftElbowPivot.rotation.x = -0.5;
    rig.rightElbowPivot.rotation.x = -0.5;
    return;
  }

  if (action === 'bus_drive') {
    const steer = Math.sin(phase * 1.8) * 0.28;
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 6) * 0.012;
    rig.leftArmPivot.rotation.x = -0.95 + steer * 0.4;
    rig.rightArmPivot.rotation.x = -0.95 - steer * 0.4;
    rig.leftElbowPivot.rotation.x = -0.55;
    rig.rightElbowPivot.rotation.x = -0.55;
    return;
  }

  if (action === 'police_alert') {
    rig.torsoGroup.position.y = 0.74;
    rig.rightArmPivot.rotation.x = -1.65;
    rig.rightElbowPivot.rotation.x = -0.35;
    rig.leftArmPivot.rotation.x = -0.2;
    return;
  }

  if (action === 'boss_command') {
    const wave = Math.sin(phase * 2.2) * 0.15;
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase) * 0.015;
    rig.rightArmPivot.rotation.x = -1.35 + wave;
    rig.rightElbowPivot.rotation.x = -0.15;
    rig.leftArmPivot.rotation.x = -0.35;
    rig.leftElbowPivot.rotation.x = -0.7;
    return;
  }

  if (action === 'reaction_think') {
    rig.torsoGroup.position.y = 0.74;
    rig.rightArmPivot.rotation.x = -1.1;
    rig.rightElbowPivot.rotation.x = -1.35;
    rig.leftArmPivot.rotation.x = -0.35;
    rig.leftElbowPivot.rotation.x = -0.8;
    rig.headGroup.rotation.z = 0.1;
    return;
  }

  if (action === 'reaction_happy' || action === 'reaction_laugh') {
    const bounce = Math.abs(Math.sin(phase * 4)) * 0.06;
    rig.torsoGroup.position.y = 0.74 + bounce;
    rig.leftArmPivot.rotation.x = -0.8;
    rig.rightArmPivot.rotation.x = -2.2 + Math.sin(phase * 5) * 0.2;
    rig.headGroup.rotation.x = -0.08;
    return;
  }

  if (action === 'reaction_shocked') {
    rig.torsoGroup.position.y = 0.74;
    rig.torsoGroup.rotation.x = -0.14;
    rig.leftArmPivot.rotation.x = -1.8;
    rig.rightArmPivot.rotation.x = -1.8;
    rig.leftArmPivot.rotation.z = 0.35;
    rig.rightArmPivot.rotation.z = -0.35;
    return;
  }

  if (action === 'reaction_angry') {
    rig.torsoGroup.position.y = 0.74;
    rig.torsoGroup.rotation.x = 0.14;
    rig.leftArmPivot.rotation.x = -0.85;
    rig.rightArmPivot.rotation.x = -0.85;
    rig.leftElbowPivot.rotation.x = -0.8;
    rig.rightElbowPivot.rotation.x = -0.8;
    return;
  }

  // Confident GTA 6 Hero Athletic Stance vs Gentle NPC Idle
  if (rig.isHero) {
    const breath = Math.sin(phase * 0.95);
    rig.torsoGroup.position.y = 0.74 + breath * 0.008;
    rig.torsoGroup.rotation.y = -0.08 + Math.sin(phase * 0.45) * 0.04;
    rig.torsoGroup.rotation.z = 0.018;
    rig.leftLegPivot.rotation.x = -0.05;
    rig.leftKneePivot.rotation.x = 0.08;
    rig.rightLegPivot.rotation.x = 0.06;
    rig.rightKneePivot.rotation.x = 0.04;
    rig.leftArmPivot.rotation.z = 0.095;
    rig.rightArmPivot.rotation.z = -0.105;
    rig.leftArmPivot.rotation.x = 0.04 + breath * 0.025;
    rig.rightArmPivot.rotation.x = -0.08 - breath * 0.02;
    rig.leftElbowPivot.rotation.x = -0.24;
    rig.rightElbowPivot.rotation.x = rig.hasLathi ? -0.38 : -0.26;
    rig.headGroup.rotation.y = 0.07 + Math.sin(phase * 0.5) * 0.06;
    return;
  }

  const breath = Math.sin(phase * 1.1) * 0.03;
  rig.leftArmPivot.rotation.x = breath;
  rig.rightArmPivot.rotation.x = -breath;
  rig.leftElbowPivot.rotation.x = -0.1;
  rig.rightElbowPivot.rotation.x = -0.1;
  rig.torsoGroup.position.y = 0.74 + breath * 0.28;
}

export function disposeCharacterRig(rig: StylizedCharacterRig | null) {
  if (!rig) return;
  rig.disposableMaterials.forEach((m) => m.dispose());
  rig.disposableMaterials.length = 0;
}
