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

const Input = styled(motion.input)<{ isError?: boolean }>`
  border: none;
  border-bottom: 2px solid ${props => props.isError ? '#ff4d4f' : '#ccc'};
  font-size: 24px;
  padding: 4px 8px;
  width: 120px;
  margin: 0 4px;
  outline: none;
  transition: border-bottom-color 0.3s;
  
  &:focus {
    border-bottom-color: ${props => props.isError ? '#ff4d4f' : '#2196f3'};
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

// 添加类型定义
interface FillBlanksResult {
  exercise_id: string;
  results: Array<{
    position: number;
    submitted_word: string;
    is_correct: boolean;
    placeholder: string;
  }>;
  score: number;
  correct_count: number;
  total_blanks: number;
}

// 添加摇晃动画的变体
const shakeAnimation = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5
    }
  }
};

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
  });
  
  const [settings, setSettings] = useState<SettingsType>(() => loadSettings())
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  // 添加错误状态数组
  const [inputErrors, setInputErrors] = useState<boolean[]>([]);
  
  // 添加练习历史记录状态
  const [exerciseHistory, setExerciseHistory] = useState<Array<{
    audioId: string;
    segment: number;
    timestamp: number;
  }>>(() => {
    const saved = localStorage.getItem('exercise-history');
    return saved ? JSON.parse(saved) : [];
  });

  // 保存练习历史到本地存储
  const saveExerciseHistory = (history: typeof exerciseHistory) => {
    // 只保留最近7天的记录
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentHistory = history.filter(item => item.timestamp > oneWeekAgo);
    localStorage.setItem('exercise-history', JSON.stringify(recentHistory));
    setExerciseHistory(recentHistory);
  };

  // 计算题目权重的函数
  const calculateExerciseWeight = (audioId: string, segment: number) => {
    const now = Date.now();
    const recentAttempts = exerciseHistory.filter(
      item => item.audioId === audioId && item.segment === segment
    );

    if (recentAttempts.length === 0) {
      return 1; // 从未做过的题目权重最高
    }

    const mostRecent = Math.max(...recentAttempts.map(item => item.timestamp));
    const hoursSinceLastAttempt = (now - mostRecent) / (1000 * 60 * 60);
    
    // 根据最近练习时间计算权重
    // 12小时内：权重较低
    // 12-24小时：权重适中
    // 24小时以上：权重较高
    if (hoursSinceLastAttempt < 12) {
      return 0.2;
    } else if (hoursSinceLastAttempt < 24) {
      return 0.5;
    } else {
      return 0.8;
    }
  };

  // 随机选择音频和片段
  const selectRandomExercise = (audioList: any[]) => {
    if (!audioList.length) return null;
    
    // 随机选择一个音频
    const randomAudioIndex = Math.floor(Math.random() * audioList.length);
    const selectedAudio = audioList[randomAudioIndex];
        // 使用音频的实际片段数量
    const totalSegments = selectedAudio.total_segments || 5; // 如果没有total_segments，默认为5
    
    // 随机选择一个片段
    const randomSegment = Math.floor(Math.random() * totalSegments) + 1;
    
    return {
      audioId: selectedAudio.id,
      segment: randomSegment
    };
  };

  // 修改 goToNextSegment 函数
  const goToNextSegment = () => {
    const nextExercise = selectRandomExercise(state.audioList);
    if (nextExercise) {
      // 记录当前练习到历史
      const newHistory = [...exerciseHistory, {
        audioId: state.audioId,
        segment: state.currentSegment,
        timestamp: Date.now()
      }];
      saveExerciseHistory(newHistory);

      // 设置下一个练习
      setState(prev => ({
        ...prev,
        audioId: nextExercise.audioId,
        currentSegment: nextExercise.segment
      }));
    }
  };

  // 修改 handleStart 函数
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

      // 随机选择第一个练习
      const firstExercise = selectRandomExercise(audioList);
      
      setState(prev => ({
        ...prev,
        audioList: audioList,
        loading: false,
        audioId: firstExercise?.audioId || audioList[0].id,
        currentSegment: firstExercise?.segment || 1,
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

  // 修改effect中的焦点设置逻辑
  useEffect(() => {
    if (state.currentExercise && !state.loading && inputRefs.current[0]) {
      // 使用setTimeout确保在DOM更新后设置焦点
      setTimeout(() => {
        const input = inputRefs.current[0];
        if (input) {
          input.focus();
          // 将光标移动到内容末尾
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [state.currentExercise, state.loading]);

  // 更新useEffect依赖
  useEffect(() => {
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

  // 修改辅助函数用于分割文本
  const generateBlankedText = (text: string): { parts: string[], blanks: number[] } => {
    const parts: string[] = [];
    const blanks: number[] = [];
    let lastIndex = 0;
    
    // 查找所有下划线位置
    const underscoreRegex = /_+/g;
    let match;
    
    while ((match = underscoreRegex.exec(text)) !== null) {
      // 添加下划线前的文本
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // 记录空的位置
      blanks.push(parts.length);
      parts.push('_____');
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加最后一部分文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return { parts, blanks };
  }

  const checkAnswer = async () => {
    if (!state.currentExercise) return;
    
    // 检查是否所有空都已填写
    const emptyAnswers = state.answers.map(answer => !answer.trim());
    if (emptyAnswers.some(isEmpty => isEmpty)) {
      setInputErrors(emptyAnswers);
      setState(prev => ({
        ...prev,
        error: '请填写所有的空'
      }));
      // 找到第一个未填写的空，并设置焦点
      const firstEmptyIndex = emptyAnswers.findIndex(isEmpty => isEmpty);
      if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
        const input = inputRefs.current[firstEmptyIndex];
        input.focus();
        // 将光标移动到内容末尾
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 使用原始blanks数组中的position值
      const userAnswers = state.answers.map((answer, index) => ({
        position: state.currentExercise!.blanks[index].position,
        submitted_word: answer.trim()
      }));

      const apiResponse = await ApiService.checkFillBlanksAnswers(
        state.currentExercise.fill_blanks_exercise_id,
        {
          user_answers: userAnswers
        }
      );
      
      console.log('完整的API响应:', apiResponse);
      const response = (typeof apiResponse.data !== 'undefined') ? apiResponse.data : apiResponse;
      console.log('最终使用的响应数据:', response);
      
      setState(prev => ({ ...prev, loading: false }));

      if ('correct_count' in response && 'total_blanks' in response && 
          response.correct_count === response.total_blanks) {
        // 答案全部正确
        setInputErrors(state.answers.map(() => false));
        setState(prev => ({ ...prev, showSuccess: true }));
        setTimeout(() => {
          setState(prev => ({ ...prev, showSuccess: false }));
          goToNextSegment();
        }, 1500);
      } else if ('results' in response) {
        // 设置错误状态 - 使用原始blanks数组的顺序处理结果
        const newErrors = state.answers.map((_, index) => {
          // 根据position找到对应的结果
          const result = response.results.find(r => 
            r.position === state.currentExercise!.blanks[index].position
          );
          return result ? !result.is_correct : false;
        });
        setInputErrors(newErrors);
        
        setState(prev => ({
          ...prev,
          error: `有答案不正确，请重试`
        }));

        // 找到第一个错误的输入框，并设置焦点
        const firstErrorIndex = newErrors.findIndex(isError => isError);
        if (firstErrorIndex !== -1 && inputRefs.current[firstErrorIndex]) {
          setTimeout(() => {
            const input = inputRefs.current[firstErrorIndex];
            if (input) {
              input.focus();
              // 将光标移动到内容末尾
              const length = input.value.length;
              input.setSelectionRange(length, length);
            }
          }, 0);
        }
      }
    } catch (error) {
      console.error('API调用错误:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '检查答案失败，请重试'
      }));
    }
  };

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }

  // 添加辅助函数用于分割文本
  const splitTextIntoTokens = (text: string): string[] => {
    // 定义所有需要分割的标点符号
    const punctuationRegex = /([^\w\s]|')/g;
    
    // 先按照空格分割
    const words = text.split(' ');
    const tokens: string[] = [];
    
    // 处理每个单词，分离所有标点符号
    words.forEach(word => {
      if (!word) return; // 跳过空字符串
      
      // 分割单词和标点符号
      const parts = word.split(punctuationRegex).filter(Boolean);
      tokens.push(...parts);
    });
    
    return tokens;
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
                  const { parts, blanks } = generateBlankedText(state.currentExercise.blanked_text);
                  
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
                          onFocus={() => {
                            // 清除当前输入框的错误状态
                            const blankIndex = blanks.indexOf(index);
                            if (inputErrors[blankIndex]) {
                              const newErrors = [...inputErrors];
                              newErrors[blankIndex] = false;
                              setInputErrors(newErrors);
                            }
                          }}
                          onKeyDown={e => handleKeyPress(e, blanks.indexOf(index))}
                          autoFocus={blanks.indexOf(index) === 0}
                          isError={inputErrors[blanks.indexOf(index)]}
                          animate={inputErrors[blanks.indexOf(index)] ? "shake" : ""}
                          variants={shakeAnimation}
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
  );
};

export default App;