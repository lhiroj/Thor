/**
 * THOR: GOD OF THUNDER - Realm World Map Modal
 */
import React from 'react';
import { RealmId } from '../game/types.ts';
import { MapPin, X, Compass } from 'lucide-react';

interface FullMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRealm: RealmId;
  playerPos: { x: number; y: number; z: number };
}

export const FullMapModal: React.FC<FullMapModalProps> = ({
  isOpen,
  onClose,
  currentRealm,
  playerPos,
}) => {
  if (!isOpen) return null;

  // Convert 3D world coords to SVG map coords [0..400]
  // Asgard: x [-100..100], z [-120..260]
  const mapX = Math.max(20, Math.min(380, 200 + playerPos.x * 1.5));
  const mapY = Math.max(20, Math.min(380, 160 + playerPos.z * 0.75));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 select-none text-white">
      <div className="w-full max-w-2xl bg-stone-950 border-2 border-amber-500/70 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black tracking-wider uppercase text-amber-300 font-serif">
              {currentRealm === 'asgard' ? 'ASGARD KRALLIĞI HARİTASI' : 'JOTUNHEIM BUZ VADİSİ HARİTASI'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-stone-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas Visual (SVG Stylized Fantasy Realm Map) */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-md bg-stone-900/90 rounded-xl border border-stone-800 overflow-hidden shadow-inner">
            <svg className="w-full h-full" viewBox="0 0 400 400">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#grid)" />

              {currentRealm === 'asgard' ? (
                <>
                  {/* Asgard Realm Features */}
                  {/* Palace Area (North) */}
                  <rect x="130" y="40" width="140" height="70" rx="10" fill="#292524" stroke="#d97706" strokeWidth="2" />
                  <text x="200" y="80" textAnchor="middle" fill="#fde68a" fontSize="12" fontWeight="bold">
                    ODİN'İN SARAYI
                  </text>

                  {/* Asgard City Plaza */}
                  <circle cx="200" cy="180" r="60" fill="#1c1917" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="200" y="184" textAnchor="middle" fill="#d6d3d1" fontSize="10">
                    ŞEHİR MEYDANI
                  </text>

                  {/* The Bifröst Rainbow Bridge */}
                  <rect x="188" y="240" width="24" height="110" rx="4" fill="url(#rainbowGrad)" stroke="#38bdf8" strokeWidth="1" />
                  <defs>
                    <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="20%" stopColor="#f97316" />
                      <stop offset="40%" stopColor="#eab308" />
                      <stop offset="60%" stopColor="#22c55e" />
                      <stop offset="80%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <text x="200" y="295" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                    BİFRÖST
                  </text>

                  {/* Heimdall Observatory & Portal */}
                  <circle cx="200" cy="360" r="18" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                  <text x="200" y="364" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                    PORTAL
                  </text>
                </>
              ) : (
                <>
                  {/* Jotunheim Realm Features */}
                  <circle cx="200" cy="120" r="45" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
                  <text x="200" y="124" textAnchor="middle" fill="#e0f2fe" fontSize="11" fontWeight="bold">
                    BUZ LORDU ARENASI
                  </text>

                  <rect x="140" y="210" width="120" height="80" rx="8" fill="#164e63" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="200" y="254" textAnchor="middle" fill="#cffafe" fontSize="10">
                    BUZ KANYONLARI
                  </text>

                  {/* Return Portal */}
                  <circle cx="200" cy="330" r="16" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
                  <text x="200" y="334" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                    ASGARD'A DÖNÜŞ
                  </text>
                </>
              )}

              {/* Thor Player Marker */}
              <g transform={`translate(${mapX}, ${mapY})`}>
                <circle cx="0" cy="0" r="8" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                <circle cx="0" cy="0" r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                <text x="0" y="18" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                  THOR
                </text>
              </g>
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between w-full text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              Thor'un Konumu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
              Diyar Geçitleri & Portallar
            </span>
            <button
              onClick={onClose}
              className="py-1 px-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
            >
              Kapat (Close) [M]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
