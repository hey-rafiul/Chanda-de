import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { SettingsModal } from './Modals/SettingsModal';

interface SettingsOverlayLazyProps {
  onClose: () => void;
}

export const SettingsOverlayLazy: React.FC<SettingsOverlayLazyProps> = ({ onClose }) => {
  const activeModal = useGameStore((state) => state.activeModal);
  const openModal = useGameStore((state) => state.openModal);
  const hasOpenedSettingsRef = useRef(false);

  useEffect(() => {
    openModal('settings');
  }, [openModal]);

  useEffect(() => {
    if (activeModal === 'settings') {
      hasOpenedSettingsRef.current = true;
    } else if (hasOpenedSettingsRef.current) {
      onClose();
    }
  }, [activeModal, onClose]);

  if (activeModal !== 'settings') return null;
  return <SettingsModal />;
};

export default SettingsOverlayLazy;
