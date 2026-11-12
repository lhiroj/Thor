/**
 * THOR: GOD OF THUNDER - World Builder
 * Procedural open-world realms: Asgard (Golden Kingdom, Palace, Bifröst) and Jotunheim (Icy Wastelands).
 */
import * as THREE from 'three';
import { createOdinThroneScene, createHeimdallModel } from './proceduralModels.ts';

// Procedural Terrain Texture: Paved Golden Stone & Royal Marble
function createAsgardStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c1b18';
  ctx.fillRect(0, 0, 512, 512);

  // Marble pavers with golden veins
  const tileSize = 64;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      grad.addColorStop(0, '#2e2c26');
      grad.addColorStop(0.5, '#454238');
      grad.addColorStop(1, '#25231e');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Gold inlay lines
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 24);
  return tex;
}

// Procedural Glacial Ice Texture for Jotunheim
function createGlacialIceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, 512, 512);

  // Crystal ice cracks
  ctx.strokeStyle = '#64dfdf';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 40; i++) {
    let px = Math.random() * 512;
    let py = Math.random() * 512;
    ctx.moveTo(px, py);
    for (let j = 0; j < 5; j++) {
      px += (Math.random() - 0.5) * 80;
      py += (Math.random() - 0.5) * 80;
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

export interface RealmScene {
  realmId: 'asgard' | 'jotunheim';
  group: THREE.Group;
  interactables: THREE.Object3D[];
  groundMeshes: THREE.Mesh[];
  skyMesh: THREE.Mesh;
  npcs: { name: string; position: THREE.Vector3; mesh: THREE.Group }[];
  portalPosition: THREE.Vector3;
}

/**
 * Builds the Golden Kingdom of Asgard
 */
export function buildAsgardRealm(): RealmScene {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const groundMeshes: THREE.Mesh[] = [];
  const npcs: { name: string; position: THREE.Vector3; mesh: THREE.Group }[] = [];

  const asgardTexture = createAsgardStoneTexture();

  // Materials
  const matGround = new THREE.MeshStandardMaterial({
    map: asgardTexture,
    roughness: 0.45,
    metalness: 0.35,
  });

  const matGold = new THREE.MeshStandardMaterial({
    color: 0xf4d03f,
    metalness: 0.92,
    roughness: 0.18,
  });

  const matDarkBronze = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    metalness: 0.7,
    roughness: 0.4,
  });

  const matPalaceWall = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.3,
    metalness: 0.2,
  });

  // 1. Central Courtyard / Ground Plaza
  const plazaGeo = new THREE.CylinderGeometry(150, 160, 4, 32);
  const plaza = new THREE.Mesh(plazaGeo, matGround);
  plaza.position.y = -2;
  plaza.receiveShadow = true;
  root.add(plaza);
  groundMeshes.push(plaza);

  // 2. Odin's Royal Palace (Northern sector, z = -100 to -160)
  const palaceGroup = new THREE.Group();
  palaceGroup.position.set(0, 0, -110);
  root.add(palaceGroup);

  // Palace Base Podium
  const palaceBase = new THREE.Mesh(new THREE.BoxGeometry(70, 12, 70), matPalaceWall);
  palaceBase.position.y = 6;
  palaceBase.receiveShadow = true;
  palaceGroup.add(palaceBase);
  groundMeshes.push(palaceBase);

  // Golden Grand Entrance Stairs
  const stairs = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 20), matGold);
  stairs.position.set(0, 3, 40);
  palaceGroup.add(stairs);
  groundMeshes.push(stairs);

  // Palace Golden Columns (Colonnade)
  const columnGeo = new THREE.CylinderGeometry(1.2, 1.4, 20, 16);
  for (let x = -28; x <= 28; x += 14) {
    const colFront = new THREE.Mesh(columnGeo, matGold);
    colFront.position.set(x, 22, 32);
    colFront.castShadow = true;
    palaceGroup.add(colFront);

    const colBack = new THREE.Mesh(columnGeo, matGold);
    colBack.position.set(x, 22, -32);
    colBack.castShadow = true;
    palaceGroup.add(colBack);
  }

  // Palace Throne Hall Roof & Upper Structure
  const palaceHall = new THREE.Mesh(new THREE.BoxGeometry(60, 18, 55), matPalaceWall);
  palaceHall.position.y = 21;
  palaceGroup.add(palaceHall);

  // Massive Golden Center Dome
  const domeGeo = new THREE.SphereGeometry(18, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const dome = new THREE.Mesh(domeGeo, matGold);
  dome.position.y = 30;
  palaceGroup.add(dome);

  // High Golden Spire
  const spireGeo = new THREE.ConeGeometry(3.5, 32, 12);
  const spire = new THREE.Mesh(spireGeo, matGold);
  spire.position.y = 48;
  palaceGroup.add(spire);

  // Flanking Minaret Spires
  const miniSpireGeo = new THREE.ConeGeometry(2, 18, 8);
  [-30, 30].forEach((x) => {
    [-30, 30].forEach((z) => {
      const ms = new THREE.Mesh(miniSpireGeo, matGold);
      ms.position.set(x, 30, z);
      palaceGroup.add(ms);
    });
  });

  // Odin's Throne inside the Palace hall
  const odinThrone = createOdinThroneScene();
  odinThrone.position.set(0, 12, -100);
  root.add(odinThrone);
  interactables.push(odinThrone);
  npcs.push({
    name: 'Odin',
    position: new THREE.Vector3(0, 14, -96),
    mesh: odinThrone,
  });

  // 3. Asgardian City Buildings & Market Pavilions
  const buildingConfigs = [
    { x: -50, z: -20, w: 16, h: 22, d: 18 },
    { x: -75, z: 20, w: 20, h: 28, d: 22 },
    { x: -60, z: 70, w: 18, h: 18, d: 18 },
    { x: 50, z: -20, w: 16, h: 24, d: 18 },
    { x: 75, z: 20, w: 22, h: 30, d: 24 },
    { x: 60, z: 70, w: 18, h: 18, d: 18 },
    { x: -35, z: 45, w: 12, h: 14, d: 14 },
    { x: 35, z: 45, w: 12, h: 14, d: 14 },
  ];

  buildingConfigs.forEach((b) => {
    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), matPalaceWall);
    bMesh.position.set(b.x, b.h / 2, b.z);
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    root.add(bMesh);

    // Golden Roof pyramid
    const roof = new THREE.Mesh(new THREE.ConeGeometry(b.w * 0.72, 8, 4), matGold);
    roof.position.set(b.x, b.h + 4, b.z);
    roof.rotation.y = Math.PI / 4;
    root.add(roof);

    groundMeshes.push(bMesh);
  });

  // Street Lamps with Glowing Blue Runes
  const lampGeo = new THREE.CylinderGeometry(0.2, 0.3, 5, 8);
  const lanternGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const matLantern = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

  const lampPoints = [
    [-15, 0, 0], [15, 0, 0],
    [-20, 0, 40], [20, 0, 40],
    [-15, 0, -40], [15, 0, -40],
    [-30, 0, -70], [30, 0, -70],
  ];
  lampPoints.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(lampGeo, matDarkBronze);
    post.position.set(x, 2.5, z);
    root.add(post);

    const bulb = new THREE.Mesh(lanternGeo, matLantern);
    bulb.position.set(x, 5.2, z);
    root.add(bulb);
  });

  // 4. The Legendary Rainbow Bridge (Bifröst)
  // Stretching from Asgard city plaza (z = 80) southward across the cosmic starry gulf to the Observatory (z = 240)
  const bifrostGroup = new THREE.Group();
  bifrostGroup.position.set(0, 4, 160);
  root.add(bifrostGroup);

  const bridgeLength = 160;
  const bridgeWidth = 14;

  // 6 Prismatic Rainbow Bands
  const rainbowColors = [0xff1744, 0xff9100, 0xffea00, 0x00e676, 0x00e5ff, 0xd500f9];
  const bandWidth = bridgeWidth / rainbowColors.length;

  rainbowColors.forEach((colorHex, idx) => {
    const matBand = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    const bandMesh = new THREE.Mesh(
      new THREE.BoxGeometry(bandWidth, 1.2, bridgeLength),
      matBand
    );
    const xPos = -bridgeWidth / 2 + bandWidth * idx + bandWidth / 2;
    bandMesh.position.set(xPos, 0, 0);
    bandMesh.receiveShadow = true;
    bifrostGroup.add(bandMesh);
    groundMeshes.push(bandMesh);
  });

  // Golden Archways along the Bifröst
  const archGeo = new THREE.TorusGeometry(8, 0.6, 8, 24, Math.PI);
  for (let z = -60; z <= 60; z += 30) {
    const arch = new THREE.Mesh(archGeo, matGold);
    arch.position.set(0, 0, z);
    bifrostGroup.add(arch);
  }

  // 5. Himinbjörg Observatory (Heimdall's Gate Dome at z = 240)
  const observGroup = new THREE.Group();
  observGroup.position.set(0, 4, 240);
  root.add(observGroup);

  const observDome = new THREE.Mesh(
    new THREE.SphereGeometry(16, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    matGold
  );
  observDome.position.y = 0;
  observGroup.add(observDome);

  // Celestial Rotating Energy Ring around Observatory
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true });
  const observRing = new THREE.Mesh(new THREE.TorusGeometry(20, 0.4, 8, 32), ringMat);
  observRing.rotation.x = Math.PI / 3;
  observGroup.add(observRing);

  // Bifröst Gateway Portal (Swirling Celestial Wormhole to Jotunheim)
  const portalGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.4, 24);
  const portalMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    emissive: 0x2979ff,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.9,
  });
  const portalMesh = new THREE.Mesh(portalGeo, portalMat);
  portalMesh.rotation.x = Math.PI / 2;
  portalMesh.position.set(0, 6, 245);
  root.add(portalMesh);
  interactables.push(portalMesh);

  // Heimdall NPC standing guard on the Bifröst platform
  const heimdall = createHeimdallModel();
  heimdall.position.set(0, 4.6, 225);
  root.add(heimdall);
  interactables.push(heimdall);
  npcs.push({
    name: 'Heimdall',
    position: new THREE.Vector3(0, 4.6, 225),
    mesh: heimdall,
  });

  // Royal Crimson Asgardian Banners at Palace Entrance
  const matBanner = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const bannerGeo = new THREE.PlaneGeometry(3, 10);
  [-14, 14].forEach((x) => {
    const banner = new THREE.Mesh(bannerGeo, matBanner);
    banner.position.set(x, 18, 33);
    palaceGroup.add(banner);
  });

  // Distant Floating Celestial Sky Islands
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x2e2c26, roughness: 0.9, metalness: 0.1 });
  const islandConfigs = [
    { x: -120, y: 70, z: -140, r: 25 },
    { x: 130, y: 80, z: -120, r: 28 },
    { x: -140, y: 60, z: 80, r: 20 },
    { x: 140, y: 65, z: 100, r: 22 },
  ];
  islandConfigs.forEach((isl) => {
    const islMesh = new THREE.Mesh(new THREE.ConeGeometry(isl.r, isl.r * 1.2, 7), islandMat);
    islMesh.rotation.x = Math.PI; // Inverted mountain cone
    islMesh.position.set(isl.x, isl.y, isl.z);
    root.add(islMesh);

    // Temple on top of floating island
    const topTemple = new THREE.Mesh(new THREE.CylinderGeometry(isl.r * 0.4, isl.r * 0.5, 6, 8), matPalaceWall);
    topTemple.position.set(isl.x, isl.y + 3, isl.z);
    root.add(topTemple);

    const topDome = new THREE.Mesh(new THREE.SphereGeometry(isl.r * 0.35, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), matGold);
    topDome.position.set(isl.x, isl.y + 6, isl.z);
    root.add(topDome);
  });

  // Cosmic Starfield in the Upper Sky
  const starCount = 500;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 350 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * (Math.PI * 0.45); // Upper dome only
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) + 20;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2.2,
    transparent: true,
    opacity: 0.9,
  });
  const stars = new THREE.Points(starGeo, starMat);
  root.add(stars);

  // Skybox Dome
  const skyGeo = new THREE.SphereGeometry(450, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x070c1e,
    side: THREE.BackSide,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  root.add(skyMesh);

  return {
    realmId: 'asgard',
    group: root,
    interactables,
    groundMeshes,
    skyMesh,
    npcs,
    portalPosition: new THREE.Vector3(0, 6, 245),
  };
}

/**
 * Builds the Frozen Realm of Jotunheim (Icy mountains, glaciers, frozen monoliths)
 */
export function buildJotunheimRealm(): RealmScene {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const groundMeshes: THREE.Mesh[] = [];
  const npcs: { name: string; position: THREE.Vector3; mesh: THREE.Group }[] = [];

  const iceTexture = createGlacialIceTexture();

  const matIceGround = new THREE.MeshStandardMaterial({
    map: iceTexture,
    roughness: 0.2,
    metalness: 0.4,
  });

  const matGlacierIce = new THREE.MeshStandardMaterial({
    color: 0x4fc3f7,
    roughness: 0.15,
    metalness: 0.5,
  });

  const matFrostRock = new THREE.MeshStandardMaterial({
    color: 0x263238,
    roughness: 0.9,
    metalness: 0.1,
  });

  // 1. Frozen Glacial Valley Ground
  const valleyGeo = new THREE.CylinderGeometry(140, 150, 4, 32);
  const ground = new THREE.Mesh(valleyGeo, matIceGround);
  ground.position.y = -2;
  ground.receiveShadow = true;
  root.add(ground);
  groundMeshes.push(ground);

  // 2. Giant Frozen Spikes & Glaciers
  const spikeGeo = new THREE.ConeGeometry(6, 32, 6);
  const spikeCoords = [
    [-60, -40], [-80, 10], [-55, 60],
    [60, -40], [80, 10], [55, 60],
    [-25, -90], [25, -90], [0, -140],
  ];

  spikeCoords.forEach(([x, z]) => {
    const spike = new THREE.Mesh(spikeGeo, matGlacierIce);
    spike.position.set(x, 14, z);
    spike.rotation.z = (Math.random() - 0.5) * 0.3;
    spike.castShadow = true;
    root.add(spike);
    groundMeshes.push(spike);
  });

  // 3. Ancient Frost Giant Monolith Pillars
  const pillarGeo = new THREE.BoxGeometry(4, 24, 4);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = Math.cos(angle) * 45;
    const pz = Math.sin(angle) * 45;
    const pillar = new THREE.Mesh(pillarGeo, matFrostRock);
    pillar.position.set(px, 12, pz);
    pillar.castShadow = true;
    root.add(pillar);
  }

  // 4. Return Portal back to Asgard (at z = 40)
  const returnPortal = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.5, 0.4, 24),
    new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.8,
    })
  );
  returnPortal.rotation.x = Math.PI / 2;
  returnPortal.position.set(0, 5, 45);
  root.add(returnPortal);
  interactables.push(returnPortal);

  // Skybox Dome (Blizzard twilight)
  const skyGeo = new THREE.SphereGeometry(450, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x050d1a,
    side: THREE.BackSide,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  root.add(skyMesh);

  return {
    realmId: 'jotunheim',
    group: root,
    interactables,
    groundMeshes,
    skyMesh,
    npcs,
    portalPosition: new THREE.Vector3(0, 5, 45),
  };
}
