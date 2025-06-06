import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const WelcomeContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f6f8fd 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
`;

const StartButton = styled(motion.button)`
  padding: 1rem 3rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 100px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const BackgroundCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
`;

const Circle1 = styled(BackgroundCircle)`
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
`;

const Circle2 = styled(BackgroundCircle)`
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
`;

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <WelcomeContainer>
        <Circle1
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
        <Circle2
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        />
        
        <Title
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          英语听力练习
        </Title>
        
        <Subtitle
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          通过互动练习提升您的英语听力水平
        </Subtitle>
        
        <StartButton
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 6px 30px rgba(37, 99, 235, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
        >
          开始练习
        </StartButton>
      </WelcomeContainer>
    </motion.div>
  );
};

export default WelcomePage; 