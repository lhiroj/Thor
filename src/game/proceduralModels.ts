/**
 * THOR: GOD OF THUNDER - Procedural 3D Model Generation
 * Composite 3-12 part procedural models using PBR MeshStandardMaterial.
 * Zero external GLTF/OBJ assets required.
 */
import * as THREE from 'three';

// Procedural Runic & Metallic Bump Textures
function createRunicTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22262d';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#5bc0eb';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Draw Norse runes: Thurisaz (ᚦ), Sowilo (ᛋ), Tiwaz (ᛏ), Algiz (ᛉ)
  const runes = [
    // Thurisaz
    () => { ctx.moveTo(40, 30); ctx.lineTo(40, 100); ctx.moveTo(40, 50); ctx.lineTo(70, 65); ctx.lineTo(40, 80); },
    // Sowilo (Lightning rune)
    () => { ctx.moveTo(110, 30); ctx.lineTo(130, 60); ctx.lineTo(105, 75); ctx.lineTo(125, 105); },
    // Tiwaz (Arrow of Tyr)
    () => { ctx.moveTo(180, 40); ctx.lineTo(180, 105); ctx.moveTo(160, 60); ctx.lineTo(180, 40); ctx.lineTo(200, 60); },
    // Algiz (Protection)
    () => { ctx.moveTo(70, 150); ctx.lineTo(70, 220); ctx.moveTo(45, 175); ctx.lineTo(70, 195); ctx.moveTo(95, 175); ctx.lineTo(70, 195); },
    // Sowilo 2
    () => { ctx.moveTo(170, 150); ctx.lineTo(190, 180); ctx.lineTo(165, 195); ctx.lineTo(185, 225); }
  ];

  ctx.beginPath();
  runes.forEach(draw => draw());
  ctx.stroke();

  // Add glowing rune core
  ctx.strokeStyle = '#e0f7fa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  runes.forEach(draw => draw());
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const runicTexture = createRunicTexture();

// Shared PBR Materials
const MAT_URU_HAMMER = new THREE.MeshStandardMaterial({
  color: 0x90a4ae,
  metalness: 0.85,
  roughness: 0.22,
  map: runicTexture,
  bumpMap: runicTexture,
  bumpScale: 0.05,
});

const MAT_HAMMER_HANDLE = new THREE.MeshStandardMaterial({
  color: 0x4a2e18,
  roughness: 0.75,
  metalness: 0.1,
});

const MAT_HAMMER_STRAP = new THREE.MeshStandardMaterial({
  color: 0x8d6e63,
  roughness: 0.8,
  metalness: 0.05,
});

const MAT_THOR_SKIN = new THREE.MeshStandardMaterial({
  color: 0xf5cba7,
  roughness: 0.65,
  metalness: 0.0,
});

const MAT_THOR_BEARD = new THREE.MeshStandardMaterial({
  color: 0xdfa030,
  roughness: 0.7,
  metalness: 0.1,
});

const MAT_THOR_HAIR = new THREE.MeshStandardMaterial({
  color: 0xedb945,
  roughness: 0.6,
  metalness: 0.15,
});

const MAT_THOR_ARMOR_DARK = new THREE.MeshStandardMaterial({
  color: 0x212529,
  metalness: 0.8,
  roughness: 0.35,
});

const MAT_THOR_ARMOR_SILVER = new THREE.MeshStandardMaterial({
  color: 0xd6dbdf,
  metalness: 0.9,
  roughness: 0.2,
});

const MAT_THOR_ARMOR_GOLD = new THREE.MeshStandardMaterial({
  color: 0xf4d03f,
  metalness: 0.85,
  roughness: 0.25,
});

const MAT_THOR_CAPE = new THREE.MeshStandardMaterial({
  color: 0xc0392b,
  roughness: 0.85,
  metalness: 0.05,
  side: THREE.DoubleSide,
});

const MAT_LIGHTNING_AURA = new THREE.MeshBasicMaterial({
  color: 0x00e5ff,
  transparent: true,
  opacity: 0.45,
  wireframe: true,
});

export interface ThorCharacterModel {
  group: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Mesh;
  rightHandSocket: THREE.Group;
  mjolnir: THREE.Group;
  auraMesh: THREE.Mesh;
  glowEyes: THREE.Mesh[];
  animTime: number;
}

/**
 * Creates Thor's legendary war hammer Mjölnir
 */
export function createMjolnirModel(): THREE.Group {
  const hammer = new THREE.Group();

  // 1. Hammer Head (Main rectangular beveled block)
  const headGeo = new THREE.BoxGeometry(0.38, 0.26, 0.58);
  const headMesh = new THREE.Mesh(headGeo, MAT_URU_HAMMER);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headMesh.position.y = 0.5;
  hammer.add(headMesh);

  // 2. Beveled Cap Rings on left & right faces
  const capGeo = new THREE.BoxGeometry(0.42, 0.28, 0.1);
  const capLeft = new THREE.Mesh(capGeo, MAT_THOR_ARMOR_SILVER);
  capLeft.position.set(0, 0.5, 0.25);
  const capRight = new THREE.Mesh(capGeo, MAT_THOR_ARMOR_SILVER);
  capRight.position.set(0, 0.5, -0.25);
  hammer.add(capLeft);
  hammer.add(capRight);

  // 3. Wooden / Leather Handle
  const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 12);
  const handleMesh = new THREE.Mesh(handleGeo, MAT_HAMMER_HANDLE);
  handleMesh.castShadow = true;
  handleMesh.position.y = 0.2;
  hammer.add(handleMesh);

  // 4. Silver Handle Grips / Rings
  const ringGeo = new THREE.TorusGeometry(0.045, 0.01, 8, 16);
  for (let y = 0.05; y <= 0.45; y += 0.1) {
    const ring = new THREE.Mesh(ringGeo, MAT_THOR_ARMOR_SILVER);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    hammer.add(ring);
  }

  // 5. Pommel & Leather Wrist Strap
  const pommelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
  const pommel = new THREE.Mesh(pommelGeo, MAT_THOR_ARMOR_SILVER);
  pommel.position.y = -0.15;
  hammer.add(pommel);

  const strapGeo = new THREE.TorusGeometry(0.07, 0.015, 6, 16, Math.PI * 1.5);
  const strap = new THREE.Mesh(strapGeo, MAT_HAMMER_STRAP);
  strap.position.set(0, -0.22, 0);
  hammer.add(strap);

  return hammer;
}

/**
 * Creates Thor Character 3D Model with complete rig & joints
 */
export function createThorCharacter(): ThorCharacterModel {
  const root = new THREE.Group();
  root.position.y = 0; // Grounded pivot at bottom center

  // --- Pelvis & Lower Torso ---
  const pelvisGeo = new THREE.BoxGeometry(0.48, 0.25, 0.32);
  const pelvis = new THREE.Mesh(pelvisGeo, MAT_THOR_ARMOR_DARK);
  pelvis.position.y = 1.05;
  pelvis.castShadow = true;
  root.add(pelvis);

  // Belt of Strength (Megingjörð) with golden buckle
  const beltGeo = new THREE.BoxGeometry(0.52, 0.1, 0.35);
  const belt = new THREE.Mesh(beltGeo, MAT_THOR_ARMOR_GOLD);
  belt.position.y = 1.15;
  root.add(belt);

  // --- Torso Group (Pivoting at chest) ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.2, 0);
  root.add(torsoGroup);

  // Upper Chest Plate
  const chestGeo = new THREE.BoxGeometry(0.62, 0.55, 0.38);
  const chest = new THREE.Mesh(chestGeo, MAT_THOR_ARMOR_DARK);
  chest.position.y = 0.28;
  chest.castShadow = true;
  chest.receiveShadow = true;
  torsoGroup.add(chest);

  // Iconic 6 Asgardian Roundels / Discs on Chestplate
  const discGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16);
  const discPositions = [
    [-0.18, 0.42, 0.2],
    [0.18, 0.42, 0.2],
    [-0.18, 0.26, 0.2],
    [0.18, 0.26, 0.2],
    [-0.18, 0.1, 0.2],
    [0.18, 0.1, 0.2],
  ];
  discPositions.forEach(([x, y, z]) => {
    const disc = new THREE.Mesh(discGeo, MAT_THOR_ARMOR_SILVER);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(x, y, z);
    torsoGroup.add(disc);
  });

  // Flowing Crimson Cape (Beveled Plane attached behind shoulders)
  const capeGeo = new THREE.PlaneGeometry(0.75, 1.35, 6, 8);
  const cape = new THREE.Mesh(capeGeo, MAT_THOR_CAPE);
  cape.position.set(0, 0.2, -0.22);
  cape.rotation.x = 0.08;
  cape.castShadow = true;
  torsoGroup.add(cape);

  // Cape Shoulder Golden Brooches
  const broochGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const broochL = new THREE.Mesh(broochGeo, MAT_THOR_ARMOR_GOLD);
  broochL.position.set(-0.3, 0.5, -0.15);
  const broochR = new THREE.Mesh(broochGeo, MAT_THOR_ARMOR_GOLD);
  broochR.position.set(0.3, 0.5, -0.15);
  torsoGroup.add(broochL);
  torsoGroup.add(broochR);

  // --- Head Group ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.65, 0);
  torsoGroup.add(headGroup);

  // Head/Face
  const headGeo = new THREE.BoxGeometry(0.28, 0.32, 0.28);
  const head = new THREE.Mesh(headGeo, MAT_THOR_SKIN);
  head.position.y = 0.15;
  headGroup.add(head);

  // Blonde Hair (Top & Back)
  const hairGeo = new THREE.BoxGeometry(0.32, 0.25, 0.34);
  const hair = new THREE.Mesh(hairGeo, MAT_THOR_HAIR);
  hair.position.set(0, 0.25, -0.02);
  headGroup.add(hair);

  const hairBackGeo = new THREE.BoxGeometry(0.3, 0.35, 0.12);
  const hairBack = new THREE.Mesh(hairBackGeo, MAT_THOR_HAIR);
  hairBack.position.set(0, 0.05, -0.16);
  headGroup.add(hairBack);

  // Norse Beard & Mustache
  const beardGeo = new THREE.BoxGeometry(0.26, 0.22, 0.18);
  const beard = new THREE.Mesh(beardGeo, MAT_THOR_BEARD);
  beard.position.set(0, 0.04, 0.1);
  headGroup.add(beard);

  // Glowing Blue Eyes
  const eyeGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.07, 0.18, 0.15);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.07, 0.18, 0.15);
  headGroup.add(eyeL);
  headGroup.add(eyeR);

  // Norse Circlet / Winged Helmet Crown
  const helmetBandGeo = new THREE.CylinderGeometry(0.18, 0.19, 0.08, 16);
  const helmetBand = new THREE.Mesh(helmetBandGeo, MAT_THOR_ARMOR_SILVER);
  helmetBand.position.y = 0.26;
  headGroup.add(helmetBand);

  // Silver Wing Accents on Helmet
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.25, 0.18);
  wingShape.lineTo(0.2, 0.38);
  wingShape.lineTo(0.05, 0.25);
  wingShape.closePath();
  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const wingL = new THREE.Mesh(wingGeo, MAT_THOR_ARMOR_SILVER);
  wingL.position.set(-0.18, 0.2, 0);
  wingL.rotation.y = -Math.PI / 4;
  wingL.scale.set(0.7, 0.7, 0.7);
  headGroup.add(wingL);

  const wingR = new THREE.Mesh(wingGeo, MAT_THOR_ARMOR_SILVER);
  wingR.position.set(0.18, 0.2, 0);
  wingR.rotation.y = Math.PI + Math.PI / 4;
  wingR.scale.set(0.7, 0.7, 0.7);
  headGroup.add(wingR);

  // --- Left Arm ---
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.38, 0.45, 0);
  torsoGroup.add(leftArm);

  const bicepL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.3, 12), MAT_THOR_SKIN);
  bicepL.position.y = -0.15;
  leftArm.add(bicepL);

  const forearmL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 12), MAT_THOR_ARMOR_SILVER);
  forearmL.position.y = -0.42;
  leftArm.add(forearmL);

  // --- Right Arm (Weapon Arm) ---
  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 0.45, 0);
  torsoGroup.add(rightArm);

  const bicepR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.3, 12), MAT_THOR_SKIN);
  bicepR.position.y = -0.15;
  rightArm.add(bicepR);

  const forearmR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 12), MAT_THOR_ARMOR_SILVER);
  forearmR.position.y = -0.42;
  rightArm.add(forearmR);

  // Right Hand Socket (Where Mjölnir rests)
  const rightHandSocket = new THREE.Group();
  rightHandSocket.position.set(0, -0.58, 0);
  rightArm.add(rightHandSocket);

  // Hand fist
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), MAT_THOR_SKIN);
  rightHandSocket.add(handR);

  // Mjölnir attached inside hand
  const mjolnir = createMjolnirModel();
  mjolnir.position.set(0, -0.1, 0.05);
  mjolnir.rotation.x = Math.PI / 2;
  rightHandSocket.add(mjolnir);

  // --- Left Leg ---
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 1.0, 0);
  root.add(leftLeg);

  const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.48, 12), MAT_THOR_ARMOR_DARK);
  thighL.position.y = -0.24;
  thighL.castShadow = true;
  leftLeg.add(thighL);

  const shinL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.48, 12), MAT_THOR_ARMOR_SILVER);
  shinL.position.y = -0.66;
  shinL.castShadow = true;
  leftLeg.add(shinL);

  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.26), MAT_THOR_ARMOR_DARK);
  bootL.position.set(0, -0.94, 0.05);
  bootL.castShadow = true;
  leftLeg.add(bootL);

  // --- Right Leg ---
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 1.0, 0);
  root.add(rightLeg);

  const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.48, 12), MAT_THOR_ARMOR_DARK);
  thighR.position.y = -0.24;
  thighR.castShadow = true;
  rightLeg.add(thighR);

  const shinR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.48, 12), MAT_THOR_ARMOR_SILVER);
  shinR.position.y = -0.66;
  shinR.castShadow = true;
  rightLeg.add(shinR);

  const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.26), MAT_THOR_ARMOR_DARK);
  bootR.position.set(0, -0.94, 0.05);
  bootR.castShadow = true;
  rightLeg.add(bootR);

  // Soft Contact Shadow Disc beneath feet
  const shadowGeo = new THREE.CircleGeometry(0.55, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x05070a,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  // God Mode Lightning Aura Wireframe Capsule
  const auraGeo = new THREE.CapsuleGeometry(0.65, 1.6, 8, 16);
  const auraMesh = new THREE.Mesh(auraGeo, MAT_LIGHTNING_AURA);
  auraMesh.position.y = 1.1;
  auraMesh.visible = false;
  root.add(auraMesh);

  return {
    group: root,
    torsoGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cape,
    rightHandSocket,
    mjolnir,
    auraMesh,
    glowEyes: [eyeL, eyeR],
    animTime: 0,
  };
}

/**
 * Creates Jotunheim Frost Giant (Behemoth scale, icy armor, glowing cyan eyes, ice club)
 */
export function createFrostGiantModel(isWarlord: boolean = false): THREE.Group {
  const root = new THREE.Group();
  const scale = isWarlord ? 2.8 : 1.6;
  root.scale.set(scale, scale, scale);

  const matIce = new THREE.MeshStandardMaterial({
    color: isWarlord ? 0x29b6f6 : 0x81d4fa,
    roughness: 0.15,
    metalness: 0.4,
  });
  const matStoneSkin = new THREE.MeshStandardMaterial({
    color: isWarlord ? 0x1a237e : 0x37474f,
    roughness: 0.85,
    metalness: 0.2,
  });
  const matGlowEye = new THREE.MeshBasicMaterial({ color: 0x00ffff });

  // 1. Massive Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.8), matStoneSkin);
  torso.position.y = 1.6;
  torso.castShadow = true;
  root.add(torso);

  // 2. Ice Spikes on Shoulders
  const spikeGeo = new THREE.ConeGeometry(0.18, 0.7, 5);
  for (let i = -0.55; i <= 0.55; i += 0.35) {
    const spike = new THREE.Mesh(spikeGeo, matIce);
    spike.position.set(i, 2.3, 0);
    spike.rotation.z = i * 0.4;
    spike.castShadow = true;
    root.add(spike);
  }

  // 3. Menacing Head & Horns
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 0.6), matStoneSkin);
  head.position.set(0, 2.5, 0.1);
  head.castShadow = true;
  root.add(head);

  // Glowing Cyan Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matGlowEye);
  eyeL.position.set(-0.16, 2.6, 0.42);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matGlowEye);
  eyeR.position.set(0.16, 2.6, 0.42);
  root.add(eyeL);
  root.add(eyeR);

  // 4. Arms & Huge Ice Club
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 1.2, 8), matStoneSkin);
  armL.position.set(-0.75, 1.5, 0);
  armL.rotation.z = 0.2;
  root.add(armL);

  const armR = new THREE.Group();
  armR.position.set(0.75, 2.0, 0);
  const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.2, 8), matStoneSkin);
  armRMesh.position.y = -0.5;
  armR.add(armRMesh);

  // Heavy Spiky Ice Club
  const clubHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), matStoneSkin);
  clubHandle.position.set(0, -0.6, 0.3);
  clubHandle.rotation.x = Math.PI / 3;
  armR.add(clubHandle);

  const clubHead = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.2, 1.1, 6), matIce);
  clubHead.position.set(0, -0.1, 0.9);
  clubHead.rotation.x = Math.PI / 3;
  armR.add(clubHead);

  root.add(armR);

  // 5. Legs
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.1, 8), matStoneSkin);
  legL.position.set(-0.35, 0.55, 0);
  root.add(legL);

  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.1, 8), matStoneSkin);
  legR.position.set(0.35, 0.55, 0);
  root.add(legR);

  // Soft Contact Shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.0, 16),
    new THREE.MeshBasicMaterial({ color: 0x030810, transparent: true, opacity: 0.5, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  return root;
}

/**
 * Creates Dark Elf Infiltrator (Sleek obsidian armor, horned mask, dual daggers)
 */
export function createDarkElfModel(): THREE.Group {
  const root = new THREE.Group();
  const matArmor = new THREE.MeshStandardMaterial({ color: 0x1b1c24, roughness: 0.3, metalness: 0.8 });
  const matBlade = new THREE.MeshStandardMaterial({ color: 0x9c27b0, roughness: 0.2, metalness: 0.9 });
  const matEye = new THREE.MeshBasicMaterial({ color: 0xe040fb });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.9, 8), matArmor);
  body.position.y = 1.1;
  root.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.25), matArmor);
  head.position.y = 1.7;
  root.add(head);

  // Mask eyes
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.02), matEye);
  eyeL.position.set(-0.06, 1.72, 0.13);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.02), matEye);
  eyeR.position.set(0.06, 1.72, 0.13);
  root.add(eyeL);
  root.add(eyeR);

  // Dual Daggers
  const daggerGeo = new THREE.BoxGeometry(0.04, 0.55, 0.08);
  const daggerL = new THREE.Mesh(daggerGeo, matBlade);
  daggerL.position.set(-0.35, 0.9, 0.15);
  daggerL.rotation.x = 0.4;
  root.add(daggerL);

  const daggerR = new THREE.Mesh(daggerGeo, matBlade);
  daggerR.position.set(0.35, 0.9, 0.15);
  daggerR.rotation.x = 0.4;
  root.add(daggerR);

  // Legs
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.7, 8), matArmor);
  legL.position.set(-0.12, 0.45, 0);
  root.add(legL);

  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.7, 8), matArmor);
  legR.position.set(0.12, 0.45, 0);
  root.add(legR);

  return root;
}

/**
 * Creates All-Father Odin seated on his high golden throne in the Palace
 */
export function createOdinThroneScene(): THREE.Group {
  const root = new THREE.Group();

  const matGold = new THREE.MeshStandardMaterial({ color: 0xf4d03f, metalness: 0.9, roughness: 0.2 });
  const matRobes = new THREE.MeshStandardMaterial({ color: 0x154360, roughness: 0.8, metalness: 0.1 });
  const matBeard = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.85, metalness: 0.0 });
  const matMarble = new THREE.MeshStandardMaterial({ color: 0xfdfefe, roughness: 0.4, metalness: 0.1 });

  // 1. Grand Golden Stepped Dais
  const dais1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.4, 4.5), matMarble);
  dais1.position.y = 0.2;
  dais1.receiveShadow = true;
  root.add(dais1);

  const dais2 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.4, 3.5), matMarble);
  dais2.position.y = 0.6;
  dais2.receiveShadow = true;
  root.add(dais2);

  // 2. Ornate Golden High-Backed Throne (Hliðskjálf)
  const throneBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.2), matGold);
  throneBase.position.set(0, 1.2, 0);
  root.add(throneBase);

  const throneBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.25), matGold);
  throneBack.position.set(0, 2.4, -0.5);
  root.add(throneBack);

  // Throne Raven Wing Crests (Huginn & Muninn motifs)
  const crestGeo = new THREE.ConeGeometry(0.3, 1.2, 4);
  const crestL = new THREE.Mesh(crestGeo, matGold);
  crestL.position.set(-0.7, 3.8, -0.5);
  crestL.rotation.z = -0.3;
  const crestR = new THREE.Mesh(crestGeo, matGold);
  crestR.position.set(0.7, 3.8, -0.5);
  crestR.rotation.z = 0.3;
  root.add(crestL);
  root.add(crestR);

  // 3. All-Father Odin Seated
  const odinTorso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.5), matRobes);
  odinTorso.position.set(0, 2.0, 0);
  root.add(odinTorso);

  const odinHead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), MAT_THOR_SKIN);
  odinHead.position.set(0, 2.65, 0);
  root.add(odinHead);

  // Golden Winged Helm
  const odinCrown = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 8), matGold);
  odinCrown.position.set(0, 3.0, 0);
  root.add(odinCrown);

  // Long Flowing White Beard
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 8), matBeard);
  beard.position.set(0, 2.2, 0.2);
  beard.rotation.x = -0.2;
  root.add(beard);

  // Golden Spear Gungnir held in hand
  const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.5, 12), matGold);
  spearShaft.position.set(0.65, 2.4, 0.3);
  spearShaft.rotation.z = -0.15;
  root.add(spearShaft);

  const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), matGold);
  spearTip.position.set(0.9, 4.1, 0.3);
  root.add(spearTip);

  return root;
}

/**
 * Creates Heimdall guarding the Bifröst with Hofund greatsword
 */
export function createHeimdallModel(): THREE.Group {
  const root = new THREE.Group();
  const matGold = new THREE.MeshStandardMaterial({ color: 0xf4d03f, metalness: 0.9, roughness: 0.2 });
  const matSword = new THREE.MeshStandardMaterial({ color: 0xd6dbdf, metalness: 0.95, roughness: 0.1 });

  // Body in golden breastplate
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.4), matGold);
  torso.position.y = 1.35;
  root.add(torso);

  // Horned Helm of Heimdall
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), MAT_THOR_SKIN);
  head.position.y = 1.95;
  root.add(head);

  const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.25, 12), matGold);
  helm.position.y = 2.15;
  root.add(helm);

  // Curved Golden Horns on Helm
  const hornGeo = new THREE.TorusGeometry(0.22, 0.04, 8, 16, Math.PI / 1.6);
  const hornL = new THREE.Mesh(hornGeo, matGold);
  hornL.position.set(-0.18, 2.25, 0);
  hornL.rotation.z = Math.PI / 2;
  const hornR = new THREE.Mesh(hornGeo, matGold);
  hornR.position.set(0.18, 2.25, 0);
  hornR.rotation.z = -Math.PI / 2;
  root.add(hornL);
  root.add(hornR);

  // Hofund Broadsword held vertically
  const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.04), matSword);
  swordBlade.position.set(0, 0.9, 0.35);
  root.add(swordBlade);

  const swordCross = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.08), matGold);
  swordCross.position.set(0, 1.72, 0.35);
  root.add(swordCross);

  // Legs
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8), matGold);
  legL.position.set(-0.18, 0.5, 0);
  root.add(legL);

  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8), matGold);
  legR.position.set(0.18, 0.5, 0);
  root.add(legR);

  return root;
}
