/**
 * THOR: GOD OF THUNDER - Cinematic Title Screen
 */
import React, { useEffect, useState } from 'react';
import { hasSavedGame } from '../game/rules.ts';
import { Volume2, VolumeX, Shield, Swords, Sparkles, BookOpen } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onContinueGame: () => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onContinueGame,
  onOpenControls,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
}) => {
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setCanContinue(hasSavedGame());

    // Listen for Enter / Space key to quick start per game craft guidelines
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between items-center select-none text-white overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 25%, rgba(13, 27, 42, 0.4) 0%, rgba(5, 7, 10, 0.85) 75%, #030406 100%)',
      }}
    >
      {/* Top Utility Bar */}
      <div className="w-full max-w-6xl px-8 pt-8 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2 text-amber-400 font-bold tracking-widest text-xs uppercase bg-black/40 px-3 py-1.5 rounded border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Asgard Studios · AAA WebGL Engine</span>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2.5 rounded bg-black/40 hover:bg-black/70 border border-amber-500/30 text-amber-300 transition-colors"
          title={soundEnabled ? 'Mute Audio [M]' : 'Unmute Audio [M]'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Center Cinematic Lockup */}
      <div className="flex flex-col items-center text-center my-auto px-4 max-w-3xl pointer-events-auto">
        {/* Bespoke Inline SVG Nordic Crest Lockup */}
        <div className="mb-4">
          <svg className="w-24 h-24 mx-auto text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" viewBox="0 0 100 100" fill="none">
            {/* Winged Circlet Crest */}
            <path d="M 50 15 L 65 35 L 50 30 L 35 35 Z" fill="#d4af37" stroke="#fff" strokeWidth="1" />
            <path d="M 50 30 L 50 75" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 30 45 L 70 45" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="45" r="14" stroke="#38bdf8" strokeWidth="3" fill="#0c4a6e" />
            {/* Mjölnir silhouette in center */}
            <rect x="42" y="38" width="16" height="10" rx="1.5" fill="#f8fafc" />
            <rect x="48" y="47" width="4" height="15" fill="#ca8a04" />
            {/* Lightning bolts */}
            <path d="M 22 25 L 34 40 L 26 48 L 40 68" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 78 25 L 66 40 L 74 48 L 60 68" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <h1
          className="text-6xl md:text-8xl font-black tracking-wider text-transparent bg-clip-text drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
          style={{
            fontFamily: "'Cinzel', serif",
            backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fef08a 45%, #eab308 80%, #a16207 100%)',
            WebkitBackgroundClip: 'text',
          }}
        >
          THOR
        </h1>

        <div className="mt-2 mb-8 flex items-center justify-center gap-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-cyan-400 to-amber-400"></div>
          <span
            className="text-lg md:text-xl font-bold tracking-[0.35em] text-cyan-300 uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            God of Thunder
          </span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent via-cyan-400 to-amber-400"></div>
        </div>

        {/* Menu Buttons Cluster */}
        <div className="flex flex-col gap-3 w-64 md:w-72">
          <button
            data-start="true"
            onClick={onStartGame}
            className="w-full py-4 px-6 rounded-md bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-extrabold text-base md:text-lg tracking-widest uppercase shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-yellow-200/50"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <Swords className="w-5 h-5 text-stone-900" />
            <span>Yeni Oyun (New Game)</span>
          </button>

          {canContinue && (
            <button
              onClick={onContinueGame}
              className="w-full py-3 px-6 rounded-md bg-stone-900/80 hover:bg-stone-800 text-amber-300 font-bold text-sm md:text-base tracking-wider uppercase border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <Shield className="w-4 h-4" />
              <span>Oyuna Devam Et</span>
            </button>
          )}

          <button
            onClick={onOpenControls}
            className="w-full py-2.5 px-6 rounded-md bg-stone-900/60 hover:bg-stone-800/80 text-stone-300 font-semibold text-xs md:text-sm tracking-wider uppercase border border-stone-700 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Kontroller (Controls)</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-6 rounded-md bg-stone-900/60 hover:bg-stone-800/80 text-stone-400 hover:text-stone-200 font-semibold text-xs md:text-sm tracking-wider uppercase border border-stone-800 hover:border-stone-600 transition-all"
          >
            Ayarlar (Settings)
          </button>
        </div>
      </div>

      {/* Bottom Flat Control Hint Line per Game Craft guidelines */}
      <div className="w-full pb-8 text-center pointer-events-none">
        <p className="text-xs md:text-sm font-medium tracking-widest text-stone-400">
          WASD Hareket · Space Zıplama/Serbest Uçuş · Sol Tık Saldırı · Q Mjölnir Fırlat · E Geri Çağır · F Yıldırım · Esc Duraklat
        </p>
      </div>
    </div>
  );
};
