import { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore } from './stores/gameStore';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/HUD/GameHUD';
import { BottomDock } from './components/HUD/BottomDock';
import { MobileControls } from './components/HUD/MobileControls';
import { MainMenu } from './components/MainMenu';
import { ChandaCityScene, SceneInteractionTarget } from './game/three/ChandaCityScene';

// Modals
import { NegotiationModal } from './components/Modals/NegotiationModal';
import { VehicleModal } from './components/Modals/VehicleModal';
import { DestructionRepairModal } from './components/Modals/DestructionRepairModal';
import { BusinessModal } from './components/Modals/BusinessModal';
import { CustomizationModal } from './components/Modals/CustomizationModal';
import { MissionsModal } from './components/Modals/MissionsModal';
import { WorldMapModal } from './components/Modals/WorldMapModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { PoliceEncounterModal } from './components/Modals/PoliceEncounterModal';
import { PauseMenu } from './components/Modals/PauseMenu';
import { InventoryModal } from './components/Modals/InventoryModal';
import { EconomyModal } from './components/Modals/EconomyModal';
import { AchievementsModal } from './components/Modals/AchievementsModal';
import { NPCDialogueModal } from './components/Modals/NPCDialogueModal';

export default function App() {
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const activeModal = useGameStore((state) => state.activeModal);
  const openModal = useGameStore((state) => state.openModal);
  const closeModal = useGameStore((state) => state.closeModal);

  const sceneRef = useRef<ChandaCityScene | null>(null);
  const [nearbyTarget, setNearbyTarget] = useState<SceneInteractionTarget | null>(null);

  // ESC toggles modals or Pause menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          closeModal();
        } else if (gameMode === 'playing') {
          setGameMode('paused');
        } else if (gameMode === 'paused') {
          setGameMode('playing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, gameMode, closeModal, setGameMode]);

  const handleTeleport = useCallback((position: [number, number, number]) => {
    sceneRef.current?.teleportPlayer(position);
  }, []);

  const handleInteract = useCallback(() => {
    sceneRef.current?.triggerInteraction();
  }, []);

  const handleSmash = useCallback(() => {
    sceneRef.current?.triggerAttackOrSmash();
  }, []);

  if (gameMode === 'menu') {
    return (
      <>
        <MainMenu
          onStartGame={() => setGameMode('playing')}
          onOpenSettings={() => openModal('settings')}
        />
        {activeModal === 'settings' && <SettingsModal />}
      </>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-[#070a12] overflow-hidden select-none">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        sceneRef={sceneRef}
        onNearbyTargetChange={setNearbyTarget}
      />

      {/* Modern HUD Layer */}
      <GameHUD
        nearbyTarget={nearbyTarget}
        onOpenFullMap={() => openModal('map')}
        onOpenEconomy={() => openModal('economy')}
        onInteract={handleInteract}
        onSmash={handleSmash}
      />

      {/* Mobile Touch Controls Layer */}
      <MobileControls
        sceneRef={sceneRef}
        onInteract={handleInteract}
        onSmash={handleSmash}
      />

      {/* Collapsible Bottom Dock */}
      <BottomDock
        onOpenModal={openModal}
        onPause={() => setGameMode('paused')}
      />

      {/* Pause Menu */}
      {gameMode === 'paused' && !activeModal && <PauseMenu />}

      {/* Interactive Gameplay Modals */}
      {activeModal === 'negotiation' && <NegotiationModal />}
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
      {activeModal === 'npc_dialogue' && <NPCDialogueModal />}
    </div>
  );
}
