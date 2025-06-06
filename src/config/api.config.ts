// API配置文件

// 从环境变量获取API基础URL，如果没有则使用默认值
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // 音频上传与转写
    upload: '/upload',
    
    // 音频列表相关
    audioList: '/audio/list',
    
    // 音频详情相关
    audioInfo: (id: string) => `/audio/${id}/info`,
    audioTranscription: (id: string) => `/audio/${id}/transcription`,
    
    // 音频片段相关
    audioSegment: (id: string) => `/audio/${id}/segment`,
    
    // 填空练习相关
    fillBlanks: (id: string) => `/audio/${id}/segment/fill_blanks`,
    checkFillBlanks: (exerciseId: string) => `/fill_blanks/${exerciseId}/check`,
  }
};

// API响应类型定义
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 音频记录类型定义
export interface AudioRecord {
  id: string;
  filename: string;
  full_transcribed_text?: string;
  total_segments: number;
  duration_seconds: number;
  created_at: string;
}

// 音频片段类型定义
export interface AudioSegment {
  id: number;
  text: string;
  start_time: number;
  end_time: number;
  segment_audio_path?: string;
}

// 填空练习类型定义
export interface FillBlanksExercise {
  fill_blanks_exercise_id: string;
  audio_id: string;
  order: number;
  blanked_text: string;
  segment_audio_path?: string;
  start_time_seconds: number;
  end_time_seconds: number;
  blanks: Array<{ position: number }>;
}

// 填空答案提交类型
export interface FillBlanksSubmission {
  user_answers: Array<{
    position: number;
    submitted_word: string;
  }>;
}

// 填空答案检查结果类型
export interface FillBlanksResult {
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