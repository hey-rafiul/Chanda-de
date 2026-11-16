import React, { useEffect, useRef } from 'react';
import { ChandaCityScene, SceneInteractionTarget } from '../game/three/ChandaCityScene';
import { useGameStore } from '../stores/gameStore';

interface GameCanvasProps {
  onNearbyTargetChange: (target: SceneInteractionTarget | null) => void;
  sceneRef: React.MutableRefObject<ChandaCityScene | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onNearbyTargetChange, sceneRef }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const equipped = useGameStore((state) => state.equipped);
  const graphicsQuality = useGameStore((state) => state.settings.graphicsQuality);

  useEffect(() => {
    if (!mountRef.current) return;

    const el = mountRef.current;
    const scene = new ChandaCityScene(el);
    scene.onNearbyTargetChange = onNearbyTargetChange;
    sceneRef.current = scene;

    const ro = new ResizeObserver(() => {
      scene.handleResize();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      scene.destroy();
      sceneRef.current = null;
    };
  }, [onNearbyTargetChange, sceneRef]);

  // Rebuild character when outfits change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.rebuildPlayerMesh();
    }
  }, [equipped, sceneRef]);

  // Apply renderer quality dynamically when settings change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.applyGraphicsQuality();
    }
  }, [graphicsQuality, sceneRef]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden touch-none"
      style={{ cursor: 'grab' }}
    />
  );
};
