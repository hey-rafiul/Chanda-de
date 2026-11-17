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
  disposableMaterials: THREE.Material[];
}

export interface CharacterBuildConfig {
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
  const skinCol = cfg.skinHex ?? 0xdc935b;
  const skinMat = makeStdMat({ color: skinCol, roughness: 0.62 }, mats);
  const hairMat = makeStdMat({ color: 0x16161a, roughness: 0.85 }, mats);
  const shirtTex = getShirtTexture(cfg.shirtStyle, cfg.shirtHex || '#1f2937');
  const shirtMat = makeStdMat({ map: shirtTex, roughness: 0.58 }, mats);

  const isLungi =
    cfg.bottomStyle === 'check_lungi' ||
    cfg.bottomStyle === 'lungi_blue_yellow' ||
    cfg.bottomStyle === 'lungi_green_gold';
  const bottomTex = getBottomTexture(cfg.bottomStyle, cfg.bottomHex || '#1e293b');
  const bottomMat = makeStdMat({ map: bottomTex, roughness: 0.72 }, mats);

  const goldMat = makeStdMat({ color: 0xfacc15, metalness: 0.85, roughness: 0.22 }, mats);
  const darkBeltMat = makeStdMat({ color: 0x18181b, roughness: 0.75 }, mats);

  const torsoWidthScale =
    bodyType === 'heavy_boss'
      ? 1.32
      : bodyType === 'stout'
      ? 1.18
      : bodyType === 'slim_female'
      ? 0.86
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
    { color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false },
    mats
  );
  const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(0.44, 18), shadowMat);
  shadowBlob.rotation.x = -Math.PI / 2;
  shadowBlob.position.y = 0.03;
  root.add(shadowBlob);

  // Shoes Material setup
  const shoesStyle = cfg.shoesStyle || 'white_red';
  const shoeMainColor =
    shoesStyle === 'white_red'
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
    shoesStyle === 'white_red'
      ? 0xdc2626
      : shoesStyle === 'black_white'
      ? 0xf8fafc
      : shoesStyle === 'gold_loafers'
      ? 0xfef08a
      : 0x334155;

  const shoeMainMat = makeStdMat({ color: shoeMainColor, roughness: 0.45 }, mats);
  const shoeAccentMat = makeStdMat({ color: shoeAccentColor, roughness: 0.4 }, mats);
  const soleMat = makeStdMat({ color: 0xf8fafc, roughness: 0.75 }, mats);

  // ================= LEGS (Hip y = 0.74) =================
  const hipX = bodyType === 'heavy_boss' ? 0.18 : bodyType === 'slim_female' ? 0.11 : 0.14;
  const legThickness = bodyType === 'heavy_boss' ? 0.135 : bodyType === 'slim_female' ? 0.095 : 0.115;

  const makeLeg = (xOffset: number) => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(xOffset, 0.74, 0);

    const upperLeg = new THREE.Mesh(cylGeo, isLungi ? skinMat : bottomMat);
    upperLeg.scale.set(legThickness, 0.34, legThickness);
    upperLeg.position.y = -0.17;
    upperLeg.castShadow = true;
    hipPivot.add(upperLeg);

    // Cargo pocket bulge on Hero's cargo jeans
    if (cfg.bottomStyle === 'black_cargo' || cfg.bottomStyle === 'blue_jeans') {
      const pocket = new THREE.Mesh(boxGeo, bottomMat);
      pocket.scale.set(0.05, 0.14, 0.11);
      pocket.position.set(xOffset < 0 ? -0.11 : 0.11, -0.22, 0.01);
      hipPivot.add(pocket);
    }

    const kneePivot = new THREE.Group();
    kneePivot.position.set(0, -0.34, 0);
    hipPivot.add(kneePivot);

    const lowerLeg = new THREE.Mesh(cylGeo, isLungi ? skinMat : bottomMat);
    lowerLeg.scale.set(legThickness * 0.9, 0.32, legThickness * 0.9);
    lowerLeg.position.y = -0.16;
    lowerLeg.castShadow = true;
    kneePivot.add(lowerLeg);

    // Detailed Sneakers / Shoes
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.35, 0.05);
    kneePivot.add(shoeGroup);

    const shoeUpper = new THREE.Mesh(boxGeo, shoeMainMat);
    shoeUpper.scale.set(0.165, 0.09, 0.27);
    shoeUpper.position.y = 0.025;
    shoeUpper.castShadow = true;
    shoeGroup.add(shoeUpper);

    const shoeSole = new THREE.Mesh(boxGeo, soleMat);
    shoeSole.scale.set(0.175, 0.035, 0.285);
    shoeSole.position.y = -0.032;
    shoeGroup.add(shoeSole);

    // Signature Nike-style side swoosh/stripe on sneakers
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

  // Optional 3D Lungi Wrap Skirt (Tea Vendor / Rickshaw Driver / Classic Hero Lungi)
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

  // Belt & Gold Buckle
  const belt = new THREE.Mesh(boxGeo, darkBeltMat);
  belt.scale.set(0.52 * torsoWidthScale, 0.08, 0.31 * torsoDepthScale);
  belt.position.y = 0.04;
  torsoGroup.add(belt);

  if (bodyType === 'hero' || bodyType === 'heavy_boss' || cfg.shirtStyle === 'police_uniform') {
    const buckle = new THREE.Mesh(boxGeo, goldMat);
    buckle.scale.set(0.09, 0.075, 0.04);
    buckle.position.set(0, 0.04, 0.155 * torsoDepthScale);
    torsoGroup.add(buckle);
  }

  // Chest / Jacket / Kameez
  const chest = new THREE.Mesh(boxGeo, shirtMat);
  chest.scale.set(0.54 * torsoWidthScale, 0.64, 0.31 * torsoDepthScale);
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

  // Shirt Collar / Open Lapels
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

  // Optional Golden Chain Necklace (Hero unlockable & Boss NPC!)
  if (cfg.necklaceStyle === 'gold_chain') {
    const chain = new THREE.Mesh(torusGeo, goldMat);
    chain.scale.set(0.14, 0.12, 0.14);
    chain.rotation.x = Math.PI / 2 - 0.45;
    chain.position.set(0, 0.64, 0.11 * torsoDepthScale);
    torsoGroup.add(chain);
  }

  // ================= 2-SEGMENT ARMS =================
  const shoulderX = 0.34 * torsoWidthScale;
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
    shoulderPivot.position.set(xOffset, 0.61, 0);

    const armThickness =
      bodyType === 'heavy_boss' ? 0.105 : bodyType === 'slim_female' ? 0.072 : 0.09;

    const upperArm = new THREE.Mesh(cylGeo, shirtMat);
    upperArm.scale.set(armThickness, 0.26, armThickness);
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -0.26, 0);
    shoulderPivot.add(elbowPivot);

    const forearm = new THREE.Mesh(
      cylGeo,
      sleeveLen === 'long' ? shirtMat : skinMat
    );
    forearm.scale.set(armThickness * 0.86, 0.25, armThickness * 0.86);
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    elbowPivot.add(forearm);

    const hand = new THREE.Mesh(sphereGeo, skinMat);
    hand.scale.set(armThickness * 0.92, armThickness * 0.95, armThickness * 0.92);
    hand.position.y = -0.27;
    elbowPivot.add(hand);

    // Wristwatch on Left Wrist (Hero signature + customization!)
    if (isLeft && cfg.watchStyle && cfg.watchStyle !== 'none') {
      const band = new THREE.Mesh(cylGeo, darkBeltMat);
      band.scale.set(armThickness * 0.96, 0.045, armThickness * 0.96);
      band.position.y = -0.21;
      elbowPivot.add(band);

      const dial = new THREE.Mesh(boxGeo, goldMat);
      dial.scale.set(0.055, 0.05, 0.055);
      dial.position.set(0, -0.21, armThickness * 0.85);
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

      // Black grip wrap around hand hold
      const grip = new THREE.Mesh(cylGeo, gripMat);
      grip.scale.set(0.038, 0.2, 0.038);
      grip.position.y = -0.02;
      lathiGroup.add(grip);

      // Bamboo joint rings along the lathi
      [-0.22, 0.16, 0.42, 0.66].forEach((ny) => {
        const ring = new THREE.Mesh(cylGeo, nodeRingMat);
        ring.scale.set(0.038, 0.022, 0.038);
        ring.position.y = ny;
        lathiGroup.add(ring);
      });

      // Brass/metal tip cap
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

  // ================= HEAD & EXPRESSIONS (y = 0.88 inside torsoGroup) =================
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.89;
  torsoGroup.add(headGroup);

  const head = new THREE.Mesh(sphereGeo, skinMat);
  head.scale.set(
    bodyType === 'heavy_boss' ? 0.25 : bodyType === 'slim_female' ? 0.215 : 0.23,
    0.255,
    0.235
  );
  head.castShadow = true;
  headGroup.add(head);

  // Ears
  [-0.225, 0.225].forEach((ex) => {
    const ear = new THREE.Mesh(sphereGeo, skinMat);
    ear.scale.set(0.042, 0.062, 0.042);
    ear.position.set(ex, 0.0, -0.01);
    headGroup.add(ear);
  });

  // Stylized Hair Variants
  if (cfg.hairStyle === 'hero_wavy') {
    const crown = new THREE.Mesh(sphereGeo, hairMat);
    crown.scale.set(0.245, 0.17, 0.25);
    crown.position.set(0, 0.15, -0.02);
    headGroup.add(crown);

    const waveTop = new THREE.Mesh(boxGeo, hairMat);
    waveTop.scale.set(0.32, 0.12, 0.24);
    waveTop.position.set(-0.02, 0.24, 0.04);
    waveTop.rotation.z = 0.16;
    waveTop.rotation.x = -0.15;
    headGroup.add(waveTop);

    const waveCurl = new THREE.Mesh(sphereGeo, hairMat);
    waveCurl.scale.set(0.14, 0.09, 0.13);
    waveCurl.position.set(0.08, 0.23, 0.11);
    headGroup.add(waveCurl);

    // Sideburns
    [-0.205, 0.205].forEach((sx) => {
      const sb = new THREE.Mesh(boxGeo, hairMat);
      sb.scale.set(0.04, 0.13, 0.08);
      sb.position.set(sx, 0.02, 0.04);
      headGroup.add(sb);
    });
  } else if (cfg.hairStyle === 'female_long') {
    const topHair = new THREE.Mesh(sphereGeo, hairMat);
    topHair.scale.set(0.235, 0.18, 0.245);
    topHair.position.set(0, 0.13, -0.02);
    headGroup.add(topHair);

    // Flowing long locks down back & shoulders
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

  // Nose
  const nose = new THREE.Mesh(sphereGeo, skinMat);
  nose.scale.set(0.038, 0.045, 0.052);
  nose.position.set(0, -0.01, 0.242);
  headGroup.add(nose);

  // Animated 3D Mouth
  const mouthMat = makeStdMat({ color: 0x7f1d1d, roughness: 0.5 }, mats);
  const mouthMesh = new THREE.Mesh(boxGeo, mouthMat);
  mouthMesh.scale.set(0.11, 0.026, 0.035);
  mouthMesh.position.set(0, -0.095, 0.222);
  headGroup.add(mouthMesh);

  // Beard / Moustache variants
  if (cfg.beardStyle === 'hero_trimmed') {
    const stache = new THREE.Mesh(boxGeo, hairMat);
    stache.scale.set(0.16, 0.028, 0.04);
    stache.position.set(0, -0.055, 0.228);
    headGroup.add(stache);

    const jawBeard = new THREE.Mesh(cylGeo, hairMat);
    jawBeard.scale.set(0.195, 0.1, 0.175);
    jawBeard.position.set(0, -0.145, 0.045);
    headGroup.add(jawBeard);
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

  // Eyewear / Black Sunglasses / Aviators / Gold Shades
  const glassesStyle = cfg.glassesStyle || 'none';
  if (glassesStyle !== 'none') {
    const isGold = glassesStyle === 'gold_shades';
    const frameMat = makeStdMat(
      { color: isGold ? 0xfacc15 : 0x09090b, metalness: 0.78, roughness: 0.2 },
      mats
    );
    const lensMat = makeStdMat(
      {
        color: isGold ? 0x1e293b : 0x05070b,
        metalness: 0.45,
        roughness: 0.12,
      },
      mats
    );

    [-0.082, 0.082].forEach((lx) => {
      const lens = new THREE.Mesh(boxGeo, lensMat);
      lens.scale.set(0.125, 0.082, 0.03);
      lens.position.set(lx, 0.045, 0.242);
      headGroup.add(lens);

      const frame = new THREE.Mesh(boxGeo, frameMat);
      frame.scale.set(0.14, 0.094, 0.02);
      frame.position.set(lx, 0.045, 0.236);
      headGroup.add(frame);
    });

    const bridge = new THREE.Mesh(boxGeo, frameMat);
    bridge.scale.set(0.08, 0.022, 0.025);
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
    shirtStyle: shirt?.styleName || 'black_floral',
    shirtHex: shirt?.color || '#111827',
    bottomStyle: bottom?.styleName || 'black_cargo',
    bottomHex: bottom?.color || '#172033',
    hairStyle: 'hero_wavy',
    beardStyle: 'hero_trimmed',
    hatStyle: hat?.styleName || 'none',
    glassesStyle: glasses?.styleName || 'black_shades',
    shoesStyle: shoes?.styleName || 'white_red',
    watchStyle: watch?.styleName || 'gold_black',
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
      rig.mouthMesh.scale.set(0.11, 0.026, 0.035);
      break;
  }
}

// ==================================================
// FULL BODY PROCEDURAL ANIMATION ENGINE
// ==================================================
export function animateCharacterRig(
  rig: StylizedCharacterRig,
  opts: {
    action: CharacterAnimAction;
    speedRatio?: number;
    phase: number;
  }
) {
  const { action, speedRatio = 0, phase } = opts;

  // Reset sub-joint elbows/knees gently unless overridden
  rig.leftElbowPivot.rotation.set(0, 0, 0);
  rig.rightElbowPivot.rotation.set(0, 0, 0);
  rig.leftKneePivot.rotation.set(0, 0, 0);
  rig.rightKneePivot.rotation.set(0, 0, 0);
  rig.leftArmPivot.rotation.z = 0;
  rig.rightArmPivot.rotation.z = 0;
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
    return;
  }

  if (action === 'jump') {
    rig.leftLegPivot.rotation.x = 0.48;
    rig.leftKneePivot.rotation.x = 0.65;
    rig.rightLegPivot.rotation.x = -0.35;
    rig.rightKneePivot.rotation.x = 0.55;
    rig.leftArmPivot.rotation.x = -1.1;
    rig.rightArmPivot.rotation.x = -2.2;
    rig.torsoGroup.rotation.x = 0.08;
    return;
  }

  if (action === 'walk' || action === 'run' || action === 'female_stroll') {
    const mult = action === 'run' ? 1.15 : action === 'female_stroll' ? 0.68 : 0.85;
    const swing = Math.sin(phase) * 0.72 * Math.max(0.5, Math.min(1.25, speedRatio || mult));
    rig.leftLegPivot.rotation.x = swing;
    rig.rightLegPivot.rotation.x = -swing;
    rig.leftKneePivot.rotation.x = Math.max(0, -swing * 0.65);
    rig.rightKneePivot.rotation.x = Math.max(0, swing * 0.65);

    rig.leftArmPivot.rotation.x = -swing * 0.85;
    rig.rightArmPivot.rotation.x = swing * 0.85;
    rig.leftElbowPivot.rotation.x = -0.25;
    rig.rightElbowPivot.rotation.x = -0.25;

    rig.torsoGroup.position.y = 0.74 + Math.abs(Math.sin(phase)) * (action === 'run' ? 0.07 : 0.04);
    rig.torsoGroup.rotation.x = (action === 'run' ? 0.14 : 0.06) * Math.max(0.6, speedRatio || 0.8);
    if (action === 'female_stroll') {
      rig.torsoGroup.rotation.y = Math.sin(phase) * 0.06;
    }
    if (rig.lungiSkirt) {
      rig.lungiSkirt.rotation.x = Math.sin(phase) * 0.06;
    }
    return;
  }

  if (action === 'talk') {
    const gesture = Math.sin(phase * 3.5);
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 2) * 0.02;
    rig.torsoGroup.rotation.x = 0.04;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.rightArmPivot.rotation.x = -0.75 + gesture * 0.28;
    rig.rightElbowPivot.rotation.x = -0.85;
    rig.leftArmPivot.rotation.x = -0.35 - gesture * 0.15;
    rig.leftElbowPivot.rotation.x = -0.6;
    rig.headGroup.rotation.y = Math.sin(phase * 1.8) * 0.14;
    rig.headGroup.rotation.x = Math.sin(phase * 3.2) * 0.07;
    return;
  }

  if (action === 'tea_serve') {
    // Raises tea glass cheerfully in right hand
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 1.5) * 0.02;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.rightArmPivot.rotation.x = -0.85 + Math.sin(phase * 1.6) * 0.12;
    rig.rightElbowPivot.rotation.x = -0.95;
    rig.leftArmPivot.rotation.x = -0.15;
    rig.headGroup.rotation.y = Math.sin(phase * 0.9) * 0.1;
    return;
  }

  if (action === 'grocer_counter') {
    // Classic crossed/welcoming arms stance
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 1.2) * 0.018;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
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
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.leftArmPivot.rotation.x = -0.45 + lean;
    rig.rightArmPivot.rotation.x = -0.45 - lean;
    rig.leftElbowPivot.rotation.x = -0.5;
    rig.rightElbowPivot.rotation.x = -0.5;
    return;
  }

  if (action === 'bus_drive') {
    const steer = Math.sin(phase * 1.8) * 0.28;
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase * 6) * 0.012;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.leftArmPivot.rotation.x = -0.95 + steer * 0.4;
    rig.rightArmPivot.rotation.x = -0.95 - steer * 0.4;
    rig.leftElbowPivot.rotation.x = -0.55;
    rig.rightElbowPivot.rotation.x = -0.55;
    return;
  }

  if (action === 'police_alert') {
    // Right hand raised in halt/whistle salute
    rig.torsoGroup.position.y = 0.74;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.rightArmPivot.rotation.x = -1.65;
    rig.rightElbowPivot.rotation.x = -0.35;
    rig.leftArmPivot.rotation.x = -0.2;
    return;
  }

  if (action === 'boss_command') {
    // Intimidating VIP pointing gesture
    const wave = Math.sin(phase * 2.2) * 0.15;
    rig.torsoGroup.position.y = 0.74 + Math.sin(phase) * 0.015;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.rightArmPivot.rotation.x = -1.35 + wave;
    rig.rightElbowPivot.rotation.x = -0.15;
    rig.leftArmPivot.rotation.x = -0.35;
    rig.leftElbowPivot.rotation.x = -0.7;
    return;
  }

  if (action === 'reaction_think') {
    rig.torsoGroup.position.y = 0.74;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
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
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.leftArmPivot.rotation.x = -0.8;
    rig.rightArmPivot.rotation.x = -2.2 + Math.sin(phase * 5) * 0.2;
    rig.headGroup.rotation.x = -0.08;
    return;
  }

  if (action === 'reaction_shocked') {
    rig.torsoGroup.position.y = 0.74;
    rig.torsoGroup.rotation.x = -0.14;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.leftArmPivot.rotation.x = -1.8;
    rig.rightArmPivot.rotation.x = -1.8;
    rig.leftArmPivot.rotation.z = 0.35;
    rig.rightArmPivot.rotation.z = -0.35;
    return;
  }

  if (action === 'reaction_angry') {
    rig.torsoGroup.position.y = 0.74;
    rig.torsoGroup.rotation.x = 0.14;
    rig.leftLegPivot.rotation.x = 0;
    rig.rightLegPivot.rotation.x = 0;
    rig.leftArmPivot.rotation.x = -0.85;
    rig.rightArmPivot.rotation.x = -0.85;
    rig.leftElbowPivot.rotation.x = -0.8;
    rig.rightElbowPivot.rotation.x = -0.8;
    return;
  }

  // Default gentle idle breathing
  const breath = Math.sin(phase * 1.1) * 0.03;
  rig.leftLegPivot.rotation.x = 0;
  rig.rightLegPivot.rotation.x = 0;
  rig.leftArmPivot.rotation.x = breath;
  rig.rightArmPivot.rotation.x = -breath;
  rig.leftElbowPivot.rotation.x = -0.1;
  rig.rightElbowPivot.rotation.x = -0.1;
  rig.torsoGroup.position.y = 0.74 + breath * 0.28;
  rig.torsoGroup.rotation.x = 0;
  rig.torsoGroup.rotation.y = 0;
}

export function disposeCharacterRig(rig: StylizedCharacterRig | null) {
  if (!rig) return;
  rig.disposableMaterials.forEach((m) => m.dispose());
  rig.disposableMaterials.length = 0;
}
