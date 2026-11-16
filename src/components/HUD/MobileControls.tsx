import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChandaCityScene } from '../../game/three/ChandaCityScene';
import { useGameStore } from '../../stores/gameStore';
import { Footprints, Hand, Sparkles, ArrowUp } from 'lucide-react';

interface MobileControlsProps {
  sceneRef: React.MutableRefObject<ChandaCityScene | null>;
  onInteract: () => void;
  onSmash: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ sceneRef, onInteract, onSmash }) => {
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-between items-end px-3 sm:px-5 pb-12 sm:pb-16 [@media(max-height:480px)]:pb-9"
      style={{
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
      }}
    >
      {/* Virtual Analog Joystick */}
      <div className="pointer-events-auto relative flex items-center justify-center mb-1">
        <div
          ref={joystickBaseRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className="relative w-24 h-24 sm:w-28 sm:h-28 [@media(max-height:480px)]:w-22 [@media(max-height:480px)]:h-22 rounded-full bg-[#0B101E]/85 border-2 border-slate-700 shadow-2xl flex items-center justify-center touch-none"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slate-600/50 pointer-events-none" />
          <div
            className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-white/75 shadow-lg flex items-center justify-center pointer-events-none ${
              isDragging ? 'scale-110' : ''
            }`}
            style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
          >
            <div className="w-3 h-3 rounded-full bg-slate-950/40" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 sm:gap-2.5 [@media(max-height:480px)]:gap-1.5 mb-1">
        <button
          type="button"
          onClick={() => {
            const next = !isSprinting;
            isSprintingRef.current = next;
            setIsSprinting(next);
            const { dx, dy } = normMoveRef.current;
            sceneRef.current?.setTouchMovement(dx, dy, next);
          }}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border shadow-lg flex items-center justify-center transition-transform active:scale-90 ${
            isSprinting
              ? 'bg-amber-500 text-slate-950 border-white'
              : 'bg-[#0B101E]/90 text-white border-slate-700'
          }`}
          title="দৌড় / Sprint"
        >
          <Footprints className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onSmash}
            className="w-12 h-12 sm:w-13 sm:h-13 [@media(max-height:480px)]:w-11 [@media(max-height:480px)]:h-11 rounded-2xl bg-gradient-to-tr from-rose-700 to-red-500 text-white border-2 border-rose-300 shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform font-bold text-[10px]"
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>লাথি</span>
          </button>

          <button
            type="button"
            onClick={() => sceneRef.current?.triggerJump()}
            className="w-12 h-12 sm:w-13 sm:h-13 [@media(max-height:480px)]:w-11 [@media(max-height:480px)]:h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-500 text-white border-2 border-indigo-300 shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform font-bold text-[10px]"
          >
            <ArrowUp className="w-4 h-4 mb-0.5" />
            <span>লাফ</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onInteract}
          className="w-14 h-14 sm:w-15 sm:h-15 [@media(max-height:480px)]:w-12 [@media(max-height:480px)]:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 text-slate-950 border-2 border-emerald-200 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-transform font-bold text-[10px] sm:text-[11px]"
        >
          <Hand className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
          <span>কথা / কাজ</span>
        </button>
      </div>
    </div>
  );
};
