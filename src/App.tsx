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
          console.log('音频路径:', exerciseData.segment_audio_path);
          console.log('API基础URL:', apiConfig.audioFilesBaseURL);
          const audioUrl = `${apiConfig.audioFilesBaseURL}/${exerciseData.segment_audio_path}`;
          console.log('完整音频URL:', audioUrl);
          
          // 检查音频文件类型
          const fileExtension = exerciseData.segment_audio_path.split('.').pop()?.toLowerCase();
          console.log('音频文件类型:', fileExtension);
          
          const audio = new Audio(audioUrl);
          audio.onerror = (e) => {
            console.error('音频加载错误详情:', e);
          };
          
          audio.play().catch(error => {
            console.error('音频播放失败:', error);
            setState(prev => ({
              ...prev,
              error: `音频播放失败: ${error.message}`
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
    if (!state.currentExercise) return;
    
    if (e.key === 'Enter') {
      e.preventDefault(); // 防止表单提交
      
      if (e.shiftKey) {
        // Shift + Enter: 移动到上一个空
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      } else {
        // Enter: 如果是最后一个空，则检查答案；否则移动到下一个空
        if (index === state.answers.length - 1) {
          // 在最后一个空按回车，检查答案
          await checkAnswer();
        } else {
          // 不是最后一个空，移动到下一个空
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  const checkAnswer = async () => {
    if (!state.currentExercise) return;
    
    // 检查是否所有空都已填写
    if (state.answers.some(answer => !answer.trim())) {
      setState(prev => ({
        ...prev,
        error: '请填写所有的空'
      }));
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await ApiService.checkFillBlanksAnswers(
        state.currentExercise.fill_blanks_exercise_id,
        {
          user_answers: state.answers.map((answer, index) => ({
            position: state.currentExercise!.blanks[index].position,
            submitted_word: answer.trim()
          }))
        }
      );
      
      setState(prev => ({ ...prev, loading: false }));
      
      if (response.data && response.data.score === 1) {
        // 答案正确
        setState(prev => ({ ...prev, showSuccess: true }));
        setTimeout(() => {
          setState(prev => ({ ...prev, showSuccess: false }));
          goToNextSegment();
        }, 1500);
      } else {
        // 答案错误
        setState(prev => ({
          ...prev,
          error: '答案不正确，请重试'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '检查答案失败，请重试'
      }));
    }
  };

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

  // 添加辅助函数用于分割文本
  const splitTextIntoTokens = (text: string): string[] => {
    // 先按照空格分割
    const words = text.split(' ');
    const tokens: string[] = [];
    
    // 处理每个单词，分离标点符号
    words.forEach(word => {
      // 查找单词中的标点符号
      const matches = word.match(/([^.,!?]+)|([.,!?])/g);
      if (matches) {
        matches.forEach(match => tokens.push(match));
      }
    });
    
    return tokens;
  }

  // 根据位置信息生成带有挖空的文本
  const generateBlankedText = (text: string, blankPositions: number[]): { parts: string[], blanks: number[] } => {
    const tokens = splitTextIntoTokens(text);
    const parts: string[] = [];
    const blanks: number[] = [];
    let currentText = '';
    
    tokens.forEach((token, index) => {
      if (blankPositions.includes(index)) {
        if (currentText) {
          parts.push(currentText.trim());
          currentText = '';
        }
        blanks.push(parts.length);
        parts.push('_____');
      } else {
        currentText += token + ' ';
      }
    });
    
    if (currentText) {
      parts.push(currentText.trim());
    }
    
    return { parts, blanks };
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
                {(() => {
                  const blankPositions = state.currentExercise.blanks.map(b => b.position);
                  const { parts, blanks } = generateBlankedText(state.currentExercise.blanked_text, blankPositions);
                  
                  return parts.map((part, index) => (
                    <React.Fragment key={index}>
                      {blanks.includes(index) ? (
                        <Input
                          ref={el => {
                            inputRefs.current[blanks.indexOf(index)] = el
                          }}
                          value={state.answers[blanks.indexOf(index)] || ''}
                          onChange={e => {
                            const newAnswers = [...state.answers];
                            newAnswers[blanks.indexOf(index)] = e.target.value;
                            setState(prev => ({
                              ...prev,
                              answers: newAnswers
                            }));
                          }}
                          onKeyDown={e => handleKeyPress(e, blanks.indexOf(index))}
                          autoFocus={blanks.indexOf(index) === 0}
                        />
                      ) : (
                        <span>{part}</span>
                      )}
                    </React.Fragment>
                  ));
                })()}
                
                <AudioButton
                  onClick={() => {
                    if (!state.currentExercise?.segment_audio_path) return;
                    console.log('点击播放音频路径:', state.currentExercise.segment_audio_path);
                    const audioUrl = `${apiConfig.audioFilesBaseURL}/${state.currentExercise.segment_audio_path}`;
                    console.log('点击播放完整URL:', audioUrl);
                    const audio = new Audio(audioUrl);
                    audio.onerror = (e) => {
                      console.error('音频加载错误详情:', e);
                    };
                    audio.play().catch(error => {
                      console.error('音频播放失败:', error);
                      setState(prev => ({
                        ...prev,
                        error: `音频播放失败: ${error.message}`
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
