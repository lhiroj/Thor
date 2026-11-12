/**
 * THOR: GOD OF THUNDER - Main Application
 */
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/engine.ts';
import { GameState, PlayerStats, Quest, RealmId, GameSettings } from './game/types.ts';
import { INITIAL_PLAYER_STATS, INITIAL_QUESTS, DEFAULT_SETTINGS } from './game/rules.ts';
import { sound } from './game/audio.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { DialogueModal } from './components/DialogueModal.tsx';
import { FullMapModal } from './components/FullMapModal.tsx';
import { MobileControls } from './components/MobileControls.tsx';
import { VictoryGameOverModal } from './components/VictoryGameOverModal.tsx';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI States
  const [gameState, setGameState] = useState<GameState>('title');
  const [stats, setStats] = useState<PlayerStats>({ ...INITIAL_PLAYER_STATS });
  const [quests, setQuests] = useState<Quest[]>(JSON.parse(JSON.stringify(INITIAL_QUESTS)));
  const [activeQuestId, setActiveQuestId] = useState<string>('quest_1');
  const [currentRealm, setCurrentRealm] = useState<RealmId>('asgard');
  const [mjolnirState, setMjolnirState] = useState<'hand' | 'flying' | 'recalling'>('hand');
  const [dialogueSpeaker, setDialogueSpeaker] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [settings, setSettings] = useState<GameSettings>({ ...DEFAULT_SETTINGS });
  const [playerCoords, setPlayerCoords] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 10 });

  // 1. Mount Game Engine once
  useEffect(() => {
    if (!mountRef.current) return;
    const engine = new GameEngine(mountRef.current);
    engineRef.current = engine;

    // Callbacks from Engine
    engine.onDialogueOpen = (speaker: string) => {
      setDialogueSpeaker(speaker);
    };

    engine.onQuestCompleted = (q: Quest) => {
      setQuests([...engine.quests]);
      setActiveQuestId(engine.activeQuestId);
    };

    engine.onRealmChange = (realm: RealmId) => {
      setCurrentRealm(realm);
    };

    engine.onStatsChanged = (newStats: PlayerStats) => {
      setStats({ ...newStats });
    };

    // Polling player state periodically for HUD coordinates and Mjölnir state
    const hudInterval = setInterval(() => {
      if (engine && !engine.isPaused) {
        setMjolnirState(engine.mjolnirState);
        setPlayerCoords({
          x: Math.round(engine.thor.group.position.x),
          y: Math.round(engine.thor.group.position.y),
          z: Math.round(engine.thor.group.position.z),
        });

        if (engine.isGameOver) {
          setGameState('gameover');
        } else if (engine.isVictory) {
          setGameState('victory');
        }
      }
    }, 150);

    // Check ?autostart=1 query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      setGameState('playing');
      sound.init();
      sound.startMusic();
    }

    return () => {
      clearInterval(hudInterval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // 2. Synchronize gameState to document.body.dataset.state for Ultra-mode compliance
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Keyboard shortcuts (M for map, Esc/P for pause)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        if (e.code === 'KeyM') {
          setIsMapOpen((prev) => !prev);
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
          handlePause();
        }
      } else if (gameState === 'paused') {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState]);

  // Handlers
  const handleStartGame = () => {
    sound.init();
    sound.startMusic();
    sound.playLightningStrike();
    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.isPaused = false;
    }
  };

  const handleContinueGame = () => {
    sound.init();
    sound.startMusic();
    if (engineRef.current) {
      engineRef.current.loadGame();
      engineRef.current.isPaused = false;
    }
    setGameState('playing');
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.isPaused = true;
    }
    setGameState('paused');
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.isPaused = false;
    }
    setGameState('playing');
    sound.resume();
  };

  const handleSave = () => {
    if (engineRef.current) {
      const ok = engineRef.current.saveGame();
      setSaveToast(ok ? 'Oyun Başarıyla Kaydedildi! (Game Saved)' : 'Kayıt Hatası Oluştu!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleLoad = () => {
    if (engineRef.current) {
      const ok = engineRef.current.loadGame();
      setSaveToast(ok ? 'Kayıtlı Oyun Yüklendi! (Game Loaded)' : 'Kayıt Bulunamadı!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
    setGameState('playing');
  };

  const handleExitToTitle = () => {
    if (engineRef.current) {
      engineRef.current.isPaused = true;
    }
    setGameState('title');
  };

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.setMuted(!nextState);
  };

  const handleCastAbility = (action: string) => {
    if (!engineRef.current) return;
    switch (action) {
      case 'light_attack':
        engineRef.current.performMeleeAttack(false);
        break;
      case 'heavy_attack':
        engineRef.current.performMeleeAttack(true);
        break;
      case 'throw':
        engineRef.current.throwMjolnir();
        break;
      case 'recall':
        engineRef.current.recallMjolnir();
        break;
      case 'flight':
        engineRef.current.toggleFlight();
        break;
      case 'lightning_strike':
        engineRef.current.castLightningStrike();
        break;
      case 'thunder_wave':
        engineRef.current.castThunderWave();
        break;
      case 'god_mode':
        engineRef.current.activateGodMode();
        break;
    }
  };

  const activeQuest = quests.find((q) => q.id === activeQuestId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-crosshair" />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onContinueGame={handleContinueGame}
          onOpenControls={() => setIsControlsModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* In-Game HUD (Visible during gameplay and paused) */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <GameHUD
            stats={stats}
            activeQuest={activeQuest}
            currentRealm={currentRealm}
            mjolnirState={mjolnirState}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onOpenMap={() => setIsMapOpen(true)}
            onPause={handlePause}
            onCastAbility={handleCastAbility}
            floatingTexts={engineRef.current?.particles.floatingTexts || []}
          />
          <MobileControls engine={engineRef.current} />
        </>
      )}

      {/* Pause & Settings Modal */}
      <PauseModal
        isOpen={gameState === 'paused' || isControlsModalOpen || isSettingsModalOpen}
        onResume={() => {
          setIsControlsModalOpen(false);
          setIsSettingsModalOpen(false);
          if (gameState === 'paused') handleResume();
        }}
        onSave={handleSave}
        onLoad={handleLoad}
        onRestart={handleRestart}
        onExitToTitle={handleExitToTitle}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          const updated = { ...settings, ...newSettings };
          setSettings(updated);
          if (engineRef.current) engineRef.current.settings = updated;
        }}
        saveToast={saveToast}
      />

      {/* NPC Interactive Dialogue Modal */}
      <DialogueModal
        speaker={dialogueSpeaker || 'Odin'}
        isOpen={!!dialogueSpeaker}
        onClose={() => setDialogueSpeaker(null)}
      />

      {/* Realm World Map Modal */}
      <FullMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        currentRealm={currentRealm}
        playerPos={playerCoords}
      />

      {/* Victory / Defeat Modal */}
      <VictoryGameOverModal
        isVictory={gameState === 'victory'}
        isGameOver={gameState === 'gameover'}
        stats={stats}
        onRestart={handleRestart}
        onExitToTitle={handleExitToTitle}
      />
    </div>
  );
}
