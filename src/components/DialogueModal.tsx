/**
 * THOR: GOD OF THUNDER - NPC Dialogue Modal
 */
import React from 'react';
import { Crown, Shield, Sparkles, X } from 'lucide-react';

interface DialogueModalProps {
  speaker: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({ speaker, isOpen, onClose }) => {
  if (!isOpen) return null;

  const dialogues: Record<string, { title: string; subtitle: string; text: string; icon: string }> = {
    Odin: {
      title: 'ALL-FATHER ODIN',
      subtitle: "Asgard'ın Yüce Kralı & Dokuz Diyarın Hükümdarı",
      text: 'Evladım Thor! Mjölnir ellerinde parıldıyor. Buz Devleri Asgard’ın kutsal sınırlarını zorlamaya başladı. Şehri savun, Bifröst’e git ve Heimdall ile buluşarak Jotunheim’a geç. Asgard’ın onurunu ve gücünü onlara bir kez daha göster!',
      icon: '👑',
    },
    Heimdall: {
      title: 'HEIMDALL',
      subtitle: "Bifröst'ün Muhafızı & Her Şeyi Gören Göz",
      text: 'Hoş geldin Gök Gürültüsü Tanrısı! Bifröst köprüsü hazır. Kozmik enerjiler portalı açtı. Karşı tarafta seni Jotunheim’ın dondurucu fırtınaları ve Buz Lordu bekliyor. Mjölnir’i hazır tut!',
      icon: '⚔️',
    },
  };

  const current = dialogues[speaker] || dialogues.Odin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none">
      <div className="w-full max-w-lg bg-stone-950 border-2 border-amber-500/80 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.4)] overflow-hidden flex flex-col text-white">
        {/* Header with Royal Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border-b border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{current.icon}</span>
            <div>
              <h3 className="text-xl font-black tracking-widest text-amber-300 uppercase font-serif">
                {current.title}
              </h3>
              <p className="text-[11px] text-stone-400 font-medium tracking-wide">
                {current.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialogue Body */}
        <div className="p-6">
          <div className="p-4 rounded-xl bg-black/40 border border-stone-800 text-sm md:text-base text-stone-200 leading-relaxed font-serif italic mb-6">
            "{current.text}"
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-stone-900" />
            <span>Emredersiniz! (Asgard Adına!)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
