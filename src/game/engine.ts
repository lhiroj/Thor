/**
 * THOR: GOD OF THUNDER - Core 3D Game Engine
 * Integrated with Three.js r160+, Software-WebGL guard, and procedural subsystems.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createThorCharacter,
  createFrostGiantModel,
  createDarkElfModel,
  ThorCharacterModel,
} from './proceduralModels.ts';
import { buildAsgardRealm, buildJotunheimRealm, RealmScene } from './worldBuilder.ts';
import { ParticleManager } from './particles.ts';
import { sound } from './audio.ts';
import {
  PlayerStats,
  Quest,
  EnemyEntity,
  GameSettings,
} from './types.ts';
import {
  INITIAL_PLAYER_STATS,
  INITIAL_QUESTS,
  DEFAULT_SETTINGS,
  calculateDamage,
  updateQuestProgress,
  addXpAndCheckLevelUp,
  saveGameState,
  loadGameState,
} from './rules.ts';

// Module-scope scratch vectors for Zero-GC render loop
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

export class GameEngine {
  public container: HTMLElement;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public isSoftwareGl: boolean = false;

  // World & Realms
  public currentRealmId: 'asgard' | 'jotunheim' = 'asgard';
  private asgardScene!: RealmScene;
  private jotunheimScene!: RealmScene;
  public currentRealmScene!: RealmScene;

  // Characters & FX
  public thor!: ThorCharacterModel;
  public particles!: ParticleManager;

  // Game State
  public stats: PlayerStats = { ...INITIAL_PLAYER_STATS };
  public quests: Quest[] = JSON.parse(JSON.stringify(INITIAL_QUESTS));
  public activeQuestId: string = 'quest_1';
  public settings: GameSettings = { ...DEFAULT_SETTINGS };
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;

  // Mjölnir Mechanics State
  public mjolnirState: 'hand' | 'flying' | 'recalling' = 'hand';
  public mjolnirWorldMesh!: THREE.Group;
  public mjolnirVelocity: THREE.Vector3 = new THREE.Vector3();
  public mjolnirTarget: THREE.Vector3 = new THREE.Vector3();

  // Thor Movement & Flight Physics
  public playerVelocity: THREE.Vector3 = new THREE.Vector3();
  public playerYaw: number = 0;
  public playerPitch: number = 0;
  public isGrounded: boolean = true;
  public isSprinting: boolean = false;
  private jumpCooldown: number = 0;
  private attackComboStage: number = 0;
  private attackTimer: number = 0;

  // Camera Orbit & Shake
  public cameraDistance: number = 6.5;
  public cameraPitch: number = 0.25;
  public cameraYaw: number = 0;
  public isFirstPerson: boolean = false;
  public trauma: number = 0; // camera shake [0..1]

  // Enemies List
  public enemies: EnemyEntity[] = [];

  // Input states
  public keys: Set<string> = new Set();
  public mouseLookDelta: { x: number; y: number } = { x: 0, y: 0 };
  public virtualJoystick: { x: number; y: number } = { x: 0, y: 0 };
  public virtualFlyUp: boolean = false;
  public virtualFlyDown: boolean = false;

  // Loop & Frame State
  private clock: THREE.Clock = new THREE.Clock();
  private frameId: number = 0;
  private isDestroyed: boolean = false;

  // Callbacks for React HUD sync
  public onDialogueOpen?: (npcName: string) => void;
  public onQuestCompleted?: (quest: Quest) => void;
  public onRealmChange?: (realm: 'asgard' | 'jotunheim') => void;
  public onStatsChanged?: (stats: PlayerStats) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initWebGL();
    this.initLightingAndEnvironment();
    this.initWorld();
    this.initThor();
    this.initMjolnirWorldMesh();
    this.initEnemies();
    this.initEventListeners();
    this.startLoop();
  }

  /**
   * Software-WebGL detection & WebGLRenderer initialization
   */
  private initWebGL() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a1128, 0.0035);

    this.camera = new THREE.PerspectiveCamera(
      this.settings.fov,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      600
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
    this.particles = new ParticleManager(this.scene);
  }

  /**
   * Studio PBR Environment & 3-Point Lighting Rig
   */
  private initLightingAndEnvironment() {
    // 1. Procedural RoomEnvironment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 2. Warm Key Light (Golden sun of Asgard)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(60, 100, 40);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 300;
      const d = 80;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    this.scene.add(keyLight);

    // 3. Cool Hemisphere Light Fill (Sky blue to earth ground)
    const hemiLight = new THREE.HemisphereLight(0x81d4fa, 0x2e1c0c, 1.2);
    this.scene.add(hemiLight);

    // 4. Subtle Ambient
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(amb);
  }

  /**
   * Builds both Asgard and Jotunheim realms
   */
  private initWorld() {
    this.asgardScene = buildAsgardRealm();
    this.jotunheimScene = buildJotunheimRealm();
    this.jotunheimScene.group.visible = false;

    this.scene.add(this.asgardScene.group);
    this.scene.add(this.jotunheimScene.group);
    this.currentRealmScene = this.asgardScene;
  }

  /**
   * Initializes Thor hero model
   */
  private initThor() {
    this.thor = createThorCharacter();
    // Spawn Thor facing North toward Odin's Palace (-Z)
    this.thor.group.position.set(0, 0, 15);
    this.thor.group.rotation.y = Math.PI;
    this.cameraYaw = 0;
    this.cameraPitch = 0.2;
    this.scene.add(this.thor.group);
  }

  /**
   * Initializes independent world Mjölnir mesh for Throw / Recall physics
   */
  private initMjolnirWorldMesh() {
    this.mjolnirWorldMesh = new THREE.Group();
    // Copy Mjölnir's visual children to independent mesh
    const visual = this.thor.mjolnir.clone();
    this.mjolnirWorldMesh.add(visual);
    this.mjolnirWorldMesh.visible = false;
    this.scene.add(this.mjolnirWorldMesh);
  }

  /**
   * Spawns initial Frost Giant & Dark Elf enemy forces
   */
  private initEnemies() {
    this.enemies = [];

    // Asgard Frost Scouts (Stage 2 Quest)
    const asgardSpawns = [
      { x: 35, z: 25, type: 'frost_giant' as const },
      { x: 45, z: 15, type: 'frost_giant' as const },
      { x: 40, z: 30, type: 'frost_giant' as const },
      // Training infiltrators (Stage 3 Quest)
      { x: -55, z: 55, type: 'dark_elf' as const },
      { x: -65, z: 65, type: 'dark_elf' as const },
      { x: -60, z: 70, type: 'dark_elf' as const },
      { x: -70, z: 50, type: 'dark_elf' as const },
    ];

    asgardSpawns.forEach((s, idx) => {
      const mesh = s.type === 'frost_giant' ? createFrostGiantModel(false) : createDarkElfModel();
      mesh.position.set(s.x, 0, s.z);
      this.asgardScene.group.add(mesh);

      this.enemies.push({
        id: `asgard_enemy_${idx}`,
        type: s.type,
        name: s.type === 'frost_giant' ? 'Frost Scout' : 'Dark Elf Scout',
        hp: s.type === 'frost_giant' ? 140 : 80,
        maxHp: s.type === 'frost_giant' ? 140 : 80,
        damage: s.type === 'frost_giant' ? 22 : 14,
        speed: s.type === 'frost_giant' ? 4.5 : 8.0,
        position: { x: s.x, y: 0, z: s.z },
        rotation: 0,
        state: 'idle',
        windupTimer: 0,
        attackCooldown: 1.5,
        scale: s.type === 'frost_giant' ? 1.6 : 1.0,
        mesh,
      });
    });

    // Jotunheim Glacial Army & Boss Warlord
    const jotunSpawns = [
      { x: 15, z: -35, type: 'frost_giant' as const },
      { x: 25, z: -45, type: 'frost_giant' as const },
      { x: 20, z: -55, type: 'frost_giant' as const },
      { x: -20, z: -40, type: 'frost_giant' as const },
      { x: -15, z: -50, type: 'frost_giant' as const },
      // Colossal Boss Warlord (Stage 7 Quest)
      { x: 0, z: -120, type: 'frost_warlord' as const },
    ];

    jotunSpawns.forEach((s, idx) => {
      const isBoss = s.type === 'frost_warlord';
      const mesh = createFrostGiantModel(isBoss);
      mesh.position.set(s.x, 0, s.z);
      this.jotunheimScene.group.add(mesh);

      this.enemies.push({
        id: `jotun_enemy_${idx}`,
        type: s.type,
        name: isBoss ? 'Frost Giant Warlord' : 'Jotun Warrior',
        hp: isBoss ? 900 : 180,
        maxHp: isBoss ? 900 : 180,
        damage: isBoss ? 45 : 25,
        speed: isBoss ? 5.5 : 5.0,
        position: { x: s.x, y: 0, z: s.z },
        rotation: 0,
        state: 'idle',
        windupTimer: 0,
        attackCooldown: isBoss ? 2.0 : 1.6,
        scale: isBoss ? 2.8 : 1.6,
        mesh,
      });
    });
  }

  /**
   * Sets up desktop mouse/keyboard and resize listeners
   */
  private initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'KeyF') this.castLightningStrike();
      if (e.code === 'KeyR') this.castThunderWave();
      if (e.code === 'KeyT') this.castThunderstorm();
      if (e.code === 'KeyQ') this.throwMjolnir();
      if (e.code === 'KeyE') this.recallMjolnir();
      if (e.code === 'KeyG') this.activateGodMode();
      if (e.code === 'KeyC') this.toggleFirstPerson();
      if (e.code === 'Space' && !e.repeat) this.handleJumpOrFlight();
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseLookDelta = { x: 0, y: 0 };
    });

    // Pointer Lock & Mouse Look
    this.container.addEventListener('click', () => {
      if (!document.pointerLockElement) {
        this.container.requestPointerLock?.();
      }
      sound.resume();
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.container) {
        const sens = 0.0022 * this.settings.cameraSensitivity;
        this.cameraYaw -= e.movementX * sens;
        this.cameraPitch = Math.max(-0.6, Math.min(1.2, this.cameraPitch + e.movementY * sens));
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.performMeleeAttack(false); // Left click: normal swing
      if (e.button === 2) this.performMeleeAttack(true);  // Right click: heavy swing
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  /**
   * Switches realms between Asgard and Jotunheim
   */
  public switchRealm(realmId: 'asgard' | 'jotunheim') {
    if (this.currentRealmId === realmId) return;
    this.currentRealmId = realmId;

    if (realmId === 'asgard') {
      this.asgardScene.group.visible = true;
      this.jotunheimScene.group.visible = false;
      this.currentRealmScene = this.asgardScene;
      this.scene.fog = new THREE.FogExp2(0x0a1128, 0.0035);
      this.thor.group.position.set(0, 6, 220); // Bifröst gate entrance
    } else {
      this.asgardScene.group.visible = false;
      this.jotunheimScene.group.visible = true;
      this.currentRealmScene = this.jotunheimScene;
      this.scene.fog = new THREE.FogExp2(0x081528, 0.007);
      this.thor.group.position.set(0, 2, 25); // Jotunheim valley entrance
    }

    sound.playLightningStrike();
    this.trauma = Math.min(1.0, this.trauma + 0.6);
    this.onRealmChange?.(realmId);
  }

  /**
   * Space Bar action: Jumps if on ground; double-tap or aerial space toggles Flight!
   */
  public handleJumpOrFlight() {
    if (this.isGrounded && !this.stats.isFlying) {
      this.playerVelocity.y = 12.0;
      this.isGrounded = false;
      sound.playJump();
    } else {
      // Toggle 3D Free Flight
      this.stats.isFlying = !this.stats.isFlying;
      if (this.stats.isFlying) {
        this.playerVelocity.y = 8.0;
        sound.playLightningStrike();
        this.particles.spawnSparkBurst(this.thor.group.position, 25, 7);
      }
      this.onStatsChanged?.(this.stats);
    }
  }

  public toggleFlight(force?: boolean) {
    this.stats.isFlying = force !== undefined ? force : !this.stats.isFlying;
    if (this.stats.isFlying) {
      this.playerVelocity.y = 6.0;
      sound.playLightningStrike();
    }
    this.onStatsChanged?.(this.stats);
  }

  public toggleFirstPerson() {
    this.isFirstPerson = !this.isFirstPerson;
  }

  /**
   * Melee Attack: Swings Mjölnir with combo arc
   */
  public performMeleeAttack(isHeavy: boolean = false) {
    if (this.mjolnirState !== 'hand') return;
    this.attackTimer = 0.35;
    this.attackComboStage = (this.attackComboStage + 1) % 3;

    sound.playMjolnirSwing();

    // Damage calculation & Hit Detection
    const thorPos = this.thor.group.position;
    const hitRange = isHeavy ? 4.5 : 3.2;

    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      _v1.set(enemy.position.x, enemy.position.y, enemy.position.z);
      if (thorPos.distanceTo(_v1) <= hitRange) {
        const { damage, isCrit } = calculateDamage(
          this.stats.damage,
          isHeavy,
          this.stats.godModeTimer > 0
        );
        this.damageEnemy(enemy, damage, isCrit);
        sound.playHammerHit();
        this.trauma = Math.min(1.0, this.trauma + (isHeavy ? 0.45 : 0.25));
        this.particles.spawnSparkBurst(_v1, 20, 8);
      }
    });
  }

  /**
   * Ability: Mjölnir Throw (Q)
   */
  public throwMjolnir() {
    if (this.mjolnirState !== 'hand') return;
    this.mjolnirState = 'flying';
    this.thor.mjolnir.visible = false;
    this.mjolnirWorldMesh.visible = true;

    // Launch from Thor's right hand position forward
    _v1.set(0.4, 1.2, 0).applyEuler(this.thor.group.rotation).add(this.thor.group.position);
    this.mjolnirWorldMesh.position.copy(_v1);

    // Aim direction based on camera forward
    this.camera.getWorldDirection(_v2);
    this.mjolnirVelocity.copy(_v2).multiplyScalar(38.0);
    this.mjolnirTarget.copy(this.mjolnirWorldMesh.position).addScaledVector(_v2, 45.0);

    sound.playMjolnirThrow();
  }

  /**
   * Ability: Mjölnir Recall (E)
   */
  public recallMjolnir() {
    if (this.mjolnirState !== 'flying') return;
    this.mjolnirState = 'recalling';
    sound.playMjolnirCatch();
  }

  /**
   * Ability: Lightning Strike (F)
   */
  public castLightningStrike() {
    if (this.stats.energy < 25) return;
    this.stats.energy -= 25;
    this.onStatsChanged?.(this.stats);

    // Raycast or pick point 15m in front of Thor
    this.camera.getWorldDirection(_v1);
    _v2.copy(this.thor.group.position).addScaledVector(_v1, 16.0);
    _v2.y = 0; // Ground strike point

    const skyOrigin = _v2.clone().setY(90);
    this.particles.spawnLightningStrike(skyOrigin, _v2, 0.35);
    this.particles.spawnSparkBurst(_v2, 35, 10);
    sound.playLightningStrike();
    this.trauma = Math.min(1.0, this.trauma + 0.6);

    // Damage enemies in 10m blast radius
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      _v3.set(enemy.position.x, enemy.position.y, enemy.position.z);
      if (_v2.distanceTo(_v3) <= 10.0) {
        this.damageEnemy(enemy, 110, true);
      }
    });

    this.checkQuestProgressOnAbility('lightning_strike');
  }

  /**
   * Ability: Thunder Wave (R)
   */
  public castThunderWave() {
    if (this.stats.energy < 35) return;
    this.stats.energy -= 35;
    this.onStatsChanged?.(this.stats);

    sound.playThunderWave();
    const thorPos = this.thor.group.position;
    this.particles.spawnSparkBurst(thorPos, 45, 12);
    this.trauma = Math.min(1.0, this.trauma + 0.5);

    // Radial blast 14m
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      _v1.set(enemy.position.x, enemy.position.y, enemy.position.z);
      const dist = thorPos.distanceTo(_v1);
      if (dist <= 14.0) {
        this.damageEnemy(enemy, 75, false);
        // Knockback
        _v2.subVectors(_v1, thorPos).normalize().multiplyScalar(15.0);
        enemy.position.x += _v2.x * 0.4;
        enemy.position.z += _v2.z * 0.4;
      }
    });
  }

  /**
   * Ability: Thunderstorm (T)
   */
  public castThunderstorm() {
    if (this.stats.energy < 60) return;
    this.stats.energy -= 60;
    this.onStatsChanged?.(this.stats);

    sound.playLightningStrike();
    this.trauma = 0.85;

    // Rain 6 lightning bolts around Thor
    const thorPos = this.thor.group.position;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 6 + Math.random() * 12;
      const hitPos = new THREE.Vector3(
        thorPos.x + Math.cos(angle) * radius,
        0,
        thorPos.z + Math.sin(angle) * radius
      );
      const skyPos = hitPos.clone().setY(90);
      this.particles.spawnLightningStrike(skyPos, hitPos, 0.4);
      this.particles.spawnSparkBurst(hitPos, 25, 8);
    }

    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      _v1.set(enemy.position.x, enemy.position.y, enemy.position.z);
      if (thorPos.distanceTo(_v1) <= 22.0) {
        this.damageEnemy(enemy, 160, true);
      }
    });
  }

  /**
   * Ability: God Mode (G)
   */
  public activateGodMode() {
    if (this.stats.energy < 50 || this.stats.godModeTimer > 0) return;
    this.stats.energy -= 50;
    this.stats.godModeTimer = 15.0;
    this.thor.auraMesh.visible = true;
    sound.playGodMode();
    this.particles.spawnSparkBurst(this.thor.group.position, 60, 14);
    this.onStatsChanged?.(this.stats);
  }

  /**
   * Damages an enemy, spawns damage popup, and checks death
   */
  public damageEnemy(enemy: EnemyEntity, damage: number, isCrit: boolean = false) {
    enemy.hp = Math.max(0, enemy.hp - damage);
    _v1.set(enemy.position.x, enemy.position.y, enemy.position.z);
    this.particles.spawnFloatingDamage(_v1, damage, isCrit);

    if (enemy.hp <= 0) {
      enemy.state = 'dead';
      if (enemy.mesh) enemy.mesh.visible = false;
      this.stats.score += enemy.type === 'frost_warlord' ? 1000 : 150;
      this.stats.gold += enemy.type === 'frost_warlord' ? 500 : 40;

      // Check quest advancement on kill
      this.checkQuestProgressOnEnemyKill(enemy.type);

      // Add XP & check level up
      const xpReward = enemy.type === 'frost_warlord' ? 800 : 70;
      const { stats, leveledUp } = addXpAndCheckLevelUp(this.stats, xpReward);
      this.stats = stats;
      if (leveledUp) sound.playFanfare();
      this.onStatsChanged?.(this.stats);
    }
  }

  private checkQuestProgressOnEnemyKill(type: string) {
    const currentQ = this.quests.find((q) => q.id === this.activeQuestId);
    if (!currentQ || currentQ.isCompleted) return;

    if (currentQ.id === 'quest_2' && type === 'frost_giant') {
      this.advanceActiveQuest();
    } else if (currentQ.id === 'quest_3' && type === 'dark_elf') {
      this.advanceActiveQuest();
    } else if (currentQ.id === 'quest_6' && type === 'frost_giant' && this.currentRealmId === 'jotunheim') {
      this.advanceActiveQuest();
    } else if (currentQ.id === 'quest_7' && type === 'frost_warlord') {
      this.advanceActiveQuest();
    }
  }

  private checkQuestProgressOnAbility(ability: string) {
    if (this.activeQuestId === 'quest_3' && ability === 'lightning_strike') {
      this.advanceActiveQuest();
    }
  }

  public advanceActiveQuest() {
    const res = updateQuestProgress(this.quests, this.activeQuestId, 1);
    this.quests = res.updatedQuests;
    if (res.completedQuest) {
      sound.playFanfare();
      this.stats.score += res.completedQuest.rewardXp;
      this.stats.gold += res.completedQuest.rewardGold;
      const { stats, leveledUp } = addXpAndCheckLevelUp(this.stats, res.completedQuest.rewardXp);
      this.stats = stats;
      if (leveledUp) sound.playFanfare();

      this.onQuestCompleted?.(res.completedQuest);
      if (res.nextQuestId) {
        this.activeQuestId = res.nextQuestId;
      }
    }
    this.onStatsChanged?.(this.stats);
  }

  /**
   * Main Simulation Update Loop (called per requestAnimationFrame)
   */
  private update(dt: number) {
    if (this.isPaused) return;

    // Clamp dt
    const clampedDt = Math.min(dt, 0.05);

    // Update God Mode timer & passive energy regeneration
    if (this.stats.godModeTimer > 0) {
      this.stats.godModeTimer = Math.max(0, this.stats.godModeTimer - clampedDt);
      if (this.stats.godModeTimer === 0) {
        this.thor.auraMesh.visible = false;
      }
    }
    this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + clampedDt * 8.0);

    // 1. Thor Movement & Flight Physics
    this.updateThorMovement(clampedDt);

    // 2. Mjölnir Flight & Recall Physics
    this.updateMjolnir(clampedDt);

    // 3. Enemies AI & Behavior
    this.updateEnemies(clampedDt);

    // 4. Proximity Checks (Bifröst Portal & NPC Dialogue)
    this.updateProximityTriggers();

    // 5. Particles & Damage Texts
    this.particles.update(clampedDt);

    // 6. Camera Follow with Exponential Damping & Trauma Shake
    this.updateCamera(clampedDt);

    // 7. Update Audio wind loop
    const speed = this.playerVelocity.length();
    sound.updateFlightWind(this.stats.isFlying, Math.min(1.0, speed / 30.0));
  }

  private updateThorMovement(dt: number) {
    const thor = this.thor.group;
    const isFlying = this.stats.isFlying;

    // Calculate movement intent vector from WASD and virtual joystick
    let moveForward = 0;
    let moveRight = 0;
    let flyUp = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) moveForward += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) moveForward -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) moveRight += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) moveRight -= 1;

    // Merge virtual joystick
    if (Math.abs(this.virtualJoystick.y) > 0.1) moveForward -= this.virtualJoystick.y;
    if (Math.abs(this.virtualJoystick.x) > 0.1) moveRight += this.virtualJoystick.x;

    this.isSprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const baseSpeed = this.stats.speed * (this.isSprinting ? 2.0 : 1.0) * (this.stats.godModeTimer > 0 ? 1.6 : 1.0);

    if (isFlying) {
      if (this.keys.has('Space') || this.virtualFlyUp) flyUp += 1;
      if (this.keys.has('KeyC') || this.virtualFlyDown) flyUp -= 1;

      // 3D Flight Direction: moves in camera view direction
      this.camera.getWorldDirection(_v1); // Forward
      _v2.crossVectors(_v1, this.camera.up).normalize(); // Right

      _v3.set(0, 0, 0);
      _v3.addScaledVector(_v1, moveForward);
      _v3.addScaledVector(_v2, moveRight);
      _v3.y += flyUp;

      if (_v3.lengthSq() > 0.01) {
        _v3.normalize();
        this.playerVelocity.lerp(_v3.multiplyScalar(baseSpeed * 1.5), 0.1);
        // Turn Thor towards flight vector
        const targetAngle = Math.atan2(this.playerVelocity.x, this.playerVelocity.z);
        thor.rotation.y = THREE.MathUtils.damp(thor.rotation.y, targetAngle, 8.0, dt);
      } else {
        this.playerVelocity.multiplyScalar(0.92);
      }

      thor.position.addScaledVector(this.playerVelocity, dt);
      // Min altitude
      if (thor.position.y < 0.5) {
        thor.position.y = 0.5;
        this.playerVelocity.y = 0;
      }
    } else {
      // Ground Walking / Running
      const forwardVec = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
      const rightVec = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

      _v1.set(0, 0, 0);
      _v1.addScaledVector(forwardVec, moveForward);
      _v1.addScaledVector(rightVec, moveRight);

      if (_v1.lengthSq() > 0.01) {
        _v1.normalize();
        this.playerVelocity.x = _v1.x * baseSpeed;
        this.playerVelocity.z = _v1.z * baseSpeed;

        const targetAngle = Math.atan2(this.playerVelocity.x, this.playerVelocity.z);
        thor.rotation.y = THREE.MathUtils.damp(thor.rotation.y, targetAngle, 10.0, dt);
      } else {
        this.playerVelocity.x *= 0.8;
        this.playerVelocity.z *= 0.8;
      }

      // Gravity & Grounding
      if (!this.isGrounded) {
        this.playerVelocity.y -= 25.0 * dt;
      }

      thor.position.x += this.playerVelocity.x * dt;
      thor.position.z += this.playerVelocity.z * dt;
      thor.position.y += this.playerVelocity.y * dt;

      // Ground plane collision (y = 0 or palace platform y = 6 / 12)
      let groundY = 0;
      if (this.currentRealmId === 'asgard' && thor.position.z < -75 && thor.position.z > -145) {
        groundY = 12.0; // Inside palace hall
      } else if (this.currentRealmId === 'asgard' && thor.position.z >= 75 && thor.position.z <= 245) {
        groundY = 4.0; // Bifrost bridge height
      }

      if (thor.position.y <= groundY) {
        thor.position.y = groundY;
        this.playerVelocity.y = 0;
        this.isGrounded = true;
      }
    }

    // Cape Wave & Limb Animation
    this.thor.animTime += dt * (isFlying ? 12 : this.playerVelocity.length() * 0.8);
    const speed = this.playerVelocity.length();

    // Body tilt during flight
    if (isFlying) {
      const targetPitch = Math.min(1.1, speed * 0.05);
      this.thor.group.rotation.x = THREE.MathUtils.damp(this.thor.group.rotation.x, targetPitch, 6.0, dt);
    } else {
      this.thor.group.rotation.x = THREE.MathUtils.damp(this.thor.group.rotation.x, 0, 8.0, dt);
    }

    // Cape flutter
    this.thor.cape.rotation.x = isFlying
      ? 0.85 + Math.sin(this.thor.animTime * 2.5) * 0.2
      : 0.1 + Math.sin(this.thor.animTime) * (speed * 0.03);

    // Limb walk swing when grounded
    if (this.isGrounded && speed > 0.5) {
      const swing = Math.sin(this.thor.animTime * 4) * 0.6;
      this.thor.leftLeg.rotation.x = swing;
      this.thor.rightLeg.rotation.x = -swing;
      this.thor.leftArm.rotation.x = -swing * 0.8;
      if (this.attackTimer <= 0) {
        this.thor.rightArm.rotation.x = swing * 0.8;
      }
    } else {
      this.thor.leftLeg.rotation.x = THREE.MathUtils.damp(this.thor.leftLeg.rotation.x, 0, 5, dt);
      this.thor.rightLeg.rotation.x = THREE.MathUtils.damp(this.thor.rightLeg.rotation.x, 0, 5, dt);
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      this.thor.rightArm.rotation.x = -Math.PI / 2 + Math.sin(this.attackTimer * 15) * 0.8;
    }
  }

  private updateMjolnir(dt: number) {
    if (this.mjolnirState === 'flying') {
      this.mjolnirWorldMesh.position.addScaledVector(this.mjolnirVelocity, dt);
      this.mjolnirWorldMesh.rotation.x += 20 * dt;
      this.mjolnirWorldMesh.rotation.y += 15 * dt;

      // Spawn spark trail
      if (Math.random() < 0.6) {
        this.particles.spawnSparkBurst(this.mjolnirWorldMesh.position, 3, 4);
      }

      // Check hit against enemies
      this.enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        _v1.set(enemy.position.x, enemy.position.y + 1, enemy.position.z);
        if (this.mjolnirWorldMesh.position.distanceTo(_v1) < 2.5) {
          this.damageEnemy(enemy, 85, true);
          sound.playHammerHit();
          this.particles.spawnSparkBurst(_v1, 25, 8);
          this.recallMjolnir();
        }
      });

      // Turn to recall when reached target distance
      if (this.mjolnirWorldMesh.position.distanceTo(this.thor.group.position) > 40.0) {
        this.recallMjolnir();
      }
    } else if (this.mjolnirState === 'recalling') {
      _v1.set(0.4, 1.2, 0).applyEuler(this.thor.group.rotation).add(this.thor.group.position);
      _v2.subVectors(_v1, this.mjolnirWorldMesh.position);
      const dist = _v2.length();

      if (dist < 1.2) {
        // Hammer returned to hand!
        this.mjolnirState = 'hand';
        this.mjolnirWorldMesh.visible = false;
        this.thor.mjolnir.visible = true;
        sound.playMjolnirCatch();
        this.particles.spawnSparkBurst(_v1, 15, 6);
      } else {
        _v2.normalize().multiplyScalar(42.0);
        this.mjolnirWorldMesh.position.addScaledVector(_v2, dt);
        this.mjolnirWorldMesh.rotation.x += 25 * dt;
      }
    }
  }

  private updateEnemies(dt: number) {
    const thorPos = this.thor.group.position;

    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;

      _v1.set(enemy.position.x, enemy.position.y, enemy.position.z);
      const dist = thorPos.distanceTo(_v1);

      // Aggro Range
      if (dist < 35.0) {
        enemy.state = 'chase';
        // Move towards Thor
        _v2.subVectors(thorPos, _v1).setY(0).normalize();
        enemy.position.x += _v2.x * enemy.speed * dt;
        enemy.position.z += _v2.z * enemy.speed * dt;
        enemy.rotation = Math.atan2(_v2.x, _v2.z);

        if (enemy.mesh) {
          enemy.mesh.position.set(enemy.position.x, enemy.position.y, enemy.position.z);
          enemy.mesh.rotation.y = enemy.rotation;
        }

        // Melee attack range
        const attackRange = enemy.type === 'frost_warlord' ? 5.5 : 3.0;
        if (dist <= attackRange) {
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.type === 'frost_warlord' ? 2.2 : 1.6;
            // Strike Thor
            const dmg = enemy.damage;
            this.stats.hp = Math.max(0, this.stats.hp - dmg);
            this.trauma = Math.min(1.0, this.trauma + 0.4);
            sound.playHammerHit();
            this.onStatsChanged?.(this.stats);

            if (this.stats.hp <= 0) {
              this.isGameOver = true;
            }
          }
        }
      }
    });
  }

  private updateProximityTriggers() {
    const thorPos = this.thor.group.position;

    // 1. Bifröst Realm Portal Proximity
    if (this.currentRealmId === 'asgard') {
      const portalPos = this.asgardScene.portalPosition;
      if (thorPos.distanceTo(portalPos) < 6.0) {
        this.switchRealm('jotunheim');
      }
    } else {
      const returnPortal = this.jotunheimScene.portalPosition;
      if (thorPos.distanceTo(returnPortal) < 6.0) {
        this.switchRealm('asgard');
      }
    }

    // 2. Check NPC Dialogue proximity (Odin at throne, Heimdall at Bifröst)
    this.currentRealmScene.npcs.forEach((npc) => {
      if (thorPos.distanceTo(npc.position) < 4.5) {
        if (this.activeQuestId === 'quest_1' && npc.name === 'Odin') {
          this.advanceActiveQuest();
          this.onDialogueOpen?.('Odin');
        } else if (this.activeQuestId === 'quest_4' && npc.name === 'Heimdall') {
          this.advanceActiveQuest();
          this.onDialogueOpen?.('Heimdall');
        } else if (this.activeQuestId === 'quest_8' && npc.name === 'Odin') {
          this.advanceActiveQuest();
          this.isVictory = true;
          sound.playFanfare();
        }
      }
    });
  }

  private updateCamera(dt: number) {
    const thorPos = this.thor.group.position;

    if (this.isFirstPerson) {
      this.camera.position.set(thorPos.x, thorPos.y + 1.8, thorPos.z);
      _targetLook.set(
        thorPos.x - Math.sin(this.cameraYaw) * 10,
        thorPos.y + 1.8 - Math.tan(this.cameraPitch) * 10,
        thorPos.z - Math.cos(this.cameraYaw) * 10
      );
      this.camera.lookAt(_targetLook);
    } else {
      // 3rd Person Follow with Exponential Damping
      const camY = Math.sin(this.cameraPitch) * this.cameraDistance;
      const camH = Math.cos(this.cameraPitch) * this.cameraDistance;
      const desiredX = thorPos.x + Math.sin(this.cameraYaw) * camH;
      const desiredZ = thorPos.z + Math.cos(this.cameraYaw) * camH;
      const desiredY = Math.max(0.5, thorPos.y + 1.6 + camY);

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, desiredX, 10.0, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, desiredY, 10.0, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, desiredZ, 10.0, dt);

      _targetLook.set(thorPos.x, thorPos.y + 1.6, thorPos.z);

      // Camera Shake
      if (this.trauma > 0) {
        const shake = this.trauma * this.trauma * 0.35;
        this.camera.position.x += (Math.random() - 0.5) * shake;
        this.camera.position.y += (Math.random() - 0.5) * shake;
        this.trauma = Math.max(0, this.trauma - dt * 1.5);
      }

      this.camera.lookAt(_targetLook);
    }
  }

  /**
   * Continuous Game Loop with software WebGL guard
   */
  private startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;
      const dt = this.clock.getDelta();

      this.update(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDestroyed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 40); // 25 fps pacing for headless
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public saveGame(): boolean {
    return saveGameState({
      stats: this.stats,
      quests: this.quests,
      activeQuestId: this.activeQuestId,
      realm: this.currentRealmId,
      settings: this.settings,
      timestamp: Date.now(),
    });
  }

  public loadGame(): boolean {
    const data = loadGameState();
    if (!data) return false;
    this.stats = data.stats;
    this.quests = data.quests;
    this.activeQuestId = data.activeQuestId;
    this.settings = data.settings;
    if (data.realm !== this.currentRealmId) {
      this.switchRealm(data.realm as any);
    }
    this.onStatsChanged?.(this.stats);
    return true;
  }

  public restartGame() {
    this.stats = { ...INITIAL_PLAYER_STATS };
    this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    this.activeQuestId = 'quest_1';
    this.isGameOver = false;
    this.isVictory = false;
    this.isPaused = false;
    this.switchRealm('asgard');
    this.thor.group.position.set(0, 0, 10);
    this.initEnemies();
    this.onStatsChanged?.(this.stats);
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.particles.dispose();
    this.renderer.dispose();
    sound.stopMusic();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
