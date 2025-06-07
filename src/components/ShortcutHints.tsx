import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  position: fixed;
  left: 20px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.4);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 300px;
  z-index: 1000;
  color: #666;
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
  opacity: 0.5;

  &:hover {
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.8);
  }
`;

const Title = styled.div`
  font-weight: normal;
  margin-bottom: 8px;
  color: #888;
  font-size: 11px;
`;

const ShortcutList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ShortcutItem = styled.li`
  margin-bottom: 6px;
  display: flex;
  align-items: flex-start;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const KeyCombo = styled.span`
  background: rgba(240, 240, 240, 0.5);
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 6px;
  font-family: monospace;
  color: #666;
  min-width: 70px;
  display: inline-block;
  text-align: center;
  font-size: 11px;
`;

const Description = styled.span`
  flex: 1;
  font-size: 11px;
  color: #888;
`;

const ShortcutHints: React.FC = () => {
  return (
    <Container>
      <Title>快捷键提示</Title>
      <ShortcutList>
        <ShortcutItem>
          <KeyCombo>Enter</KeyCombo>
          <Description>移动到下一个输入框，最后一个输入框时提交答案</Description>
        </ShortcutItem>
        <ShortcutItem>
          <KeyCombo>Shift + Enter</KeyCombo>
          <Description>移动到上一个输入框</Description>
        </ShortcutItem>
        <ShortcutItem>
          <KeyCombo>Ctrl + Space</KeyCombo>
          <Description>播放当前音频</Description>
        </ShortcutItem>
      </ShortcutList>
    </Container>
  );
};

export default ShortcutHints; 