/**
 * THOR: GOD OF THUNDER - Pure Game Rules & Logic
 */
import { PlayerStats, Quest, GameSettings } from './types.ts';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  volume: 0.8,
  graphicsQuality: 'high',
  cameraSensitivity: 1.0,
  invertY: false,
  fov: 65,
};

export const INITIAL_PLAYER_STATS: PlayerStats = {
  hp: 250,
  maxHp: 250,
  energy: 100,
  maxEnergy: 100,
  level: 1,
  xp: 0,
  maxXp: 100,
  gold: 0,
  score: 0,
  damage: 40,
  speed: 12,
  isFlying: false,
  godModeTimer: 0,
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_1',
    stageNumber: 1,
    title: "The All-Father's Decree",
    turkishTitle: "Odin'in Çağrısı",
    description: "Enter the golden throne room of Odin's Palace and speak with the All-Father.",
    targetNpc: 'Odin',
    targetRealm: 'asgard',
    targetPosition: { x: 0, y: 15, z: -100 },
    objectiveCount: 1,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 120,
    rewardGold: 100,
  },
  {
    id: 'quest_2',
    stageNumber: 2,
    title: 'Defenders of Asgard',
    turkishTitle: "Asgard'ın Savunucusu",
    description: 'Fly to the palace courtyards and defeat the invading Frost Scout vanguard.',
    targetRealm: 'asgard',
    targetPosition: { x: 40, y: 2, z: 20 },
    objectiveCount: 3,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 180,
    rewardGold: 150,
  },
  {
    id: 'quest_3',
    stageNumber: 3,
    title: 'Trial of the Thunder God',
    turkishTitle: 'Yıldırım Eğitimi',
    description: 'Unleash Mjölnir Throw (Q) and Lightning Strike (F) to vanquish 4 Dark Elf infiltrators.',
    targetRealm: 'asgard',
    targetPosition: { x: -60, y: 3, z: 60 },
    objectiveCount: 4,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 250,
    rewardGold: 200,
  },
  {
    id: 'quest_4',
    stageNumber: 4,
    title: 'The Bifröst Watch',
    turkishTitle: "Bifröst'e Yolculuk",
    description: "Fly down the rainbow Bifröst bridge and speak with Heimdall at the Observatory.",
    targetNpc: 'Heimdall',
    targetRealm: 'asgard',
    targetPosition: { x: 0, y: 5, z: 220 },
    objectiveCount: 1,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 300,
    rewardGold: 250,
  },
  {
    id: 'quest_5',
    stageNumber: 5,
    title: 'Portal to Jotunheim',
    turkishTitle: "Jotunheim'a Geçiş",
    description: 'Enter the celestial portal at the Bifröst to warp across realms to the frozen wastes of Jotunheim.',
    targetRealm: 'asgard',
    targetPosition: { x: 0, y: 6, z: 240 },
    objectiveCount: 1,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 350,
    rewardGold: 300,
  },
  {
    id: 'quest_6',
    stageNumber: 6,
    title: 'The Frozen Vanguard',
    turkishTitle: 'Buz Devleri Baskını',
    description: 'Defeat 5 Jotunheim Frost Giants guarding the glacial canyon in Jotunheim.',
    targetRealm: 'jotunheim',
    targetPosition: { x: 20, y: 0, z: -40 },
    objectiveCount: 5,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 500,
    rewardGold: 450,
  },
  {
    id: 'quest_7',
    stageNumber: 7,
    title: 'Wrath of the Frost Warlord',
    turkishTitle: 'Buz Lordunun Gazabı',
    description: 'Slay the colossal Frost Giant Warlord in the Glacial Arena with Thunderstorm!',
    targetRealm: 'jotunheim',
    targetPosition: { x: 0, y: 2, z: -120 },
    objectiveCount: 1,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 1000,
    rewardGold: 1000,
  },
  {
    id: 'quest_8',
    stageNumber: 8,
    title: 'The Realm Restored',
    turkishTitle: 'Asgard Zaferi',
    description: "Return via the Bifröst to Odin's throne room to claim the title: Champion of the Nine Realms.",
    targetNpc: 'Odin',
    targetRealm: 'asgard',
    targetPosition: { x: 0, y: 15, z: -100 },
    objectiveCount: 1,
    currentCount: 0,
    isCompleted: false,
    rewardXp: 2000,
    rewardGold: 2000,
  },
];

/**
 * Calculates XP required to advance from current level to next level
 */
export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, Math.max(1, level) - 1));
}

/**
 * Adds XP to player, handling level ups and stat scaling
 */
export function addXpAndCheckLevelUp(stats: PlayerStats, xpGained: number): { stats: PlayerStats; leveledUp: boolean } {
  let newXp = stats.xp + xpGained;
  let newLevel = stats.level;
  let maxXp = stats.maxXp;
  let maxHp = stats.maxHp;
  let damage = stats.damage;
  let leveledUp = false;

  while (newXp >= maxXp) {
    newXp -= maxXp;
    newLevel += 1;
    maxXp = calculateXpForLevel(newLevel);
    maxHp += 30;
    damage += 8;
    leveledUp = true;
  }

  return {
    stats: {
      ...stats,
      level: newLevel,
      xp: newXp,
      maxXp,
      maxHp,
      hp: leveledUp ? maxHp : stats.hp, // Full heal on level up
      damage,
    },
    leveledUp,
  };
}

/**
 * Calculates combat damage with optional critical and God Mode multiplier
 */
export function calculateDamage(
  baseDamage: number,
  isHeavy: boolean = false,
  isGodMode: boolean = false,
  critChance: number = 0.2
): { damage: number; isCrit: boolean } {
  const critMultiplier = 1.8;
  const isCrit = Math.random() < critChance;
  let mult = isHeavy ? 2.2 : 1.0;
  if (isCrit) mult *= critMultiplier;
  if (isGodMode) mult *= 2.0;

  // Add ±10% damage roll variance
  const variance = 0.9 + Math.random() * 0.2;
  const finalDamage = Math.round(baseDamage * mult * variance);

  return {
    damage: Math.max(1, finalDamage),
    isCrit,
  };
}

/**
 * Progresses an active quest by an increment
 */
export function updateQuestProgress(
  quests: Quest[],
  activeQuestId: string,
  increment: number = 1
): { updatedQuests: Quest[]; completedQuest: Quest | null; nextQuestId: string | null } {
  let completedQuest: Quest | null = null;
  let nextQuestId: string | null = null;

  const updatedQuests = quests.map((q) => {
    if (q.id === activeQuestId && !q.isCompleted) {
      const newCount = Math.min(q.objectiveCount, q.currentCount + increment);
      const isCompleted = newCount >= q.objectiveCount;
      const updated = { ...q, currentCount: newCount, isCompleted };
      if (isCompleted) {
        completedQuest = updated;
      }
      return updated;
    }
    return q;
  });

  if (completedQuest) {
    const nextQ = updatedQuests.find((q) => !q.isCompleted);
    if (nextQ) nextQuestId = nextQ.id;
  }

  return { updatedQuests, completedQuest, nextQuestId };
}

/**
 * LocalStorage save state serialization
 */
const SAVE_KEY = 'thor_god_of_thunder_save_v1';

export interface GameSaveData {
  stats: PlayerStats;
  quests: Quest[];
  activeQuestId: string;
  realm: string;
  settings: GameSettings;
  timestamp: number;
}

export function saveGameState(data: GameSaveData): boolean {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to save game state to LocalStorage:', err);
    return false;
  }
}

export function loadGameState(): GameSaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.stats || typeof parsed.stats.hp !== 'number') {
      return null;
    }
    return parsed as GameSaveData;
  } catch (err) {
    console.error('Failed to load game state from LocalStorage:', err);
    return null;
  }
}

export function hasSavedGame(): boolean {
  return !!localStorage.getItem(SAVE_KEY);
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}
