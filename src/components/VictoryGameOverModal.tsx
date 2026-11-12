/**
 * THOR: GOD OF THUNDER - Victory & Game Over Modals
 */
import React from 'react';
import { PlayerStats } from '../game/types.ts';
import { Trophy, Skull, RotateCcw, Swords } from 'lucide-react';

interface VictoryGameOverModalProps {
  isVictory: boolean;
  isGameOver: boolean;
  stats: PlayerStats;
  onRestart: () => void;
  onExitToTitle: () => void;
}

export const VictoryGameOverModal: React.FC<VictoryGameOverModalProps> = ({
  isVictory,
  isGameOver,
  stats,
  onRestart,
  onExitToTitle,
}) => {
  if (!isVictory && !isGameOver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none text-white">
      <div
        className={`w-full max-w-md bg-stone-950 border-2 rounded-2xl shadow-2xl overflow-hidden p-6 text-center ${
          isVictory ? 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)]' : 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.5)]'
        }`}
      >
        {/* Crest Icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-black/60 border border-stone-800">
          {isVictory ? (
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          ) : (
            <Skull className="w-10 h-10 text-red-500 animate-pulse" />
          )}
        </div>

        {/* Title */}
        <h2
          className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-2 font-serif"
          style={{ color: isVictory ? '#facc15' : '#ef4444' }}
        >
          {isVictory ? "ASGARD'IN ZAFERİ!" : 'VALHALLA SENİ BEKLİYOR'}
        </h2>

        <p className="text-xs md:text-sm text-stone-300 mb-6 leading-relaxed">
          {isVictory
            ? 'Dokuz Diyarın Şampiyonu Thor! Buz Devleri yenildi, All-Father Odin krallığın kurtarıcısını kutluyor.'
            : 'Thor savaş alanında yere düştü. Ancak gök gürültüsü tanrısı asla pes etmez. Yeniden ayağa kalk ve Mjölnir’i kavra!'}
        </p>

        {/* Stats Readout Tiles */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase block">Seviye (LVL)</span>
            <span className="text-base font-black text-amber-400 font-mono tabular-nums">{stats.level}</span>
          </div>
          <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase block">Skor</span>
            <span className="text-base font-black text-cyan-400 font-mono tabular-nums">{stats.score}</span>
          </div>
          <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase block">Altın</span>
            <span className="text-base font-black text-yellow-400 font-mono tabular-nums">{stats.gold}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col gap-2.5">
          <button
            data-start="true"
            onClick={onRestart}
            className={`w-full py-3 px-6 rounded-lg font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 ${
              isVictory
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isVictory ? 'Yeniden Oyna (Play Again)' : 'Tekrar Dene (Try Again)'}</span>
          </button>

          <button
            onClick={onExitToTitle}
            className="w-full py-2.5 px-6 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold text-xs uppercase border border-stone-800 transition-colors"
          >
            Ana Menüye Dön (Exit to Title)
          </button>
        </div>
      </div>
    </div>
  );
};
