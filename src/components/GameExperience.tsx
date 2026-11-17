import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { soundManager } from '../audio/soundManager';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './HUD/GameHUD';
import { BottomDock } from './HUD/BottomDock';
import { MobileControls } from './HUD/MobileControls';
import { ChandaCityScene, SceneInteractionTarget } from '../game/three/ChandaCityScene';
import { VehicleModal } from './Modals/VehicleModal';
import { DestructionRepairModal } from './Modals/DestructionRepairModal';
import { BusinessModal } from './Modals/BusinessModal';
import { CustomizationModal } from './Modals/CustomizationModal';
import { MissionsModal } from './Modals/MissionsModal';
import { WorldMapModal } from './Modals/WorldMapModal';
import { SettingsModal } from './Modals/SettingsModal';
import { PoliceEncounterModal } from './Modals/PoliceEncounterModal';
import { PauseMenu } from './Modals/PauseMenu';
import { InventoryModal } from './Modals/InventoryModal';
import { EconomyModal } from './Modals/EconomyModal';
import { AchievementsModal } from './Modals/AchievementsModal';

interface GameExperienceProps {
  launchMode: 'new' | 'continue';
  onExitToSite: () => void;
}

export const GameExperience: React.FC<GameExperienceProps> = ({ launchMode, onExitToSite }) => {
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const loadGame = useGameStore((state) => state.loadGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const activeModal = useGameStore((state) => state.activeModal);
  const openModal = useGameStore((state) => state.openModal);
  const closeModal = useGameStore((state) => state.closeModal);

  const sceneRef = useRef<ChandaCityScene | null>(null);
  const [nearbyTarget, setNearbyTarget] = useState<SceneInteractionTarget | null>(null);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const initializedRef = useRef(false);
  const hasEnteredPlayingRef = useRef(false);

  // Initialize game session on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (launchMode === 'continue' && loadGame()) {
      soundManager.playCash();
    } else {
      soundManager.playRickshawBell();
      resetGame();
    }
    setGameMode('playing');
  }, [launchMode, loadGame, resetGame, setGameMode]);

  // Return smoothly to website only after gameplay has started and player chooses Main Menu
  useEffect(() => {
    if (gameMode === 'playing' || gameMode === 'paused') {
      hasEnteredPlayingRef.current = true;
    } else if (hasEnteredPlayingRef.current && gameMode === 'menu') {
      onExitToSite();
    }
  }, [gameMode, onExitToSite]);

  // Lock page scrolling strictly while active 3D gameplay is mounted
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          closeModal();
        } else if (isCommandMenuOpen) {
          setIsCommandMenuOpen(false);
        } else if (gameMode === 'playing') {
          setGameMode('paused');
        } else if (gameMode === 'paused') {
          setGameMode('playing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, isCommandMenuOpen, gameMode, closeModal, setGameMode]);

  const handleTeleport = useCallback((position: [number, number, number]) => {
    sceneRef.current?.teleportPlayer(position);
  }, []);

  const handleInteract = useCallback(() => {
    sceneRef.current?.triggerInteraction();
  }, []);

  const handleSmash = useCallback(() => {
    sceneRef.current?.triggerAttackOrSmash();
  }, []);

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-[#070a12] overflow-hidden select-none">
      <GameCanvas sceneRef={sceneRef} onNearbyTargetChange={setNearbyTarget} />

      <GameHUD
        nearbyTarget={nearbyTarget}
        isMenuOpen={isCommandMenuOpen}
        onToggleMenu={() => setIsCommandMenuOpen((v) => !v)}
        onOpenFullMap={() => {
          setIsCommandMenuOpen(false);
          openModal('map');
        }}
        onOpenEconomy={() => {
          setIsCommandMenuOpen(false);
          openModal('economy');
        }}
        onInteract={handleInteract}
        onSmash={handleSmash}
      />

      <MobileControls sceneRef={sceneRef} onSmash={handleSmash} />

      <BottomDock
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        onOpenModal={openModal}
        onPause={() => setGameMode('paused')}
      />

      {gameMode === 'paused' && !activeModal && <PauseMenu />}

      {activeModal === 'vehicle' && <VehicleModal onTeleport={handleTeleport} />}
      {activeModal === 'repair' && <DestructionRepairModal />}
      {activeModal === 'business' && <BusinessModal />}
      {activeModal === 'customization' && <CustomizationModal />}
      {activeModal === 'missions' && <MissionsModal />}
      {activeModal === 'map' && <WorldMapModal onTeleport={handleTeleport} />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'police_encounter' && <PoliceEncounterModal />}
      {activeModal === 'inventory' && <InventoryModal />}
      {activeModal === 'economy' && <EconomyModal />}
      {activeModal === 'achievements' && <AchievementsModal />}
    </div>
  );
};

export default GameExperience;
