import React, { useState, useRef, useEffect } from 'react'
import styled from '@emotion/styled'
import { motion, AnimatePresence } from 'framer-motion'
import Settings from './components/Settings'
import WelcomePage from './components/WelcomePage'
import { loadSettings, saveSettings, type Settings as SettingsType } from './config/settings'
import type { ExerciseState } from './types/exercise'
import { ApiService } from './services/api.service'
import { apiConfig } from './config/api.config'

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

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`

const ErrorMessage = styled.div`
  color: red;
  margin: 20px;
  text-align: center;
`

const ExerciseContainer = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
`;

const App = () => {
  const [showExercise, setShowExercise] = useState(false);
  const [state, setState] = useState<ExerciseState>({
    audioId: '',
    currentSegment: 1,
    difficulty: 'Medium',
    answers: [],
    isPlaying: false,
    showSuccess: false,
    audioList: [],
    currentExercise: null,
    loading: false,
    error: null
  })
  
  const [settings, setSettings] = useState<SettingsType>(() => loadSettings())
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // 点击开始练习后加载音频列表
  const handleStart = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await ApiService.getAudioList();
      
      if (!response || !response.data) {
        setState(prev => ({
          ...prev,
          audioList: [],
          loading: false,
          error: 'API响应格式错误'
        }));
        return;
      }

      const audioList = response.data;
      
      if (audioList.length === 0) {
        setState(prev => ({
          ...prev,
          audioList: [],
          loading: false,
          error: '没有可用的音频'
        }));
        return;
      }

      // 选择第一个音频开始练习
      setState(prev => ({
        ...prev,
        audioList: audioList,
        loading: false,
        audioId: audioList[0].id,
        currentSegment: 1,
        answers: [],
        error: null
      }));
      
      setShowExercise(true);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '加载音频列表失败',
        loading: false,
        audioList: []
      }));
    }
  };

  // 加载当前练习
  useEffect(() => {
    const loadExercise = async () => {
      if (!state.audioId || !showExercise) {
        return;
      }
      
      console.log('开始加载练习:', {
        audioId: state.audioId,
        segment: state.currentSegment,
        difficulty: state.difficulty
      });
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await ApiService.getFillBlanksExercise(
          state.audioId,
          state.currentSegment,
          state.difficulty
        );
        
        if (!response || !response.data) {
          setState(prev => ({
            ...prev,
            error: '练习响应格式错误',
            loading: false,
            currentExercise: null
          }));
          return;
        }

        const exerciseData = response.data;

        if (!exerciseData.fill_blanks_exercise_id || !exerciseData.blanked_text || !Array.isArray(exerciseData.blanks)) {
          setState(prev => ({
            ...prev,
            error: '练习数据格式不完整',
            loading: false,
            currentExercise: null
          }));
          return;
        }

        setState(prev => ({
          ...prev,
          currentExercise: exerciseData,
          answers: Array(exerciseData.blanks.length).fill(''),
          loading: false,
          error: null
        }));

        // 如果设置了自动播放且有音频路径，自动播放音频
        if (settings.autoPlayAudio && exerciseData.segment_audio_path) {
          const audioUrl = `${window.location.origin}${apiConfig.audioFilesBaseURL}${exerciseData.segment_audio_path}`;
          const audio = new Audio(audioUrl);
          audio.play().catch(error => {
            console.error('音频播放失败:', error);
            setState(prev => ({
              ...prev,
              error: '音频播放失败'
            }));
          });
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: '加载练习失败',
          loading: false
        }));
      }
    };
    
    loadExercise();
  }, [state.audioId, state.currentSegment, state.difficulty, showExercise, settings.autoPlayAudio]);
  
  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (!state.currentExercise) return
    
    if (e.key === 'Enter') {
      if (e.shiftKey && index > 0) {
        // Shift + Enter: 移动到上一个空
        inputRefs.current[index - 1]?.focus()
      } else if (index < state.currentExercise.blanks.length - 1) {
        // Enter: 移动到下一个空
        inputRefs.current[index + 1]?.focus()
      } else {
        // 最后一个空的 Enter: 检查答案
        await checkAnswer()
      }
    }
  }

  const checkAnswer = async () => {
    if (!state.currentExercise) return
    
    try {
      const response = await ApiService.checkFillBlanksAnswers(
        state.currentExercise.fill_blanks_exercise_id,
        {
          user_answers: state.answers.map((answer, index) => ({
            position: state.currentExercise!.blanks[index].position,
            submitted_word: answer
          }))
        }
      )
      
      if (response.data && response.data.score === 1) {
        setState(prev => ({ ...prev, showSuccess: true }))
        setTimeout(() => {
          setState(prev => ({ ...prev, showSuccess: false }))
          goToNextSegment()
        }, 1500)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '检查答案失败'
      }))
    }
  }

  const goToNextSegment = () => {
    setState(prev => ({
      ...prev,
      currentSegment: prev.currentSegment + 1
    }))
  }

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  return (
    <AnimatePresence mode="wait">
      {!showExercise ? (
        <WelcomePage onStart={handleStart} />
      ) : (
        <ExerciseContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Settings
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />
          {state.loading && (
            <LoadingOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              加载中...
            </LoadingOverlay>
          )}
          {state.error && (
            <ErrorMessage>{state.error}</ErrorMessage>
          )}
          {state.currentExercise && (
            <>
              <SentenceContainer>
                {state.currentExercise.blanked_text.split('[___]').map((part, index) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < state.currentExercise!.blanks.length && (
                      <Input
                        ref={el => {
                          inputRefs.current[index] = el
                        }}
                        value={state.answers[index] || ''}
                        onChange={e => {
                          const newAnswers = [...state.answers]
                          newAnswers[index] = e.target.value
                          setState(prev => ({
                            ...prev,
                            answers: newAnswers
                          }))
                        }}
                        onKeyDown={e => handleKeyPress(e, index)}
                        autoFocus={index === 0}
                      />
                    )}
                  </React.Fragment>
                ))}
                
                <AudioButton
                  onClick={() => {
                    if (!state.currentExercise?.segment_audio_path) return;
                    const audioUrl = `${window.location.origin}${apiConfig.audioFilesBaseURL}${state.currentExercise.segment_audio_path}`;
                    const audio = new Audio(audioUrl);
                    audio.play().catch(error => {
                      setState(prev => ({
                        ...prev,
                        error: '音频播放失败'
                      }));
                    });
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔊
                </AudioButton>
              </SentenceContainer>
            </>
          )}
          <AnimatePresence>
            {state.showSuccess && (
              <SuccessOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                🎉
              </SuccessOverlay>
            )}
          </AnimatePresence>
        </ExerciseContainer>
      )}
    </AnimatePresence>
  )
}

export default App
