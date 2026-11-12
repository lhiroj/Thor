/**
 * THOR: GOD OF THUNDER - Mobile & Tablet On-Screen Controls
 * Dual-touch controls: virtual joystick on left, action clusters on right.
 */
import React, { useRef, useState } from 'react';
import { GameEngine } from '../game/engine.ts';

interface MobileControlsProps {
  engine: GameEngine | null;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ engine }) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Touch handlers for Virtual Joystick (Left Hand)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current || !engine) return;
    const touch = e.touches[0];
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const maxRadius = rect.width / 2;
    const distance = Math.min(maxRadius, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * distance;
    const clampedY = Math.sin(angle) * distance;

    setStickPos({ x: clampedX, y: clampedY });

    // Send normalized values [-1..1] to engine
    engine.virtualJoystick = {
      x: clampedX / maxRadius,
      y: clampedY / maxRadius,
    };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setStickPos({ x: 0, y: 0 });
    if (engine) {
      engine.virtualJoystick = { x: 0, y: 0 };
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 select-none md:hidden">
      {/* Left Virtual Joystick */}
      <div className="absolute bottom-24 left-6 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-28 h-28 rounded-full bg-black/40 border-2 border-amber-500/30 flex items-center justify-center touch-none backdrop-blur-none"
        >
          {/* Inner Stick Thumb */}
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 border border-white/60 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 absolute"
            style={{
              left: `calc(50% + ${stickPos.x}px)`,
              top: `calc(50% + ${stickPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right Quick Combat Touch Pad */}
      <div className="absolute bottom-24 right-4 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex gap-2">
          {/* Lightning Strike */}
          <button
            onTouchStart={() => engine?.castLightningStrike()}
            className="w-12 h-12 rounded-full bg-blue-900/80 border border-blue-400 text-cyan-200 flex items-center justify-center text-lg active:scale-90 shadow-md"
            title="Yıldırım"
          >
            🌩️
          </button>

          {/* Mjölnir Throw / Recall */}
          <button
            onTouchStart={() => {
              if (engine?.mjolnirState === 'hand') engine.throwMjolnir();
              else if (engine?.mjolnirState === 'flying') engine.recallMjolnir();
            }}
            className="w-12 h-12 rounded-full bg-cyan-900/80 border border-cyan-400 text-cyan-200 flex items-center justify-center text-lg active:scale-90 shadow-md"
            title="Mjölnir Fırlat/Çağır"
          >
            ⚡
          </button>
        </div>

        <div className="flex gap-2">
          {/* Free Flight Toggle */}
          <button
            onTouchStart={() => engine?.toggleFlight()}
            className="w-12 h-12 rounded-full bg-amber-900/80 border border-amber-400 text-amber-200 flex items-center justify-center text-lg active:scale-90 shadow-md"
            title="Uçuş Modu"
          >
            🦅
          </button>

          {/* Main Melee Attack */}
          <button
            onTouchStart={() => engine?.performMeleeAttack(false)}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black border-2 border-white/60 shadow-xl flex items-center justify-center text-2xl active:scale-90"
            title="Saldır"
          >
            🔨
          </button>
        </div>
      </div>
    </div>
  );
};
