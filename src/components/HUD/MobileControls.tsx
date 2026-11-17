import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChandaCityScene } from '../../game/three/ChandaCityScene';
import { useGameStore } from '../../stores/gameStore';
import { Zap, ArrowUp, Swords } from 'lucide-react';

interface MobileControlsProps {
  sceneRef: React.MutableRefObject<ChandaCityScene | null>;
  onSmash: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ sceneRef, onSmash }) => {
  const activeModal = useGameStore((state) => state.activeModal);
  const gameMode = useGameStore((state) => state.gameMode);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const pointerIdRef = useRef<number | null>(null);
  const isSprintingRef = useRef(false);
  const normMoveRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  useEffect(() => {
    const checkTouchOrNarrow = () => {
      const hasTouch =
        window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth < 768;
      setShowControls(hasTouch || isNarrow);
    };

    checkTouchOrNarrow();
    window.addEventListener('resize', checkTouchOrNarrow);
    return () => window.removeEventListener('resize', checkTouchOrNarrow);
  }, []);

  const updateKnob = useCallback(
    (clientX: number, clientY: number) => {
      if (!joystickBaseRef.current) return;
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const maxRadius = Math.max(24, rect.width / 2);

      const clampedDist = Math.min(distance, maxRadius);
      const angle = Math.atan2(deltaY, deltaX);

      const nx = Math.cos(angle) * clampedDist;
      const ny = Math.sin(angle) * clampedDist;
      const dx = nx / maxRadius;
      const dy = ny / maxRadius;

      normMoveRef.current = { dx, dy };
      setKnobPos({ x: nx, y: ny });
      sceneRef.current?.setTouchMovement(dx, dy, isSprintingRef.current);
    },
    [sceneRef]
  );

  const resetJoystick = useCallback(() => {
    pointerIdRef.current = null;
    normMoveRef.current = { dx: 0, dy: 0 };
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    sceneRef.current?.setTouchMovement(0, 0, false);
  }, [sceneRef]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null) return;
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    resetJoystick();
  };

  useEffect(() => {
    if (activeModal || gameMode !== 'playing') {
      resetJoystick();
    }
  }, [activeModal, gameMode, resetJoystick]);

  useEffect(() => {
    return () => {
      sceneRef.current?.setTouchMovement(0, 0, false);
    };
  }, [sceneRef]);

  if (!showControls || activeModal !== null || gameMode !== 'playing') {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-between items-end px-3 sm:px-5 pb-12 sm:pb-14 [@media(max-height:480px)]:pb-9"
      style={{
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
      }}
    >
      {/* Virtual Analog Steering Joystick */}
      <div className="pointer-events-auto relative flex items-center justify-center mb-1">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className="relative w-24 h-24 sm:w-28 sm:h-28 [@media(max-height:480px)]:w-22 [@media(max-height:480px)]:h-22 rounded-full bg-[#0B101E]/85 border-2 border-amber-500/40 shadow-2xl flex items-center justify-center touch-none"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slate-600/60 pointer-events-none" />
          <div
            className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-white/80 shadow-lg flex items-center justify-center pointer-events-none ${
              isDragging ? 'scale-110' : ''
            }`}
            style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
          >
            <div className="w-3 h-3 rounded-full bg-slate-950/45" />
          </div>
        </div>
      </div>

      {/* Exact 3 Unique Tactile Action Controls: জোরে দৌড়, লাফ, লাথি */}
      <div className="pointer-events-auto relative flex flex-col items-end gap-2 mb-1">
        {/* 1. জোরে দৌড় (Sprint Toggle) */}
        <button
          type="button"
          onClick={() => {
            const next = !isSprinting;
            isSprintingRef.current = next;
            setIsSprinting(next);
            const { dx, dy } = normMoveRef.current;
            sceneRef.current?.setTouchMovement(dx, dy, next);
          }}
          className={`px-3 py-1.5 rounded-xl border-2 shadow-xl flex items-center gap-1.5 active:scale-95 transition-all ${
            isSprinting
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 border-yellow-100 shadow-amber-500/30'
              : 'bg-[#0B101E]/95 text-amber-300 border-amber-500/45 hover:border-amber-400'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isSprinting ? 'fill-slate-950' : ''}`} />
          <span className="text-[11px] font-black tracking-tight whitespace-nowrap">
            জোরে দৌড়
          </span>
        </button>

        {/* Bottom Arc Pair: লাফ + লাথি */}
        <div className="flex items-end gap-2.5">
          {/* 2. লাফ (Jump Pad) */}
          <button
            type="button"
            onClick={() => sceneRef.current?.triggerJump()}
            className="w-14 h-14 sm:w-15 sm:h-15 [@media(max-height:480px)]:w-12 [@media(max-height:480px)]:h-12 rounded-2xl rounded-tr-sm bg-gradient-to-b from-sky-500 to-indigo-700 text-white border-2 border-sky-300/80 shadow-[0_8px_20px_rgba(14,165,233,0.35)] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.6]" />
            <span className="text-[11px] font-black leading-none">লাফ</span>
          </button>

          {/* 3. লাথি (Primary Hero Lathi / Smash Strike) */}
          <button
            type="button"
            onClick={onSmash}
            className="relative w-16 h-16 sm:w-18 sm:h-18 [@media(max-height:480px)]:w-14 [@media(max-height:480px)]:h-14 rounded-2xl rounded-bl-sm bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 text-white border-2 border-amber-200 shadow-[0_10px_26px_rgba(225,29,72,0.45)] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-950/30 border border-white/25 flex items-center justify-center">
              <Swords className="w-4 h-4 text-amber-200" />
            </div>
            <span className="text-xs font-black leading-none tracking-wide">লাথি</span>
          </button>
        </div>
      </div>
    </div>
  );
};
