import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const SkipContainer = styled(motion.button)`
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 11px;
  color: #888;
  cursor: pointer;
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
  opacity: 0.5;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.8);
  }
`;

interface SkipButtonProps {
  onSkip: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onSkip }) => {
  return (
    <SkipContainer
      onClick={onSkip}
      whileTap={{ scale: 0.95 }}
    >
      <span>跳过此题</span>
      <span style={{ fontSize: '10px' }}>⟶</span>
    </SkipContainer>
  );
};

export default SkipButton; 