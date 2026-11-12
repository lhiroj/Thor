/**
 * THOR: GOD OF THUNDER - In-Game HUD
 * High-fidelity, low-occlusion Norse mythology HUD (>85% clear playfield).
 */
import React from 'react';
import { PlayerStats, Quest, RealmId } from '../game/types.ts';
import { FloatingText } from '../game/particles.ts';
import {
  Zap,
  Heart,
  Compass,
  Map as MapIcon,
  Volume2,
  VolumeX,
  Pause,
  Coins,
  Crosshair,
  Wind,
} from 'lucide-react';

interface GameHUDProps {
  stats: PlayerStats;
  activeQuest?: Quest;
  currentRealm: RealmId;
  mjolnirState: 'hand' | 'flying' | 'recalling';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenMap: () => void;
  onPause: () => void;
  onCastAbility: (action: string) => void;
  floatingTexts: FloatingText[];
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  activeQuest,
  currentRealm,
  mjolnirState,
  soundEnabled,
  onToggleSound,
  onOpenMap,
  onPause,
  onCastAbility,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const energyPercent = Math.max(0, Math.min(100, (stats.energy / stats.maxEnergy) * 100));
  const xpPercent = Math.max(0, Math.min(100, (stats.xp / stats.maxXp) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none font-sans overflow-hidden">
      {/* Top Left: Thor Status Cluster */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-2 md:gap-3 pointer-events-auto">
        {/* Hero Thor Avatar Frame */}
        <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl">⚡</span>
            <span className="text-[8px] md:text-[10px] font-black text-amber-300 tracking-wider uppercase font-serif">THOR</span>
          </div>
          <div className="absolute bottom-0 right-0 bg-amber-500 text-stone-950 text-[9px] md:text-[10px] font-black px-1 py-0.5 rounded-tl font-mono">
            LV{stats.level}
          </div>
        </div>

        {/* Vitality & Energy Bars */}
        <div className="flex flex-col gap-1 w-32 md:w-56">
          {/* Health Bar */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold tracking-wider text-red-200 mb-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500 fill-red-500" /> CAN
              </span>
              <span className="font-mono tabular-nums text-[10px] md:text-xs font-bold text-red-300">
                {Math.round(stats.hp)}
              </span>
            </div>
            <div className="h-2 md:h-3 w-full bg-stone-900/90 rounded border border-red-950/80 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-red-600 to-rose-500 transition-all duration-150"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Thunder Energy Bar */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center text-[9px] md:text-[10px] font-bold tracking-wider text-cyan-200 mb-0.5">
              <span className="flex items-center gap-1 font-mono">
                <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400 fill-cyan-400" /> GÜÇ
              </span>
              <span className="font-mono tabular-nums text-[10px] md:text-xs font-bold text-cyan-300">
                {Math.round(stats.energy)}
              </span>
            </div>
            <div className="h-1.5 md:h-2.5 w-full bg-stone-900/90 rounded border border-cyan-950/80 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 via-sky-400 to-cyan-300 transition-all duration-150"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Realm & Active Quest Tracker Cluster */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col items-end gap-1.5 md:gap-2.5 pointer-events-auto max-w-[180px] md:max-w-sm">
        {/* Realm Indicator & Utilities */}
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-1 md:px-3 md:py-1.5 rounded bg-black/60 border border-amber-500/40 text-amber-300 text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-md">
            <Compass className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-400" />
            <span>{currentRealm === 'asgard' ? 'ASGARD' : 'JOTUNHEIM'}</span>
          </div>

          <button
            onClick={onOpenMap}
            className="p-1.5 md:p-2 rounded bg-black/60 hover:bg-black/90 border border-stone-700 hover:border-amber-400 text-amber-300 transition-colors"
            title="Haritayı Aç [M]"
          >
            <MapIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 md:p-2 rounded bg-black/60 hover:bg-black/90 border border-stone-700 hover:border-amber-400 text-amber-300 transition-colors"
            title={soundEnabled ? 'Sesi Kapat [M]' : 'Sesi Aç [M]'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4 text-stone-400" />}
          </button>

          <button
            onClick={onPause}
            className="p-1.5 md:p-2 rounded bg-black/60 hover:bg-black/90 border border-stone-700 hover:border-amber-400 text-amber-300 transition-colors"
            title="Menü [Esc]"
          >
            <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Quest Tracker Box */}
        {activeQuest && (
          <div className="w-full bg-black/75 border-l-2 md:border-l-4 border-l-amber-500 border border-stone-800 p-2 md:p-3 rounded-r-lg shadow-lg text-left">
            <div className="flex items-center justify-between text-[10px] md:text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
              <span className="truncate max-w-[110px] md:max-w-none">{activeQuest.turkishTitle || activeQuest.title}</span>
              <span className="font-mono tabular-nums text-cyan-300 bg-cyan-950/60 px-1 py-0.5 rounded text-[9px] md:text-[10px]">
                {activeQuest.currentCount}/{activeQuest.objectiveCount}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-stone-300 leading-tight line-clamp-2 md:line-clamp-none">
              {activeQuest.description}
            </p>
          </div>
        )}
      </div>

      {/* Center Reticle & Status Cue */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative flex items-center justify-center">
          <Crosshair className="w-6 h-6 text-cyan-400/60" />
          {mjolnirState !== 'hand' && (
            <span className="absolute -bottom-6 text-[10px] font-mono tracking-wider font-bold text-amber-400 bg-black/70 px-2 py-0.5 rounded border border-amber-500/40">
              {mjolnirState === 'flying' ? 'MJÖLNİR HAVADA (Q)' : 'GERİ DÖNÜYOR (E)'}
            </span>
          )}
        </div>

        {/* Flight Mode Notification */}
        {stats.isFlying && (
          <div className="mt-8 flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-400/50 rounded-full text-cyan-300 text-xs font-bold tracking-widest uppercase">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>SERBEST UÇUŞ (FREE FLIGHT) [SPACE]</span>
          </div>
        )}

        {/* God Mode Active Banner */}
        {stats.godModeTimer > 0 && (
          <div className="mt-2 px-3 py-1 bg-amber-500 text-stone-950 text-xs font-black tracking-widest uppercase rounded shadow-[0_0_20px_rgba(245,158,11,0.8)]">
            ⚡ GOD MODE AKTİF: {stats.godModeTimer.toFixed(1)}s ⚡
          </div>
        )}
      </div>

      {/* Bottom Center: Ability Hotbar Dock */}
      <div className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 items-center gap-2 pointer-events-auto bg-black/75 px-3.5 py-2 rounded-xl border border-stone-800 shadow-2xl max-w-[96vw] overflow-x-auto">
        {/* Light Attack */}
        <button
          onClick={() => onCastAbility('light_attack')}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center text-amber-300 transition-transform active:scale-95"
          title="Normal Çekiç Saldırısı [Sol Tık]"
        >
          <span className="text-xl">🔨</span>
          <span className="text-[9px] font-bold text-stone-300 uppercase">Vuruş</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-amber-400 font-bold">L-TIK</span>
        </button>

        {/* Heavy Attack */}
        <button
          onClick={() => onCastAbility('heavy_attack')}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg bg-stone-900 hover:bg-stone-800 border border-amber-500/40 hover:border-amber-400 flex flex-col items-center justify-center text-amber-300 transition-transform active:scale-95"
          title="Ağır Saldırı / Ground Slam [Sağ Tık]"
        >
          <span className="text-xl">💥</span>
          <span className="text-[9px] font-bold text-stone-300 uppercase">Ağır</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-amber-400 font-bold">R-TIK</span>
        </button>

        {/* Mjölnir Throw */}
        <button
          onClick={() => onCastAbility('throw')}
          disabled={mjolnirState !== 'hand'}
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg bg-stone-900 border flex flex-col items-center justify-center text-cyan-300 transition-transform active:scale-95 ${
            mjolnirState === 'hand'
              ? 'hover:bg-stone-800 border-cyan-500/50 hover:border-cyan-400 cursor-pointer'
              : 'opacity-40 border-stone-800 cursor-not-allowed'
          }`}
          title="Mjölnir Fırlat [Q]"
        >
          <span className="text-xl">⚡</span>
          <span className="text-[9px] font-bold text-cyan-200 uppercase">Fırlat</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-cyan-400 font-bold">[Q]</span>
        </button>

        {/* Mjölnir Recall */}
        <button
          onClick={() => onCastAbility('recall')}
          disabled={mjolnirState !== 'flying'}
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg bg-stone-900 border flex flex-col items-center justify-center text-cyan-300 transition-transform active:scale-95 ${
            mjolnirState === 'flying'
              ? 'hover:bg-stone-800 border-cyan-400 animate-pulse cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.6)]'
              : 'opacity-40 border-stone-800 cursor-not-allowed'
          }`}
          title="Mjölnir Geri Çağır [E]"
        >
          <span className="text-xl">🧲</span>
          <span className="text-[9px] font-bold text-cyan-200 uppercase">Çağır</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-cyan-400 font-bold">[E]</span>
        </button>

        {/* Flight Toggle */}
        <button
          onClick={() => onCastAbility('flight')}
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg border flex flex-col items-center justify-center transition-transform active:scale-95 ${
            stats.isFlying
              ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
              : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-300'
          }`}
          title="Uçuş Modu Aç / Kapat [Space]"
        >
          <span className="text-xl">🦅</span>
          <span className="text-[9px] font-bold uppercase">{stats.isFlying ? 'İniş' : 'Uçuş'}</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-amber-400 font-bold">[SPACE]</span>
        </button>

        {/* Lightning Strike */}
        <button
          onClick={() => onCastAbility('lightning_strike')}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg bg-stone-900 hover:bg-stone-800 border border-blue-500/50 hover:border-blue-400 flex flex-col items-center justify-center text-blue-300 transition-transform active:scale-95"
          title="Yıldırım Saldırısı (Lightning Strike) [F] · 25 Enerji"
        >
          <span className="text-xl">🌩️</span>
          <span className="text-[9px] font-bold text-blue-200 uppercase">Yıldırım</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-blue-400 font-bold">[F]</span>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-cyan-300">25e</span>
        </button>

        {/* Thunder Wave */}
        <button
          onClick={() => onCastAbility('thunder_wave')}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg bg-stone-900 hover:bg-stone-800 border border-blue-500/50 hover:border-blue-400 flex flex-col items-center justify-center text-blue-300 transition-transform active:scale-95"
          title="Thunder Wave (Şok Dalgası) [R] · 35 Enerji"
        >
          <span className="text-xl">🌊</span>
          <span className="text-[9px] font-bold text-blue-200 uppercase">Dalga</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-blue-400 font-bold">[R]</span>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-cyan-300">35e</span>
        </button>

        {/* God Mode */}
        <button
          onClick={() => onCastAbility('god_mode')}
          disabled={stats.energy < 50 || stats.godModeTimer > 0}
          className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg border flex flex-col items-center justify-center transition-transform active:scale-95 ${
            stats.godModeTimer > 0
              ? 'bg-amber-500 text-stone-950 font-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
              : stats.energy >= 50
              ? 'bg-stone-900 hover:bg-stone-800 border-amber-500 text-amber-300 cursor-pointer'
              : 'opacity-40 bg-stone-950 border-stone-800 text-stone-500 cursor-not-allowed'
          }`}
          title="Tanrı Modu (God Mode) [G] · 50 Enerji"
        >
          <span className="text-xl">👑</span>
          <span className="text-[9px] font-bold uppercase">God Mode</span>
          <span className="absolute top-0.5 left-1 text-[8px] font-mono text-amber-400 font-bold">[G]</span>
          <span className="absolute bottom-0.5 right-1 text-[7px] font-mono text-amber-300">50e</span>
        </button>
      </div>
    </div>
  );
};
