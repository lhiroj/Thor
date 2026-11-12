/**
 * THOR: GOD OF THUNDER - Pause & Settings Modal
 */
import React, { useState } from 'react';
import { GameSettings } from '../game/types.ts';
import { Volume2, VolumeX, Eye, Shield, Save, RotateCcw, X, Swords } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onSave: () => void;
  onLoad: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  saveToast: string | null;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onSave,
  onLoad,
  onRestart,
  onExitToTitle,
  settings,
  onUpdateSettings,
  saveToast,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'controls' | 'settings'>('menu');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 select-none text-white">
      <div className="w-full max-w-lg bg-stone-950 border-2 border-amber-500/60 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h2 className="text-xl font-black tracking-wider uppercase text-amber-300 font-serif">
              {activeTab === 'menu' && 'Oyun Duraklatıldı (Paused)'}
              {activeTab === 'controls' && 'Kontroller Rehberi (Controls)'}
              {activeTab === 'settings' && 'Ayarlar (Settings)'}
            </h2>
          </div>
          <button
            onClick={onResume}
            className="p-1 rounded text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-black/40 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'menu' ? 'text-amber-400 border-b-2 border-amber-500 bg-stone-900/40' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Menü
          </button>
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'controls' ? 'text-amber-400 border-b-2 border-amber-500 bg-stone-900/40' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Kontroller
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'settings' ? 'text-amber-400 border-b-2 border-amber-500 bg-stone-900/40' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Ayarlar
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {saveToast && (
            <div className="mb-4 py-2 px-3 bg-amber-500/20 border border-amber-500/50 rounded text-amber-300 text-xs font-bold text-center">
              {saveToast}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={onResume}
                className="w-full py-3 px-4 rounded bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold uppercase tracking-wider text-sm transition-all"
              >
                Oyuna Devam Et (Resume)
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSave}
                  className="py-2.5 px-4 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4 text-cyan-400" />
                  <span>Kaydet (Save)</span>
                </button>

                <button
                  onClick={onLoad}
                  className="py-2.5 px-4 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Yükle (Load)</span>
                </button>
              </div>

              <button
                onClick={onRestart}
                className="w-full py-2.5 px-4 rounded bg-stone-900/60 hover:bg-red-950/40 border border-stone-800 hover:border-red-600/50 text-stone-300 hover:text-red-300 font-semibold text-xs uppercase transition-colors"
              >
                Yeniden Başlat (Restart Realm)
              </button>

              <button
                onClick={onExitToTitle}
                className="w-full py-2.5 px-4 rounded bg-stone-900/60 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 font-semibold text-xs uppercase transition-colors"
              >
                Ana Menüye Dön (Exit to Title)
              </button>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-3 max-h-72 overflow-y-auto text-xs text-stone-300 pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-amber-400 block mb-0.5">WASD / Ok Tuşları</span>
                  <span>Yürüme, Koşma ve Uçuş Yönü</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-amber-400 block mb-0.5">Space (Boşluk)</span>
                  <span>Zıplama / Çift Zıplama / Serbest Uçuş</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-amber-400 block mb-0.5">Shift</span>
                  <span>Hızlı Koşma / Süpersonik Uçuş Hızı</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-amber-400 block mb-0.5">Sol Tık (L-Click)</span>
                  <span>Normal Çekiç Kombo Saldırısı</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-cyan-400 block mb-0.5">Q Tuşu</span>
                  <span>Mjölnir Fırlat (Çekiç düşmanlara uçar)</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-cyan-400 block mb-0.5">E Tuşu</span>
                  <span>Mjölnir Geri Çağır (Ele döner)</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-blue-400 block mb-0.5">F Tuşu</span>
                  <span>Yıldırım Düşür (Lightning Strike)</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-blue-400 block mb-0.5">R Tuşu</span>
                  <span>Thunder Wave (Şok Dalgası)</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-amber-300 block mb-0.5">G Tuşu</span>
                  <span>Tanrı Modu (God Mode - Süper Güç)</span>
                </div>
                <div className="p-2 rounded bg-stone-900/80 border border-stone-800">
                  <span className="font-bold text-stone-300 block mb-0.5">C Tuşu / M Tuşu</span>
                  <span>Kamera Açısı (1./3. Şahıs) / Harita</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200">Ses Efektleri & Müzik</span>
                <button
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className="px-3 py-1.5 rounded bg-stone-900 border border-stone-700 text-amber-300 flex items-center gap-1.5 font-bold"
                >
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
                  <span>{settings.soundEnabled ? 'Açık' : 'Kapalı'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold text-stone-200">
                  <span>Kamera Hassasiyeti</span>
                  <span className="font-mono text-amber-400">{settings.cameraSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={settings.cameraSensitivity}
                  onChange={(e) => onUpdateSettings({ cameraSensitivity: parseFloat(e.target.value) })}
                  className="accent-amber-500 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold text-stone-200">
                  <span>Grafik Kalitesi</span>
                  <span className="font-mono uppercase text-cyan-400">{settings.graphicsQuality}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => onUpdateSettings({ graphicsQuality: q })}
                      className={`py-1.5 rounded uppercase font-bold text-[10px] border transition-colors ${
                        settings.graphicsQuality === q
                          ? 'bg-amber-500 text-stone-950 border-amber-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
