import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateXpForLevel,
  addXpAndCheckLevelUp,
  calculateDamage,
  updateQuestProgress,
  INITIAL_PLAYER_STATS,
  INITIAL_QUESTS,
} from './rules.ts';

test('calculateXpForLevel increases requirement with higher levels', () => {
  const lvl1 = calculateXpForLevel(1);
  const lvl2 = calculateXpForLevel(2);
  const lvl5 = calculateXpForLevel(5);

  assert.equal(lvl1, 100);
  assert.ok(lvl2 > lvl1, 'Level 2 should require more XP than Level 1');
  assert.ok(lvl5 > lvl2, 'Level 5 should require more XP than Level 2');
});

test('addXpAndCheckLevelUp increases XP and triggers level up when exceeding maxXp', () => {
  const initial = { ...INITIAL_PLAYER_STATS, xp: 50, maxXp: 100, level: 1, hp: 100, maxHp: 250 };
  
  // Partial XP gain - no level up
  const res1 = addXpAndCheckLevelUp(initial, 30);
  assert.equal(res1.leveledUp, false);
  assert.equal(res1.stats.xp, 80);
  assert.equal(res1.stats.level, 1);

  // Level up trigger
  const res2 = addXpAndCheckLevelUp(res1.stats, 30);
  assert.equal(res2.leveledUp, true);
  assert.equal(res2.stats.level, 2);
  assert.equal(res2.stats.xp, 10);
  assert.equal(res2.stats.hp, res2.stats.maxHp); // Healed to new max
  assert.ok(res2.stats.maxHp > initial.maxHp);
  assert.ok(res2.stats.damage > initial.damage);
});

test('calculateDamage applies heavy and god mode multipliers', () => {
  // Fixed variance check with zero crit chance
  const normal = calculateDamage(50, false, false, 0);
  const heavy = calculateDamage(50, true, false, 0);
  const god = calculateDamage(50, false, true, 0);

  assert.ok(normal.damage > 0);
  assert.ok(heavy.damage > normal.damage * 1.5, 'Heavy attack should be significantly stronger');
  assert.ok(god.damage > normal.damage * 1.5, 'God mode damage should be significantly stronger');
});

test('updateQuestProgress advances quest objective and detects completion', () => {
  const quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
  const activeId = quests[1].id; // Stage 2: objective count = 3

  // First increment
  const step1 = updateQuestProgress(quests, activeId, 1);
  assert.equal(step1.completedQuest, null);
  const q1 = step1.updatedQuests.find((q: any) => q.id === activeId);
  assert.ok(q1);
  assert.equal(q1.currentCount, 1);
  assert.equal(q1.isCompleted, false);

  // Complete quest
  const step2 = updateQuestProgress(step1.updatedQuests, activeId, 2);
  assert.notEqual(step2.completedQuest, null);
  assert.equal(step2.completedQuest?.id, activeId);
  assert.equal(step2.completedQuest?.isCompleted, true);
  assert.notEqual(step2.nextQuestId, null);
});
