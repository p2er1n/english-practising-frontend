import React from 'react';
import styled from '@emotion/styled';
import type { Settings as SettingsType } from '../config/settings';
import { defaultSettings } from '../config/settings';

const SettingsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const SettingsPanel = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
  min-width: 250px;
`;

const SettingItem = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

interface SettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleAutoPlayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...settings,
      autoPlayAudio: e.target.value === 'true',
    });
  };

  const handlePlayCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...settings,
      defaultPlayCount: parseInt(e.target.value),
    });
  };

  return (
    <SettingsContainer>
      <SettingsButton onClick={() => setIsOpen(!isOpen)}>⚙️</SettingsButton>
      <SettingsPanel isOpen={isOpen}>
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
        <SettingItem>
          <Label>默认播放次数</Label>
          <Select 
            value={settings.defaultPlayCount.toString()} 
            onChange={handlePlayCountChange}
          >
            <option value="1">1 次</option>
            <option value="2">2 次</option>
            <option value="3">3 次</option>
          </Select>
        </SettingItem>
      </SettingsPanel>
    </SettingsContainer>
  );
};

export default Settings; 