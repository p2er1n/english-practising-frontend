import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import type { Settings as SettingsType } from '../config/settings';
import { defaultSettings } from '../config/settings';

const SettingsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const SettingsButton = styled(motion.button)`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(4px);
`;

const SettingsPanel = styled(motion.div)`
  background: white;
  padding: 30px;
  border-radius: 16px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const SettingsTitle = styled.h2`
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover, &:focus {
    border-color: #2196f3;
  }
`;

interface SettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleAutoPlayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...settings,
      autoPlayAudio: e.target.value === 'true',
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <SettingsContainer>
        <SettingsButton
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ⚙️
        </SettingsButton>
      </SettingsContainer>

      <AnimatePresence>
        {isOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsPanel
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.1 }}
            >
              <SettingsTitle>设置</SettingsTitle>
              <SettingItem>
                <Label>自动播放音频</Label>
                <Select 
                  value={settings.autoPlayAudio.toString()} 
                  onChange={handleAutoPlayChange}
                >
                  <option value="true">是</option>
                  <option value="false">否</option>
                </Select>
              </SettingItem>
            </SettingsPanel>
          </Overlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default Settings; 