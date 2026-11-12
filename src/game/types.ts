/**
 * THOR: GOD OF THUNDER - Type Definitions
 */

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

export type RealmId = 'asgard' | 'jotunheim';

export interface PlayerStats {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
  score: number;
  damage: number;
  speed: number;
  isFlying: boolean;
  godModeTimer: number;
}

export interface AbilityInfo {
  id: string;
  name: string;
  turkishName: string;
  keyHint: string;
  cooldown: number;
  currentCooldown: number;
  energyCost: number;
  icon: string;
  description: string;
}

export type EnemyType = 'frost_giant' | 'dark_elf' | 'fire_imp' | 'frost_warlord';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'hit' | 'dead';
  windupTimer: number;
  attackCooldown: number;
  scale: number;
  mesh?: any;
}

export interface Quest {
  id: string;
  stageNumber: number;
  title: string;
  turkishTitle: string;
  description: string;
  targetNpc?: string;
  targetRealm: RealmId;
  targetPosition: { x: number; y: number; z: number };
  objectiveCount: number;
  currentCount: number;
  isCompleted: boolean;
  rewardXp: number;
  rewardGold: number;
}

export interface DialogueNode {
  speaker: string;
  title: string;
  avatar: string;
  text: string;
  responses: {
    label: string;
    action?: string;
  }[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  cameraSensitivity: number;
  invertY: boolean;
  fov: number;
}
