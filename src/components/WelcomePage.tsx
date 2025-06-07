import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';

const WelcomeContainer = styled(motion.div)`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  user-select: none;

  &:hover {
    .start-hint {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ContentWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  position: relative;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 900;
  color: #333333;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.5px;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: #666666;
  margin-bottom: 2rem;
  text-align: center;
  max-width: 600px;
  line-height: 1.6;
  letter-spacing: 0.3px;
`;

const StartHint = styled(motion.div)`
  font-size: 1rem;
  color: #999999;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before, &::after {
    content: '';
    width: 15px;
    height: 1px;
    background: #e0e0e0;
  }
`;

const TransitionOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TransitionCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: #ffffff;
`;

const RippleEffect = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  border: 2px solid #ffffff;
  opacity: 0.2;
`;

const BackgroundDecoration = styled(motion.div)`
  position: absolute;
  background: #f8f9fa;
  z-index: 1;
`;

const TopRightDecoration = styled(BackgroundDecoration)`
  width: 45vw;
  height: 45vh;
  top: 0;
  right: 0;
  border-bottom-left-radius: 100px;
`;

const BottomLeftDecoration = styled(BackgroundDecoration)`
  width: 35vw;
  height: 35vh;
  bottom: 0;
  left: 0;
  border-top-right-radius: 100px;
`;

const Dot = styled(motion.div)<{ size: number; top: number; left: number; delay: number }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: #f0f0f0;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  z-index: 1;
`;

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  
  const dots = [
    { size: 10, top: 20, left: 20, delay: 0.2 },
    { size: 15, top: 60, left: 85, delay: 0.3 },
    { size: 12, top: 80, left: 30, delay: 0.4 },
    { size: 8, top: 40, left: 70, delay: 0.5 },
  ];

  const handleStart = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setClickPosition({ x: clientX, y: clientY });
    setIsTransitioning(true);
    setTimeout(onStart, 1000);
  };

  const maxRadius = Math.sqrt(
    Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
  );

  return (
    <AnimatePresence>
      <WelcomeContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onClick={handleStart}
      >
        <TopRightDecoration
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        <BottomLeftDecoration
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        />
        
        {dots.map((dot, index) => (
          <Dot
            key={index}
            size={dot.size}
            top={dot.top}
            left={dot.left}
            delay={dot.delay}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: dot.delay }}
          />
        ))}
        
        <ContentWrapper
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Title
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            英语听力练习
          </Title>
          
          <Subtitle
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            专注练习 · 突破听力
          </Subtitle>

          <StartHint className="start-hint">
            点击任意位置开始
          </StartHint>
        </ContentWrapper>

        {isTransitioning && (
          <TransitionOverlay
            initial={false}
            animate={{ opacity: 1 }}
          >
            <TransitionCircle
              initial={{ width: 0, height: 0 }}
              animate={{ 
                width: maxRadius * 2,
                height: maxRadius * 2,
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                left: clickPosition.x - maxRadius,
                top: clickPosition.y - maxRadius,
              }}
            />
            <RippleEffect
              initial={{ width: 0, height: 0, opacity: 0.5 }}
              animate={{ 
                width: 100,
                height: 100,
                opacity: 0,
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut"
              }}
              style={{
                left: clickPosition.x - 50,
                top: clickPosition.y - 50,
              }}
            />
          </TransitionOverlay>
        )}
      </WelcomeContainer>
    </AnimatePresence>
  );
};

export default WelcomePage; 