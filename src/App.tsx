import React, { useState, useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'
import Settings from './components/Settings'
import { loadSettings, saveSettings, type Settings as SettingsType } from './config/settings'
import { questions, type Question } from './data/questions'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
`

const SentenceContainer = styled.div`
  font-size: 24px;
  line-height: 1.5;
  margin: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`

const AudioButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`

const Input = styled.input`
  border: none;
  border-bottom: 2px solid #ccc;
  font-size: 24px;
  padding: 4px 8px;
  width: 120px;
  margin: 0 4px;
  outline: none;
  
  &:focus {
    border-bottom-color: #2196f3;
  }
`

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [settings, setSettings] = useState<SettingsType>(() => loadSettings())
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const currentQuestion = questions[currentQuestionIndex]

  // 模拟音频播放
  const [playAudio] = useSound('/mock-audio.mp3', {
    // 实际项目中，这里会是真实的音频文件
    onend: () => {
      setIsPlaying(false)
    }
  })
  
  // 正确答案音效
  const [playSuccess] = useSound('/success.mp3', {
    // 实际项目中，这里会是真实的音效文件
    onend: () => {
      setTimeout(() => {
        setShowSuccess(false)
        goToNextQuestion()
      }, 500)
    }
  })

  useEffect(() => {
    // 初始化答案数组
    setAnswers(Array(currentQuestion.blanks.length).fill(''))
    setCurrentBlankIndex(0)
  }, [currentQuestion])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      if (e.shiftKey && index > 0) {
        // Shift + Enter: 移动到上一个空
        inputRefs.current[index - 1]?.focus()
        setCurrentBlankIndex(index - 1)
      } else if (index < currentQuestion.blanks.length - 1) {
        // Enter: 移动到下一个空
        inputRefs.current[index + 1]?.focus()
        setCurrentBlankIndex(index + 1)
      } else {
        // 最后一个空的 Enter: 检查答案
        checkAnswer()
      }
    }
  }

  const checkAnswer = () => {
    const isCorrect = answers.every((answer, index) => 
      answer.toLowerCase().trim() === currentQuestion.blanks[index].toLowerCase()
    )
    
    if (isCorrect) {
      setShowSuccess(true)
      playSuccess()
    }
  }

  const goToNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % questions.length
    setCurrentQuestionIndex(nextIndex)
  }

  const toggleAudio = () => {
    if (!isPlaying) {
      setIsPlaying(true)
      playAudio()
    }
  }

  useEffect(() => {
    // 根据设置自动播放音频
    if (settings.autoPlayAudio) {
      let playCount = 0;
      const playInterval = setInterval(() => {
        if (playCount < settings.defaultPlayCount && !isPlaying) {
          toggleAudio();
          playCount++;
        } else {
          clearInterval(playInterval);
        }
      }, 2500); // 假设每个音频长度为 2 秒，加 0.5 秒间隔
      
      return () => clearInterval(playInterval);
    }
  }, [currentQuestion, settings]);

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <Container>
      <Settings settings={settings} onSettingsChange={handleSettingsChange} />
      <SentenceContainer>
        {currentQuestion.text.split('_').map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < currentQuestion.blanks.length && (
              <Input
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                value={answers[index]}
                onChange={e => {
                  const newAnswers = [...answers]
                  newAnswers[index] = e.target.value
                  setAnswers(newAnswers)
                }}
                onKeyDown={e => handleKeyPress(e, index)}
                onFocus={() => setCurrentBlankIndex(index)}
                autoFocus={index === 0}
              />
            )}
          </React.Fragment>
        ))}
        <AudioButton
          onClick={toggleAudio}
          disabled={isPlaying}
          animate={isPlaying ? { scale: 1.1 } : { scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🔊
        </AudioButton>
      </SentenceContainer>
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ✨ 正确！ ✨
          </SuccessOverlay>
        )}
      </AnimatePresence>
    </Container>
  )
}

export default App
