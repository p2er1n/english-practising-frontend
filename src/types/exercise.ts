// 练习相关的类型定义
export interface Exercise {
  audioId: string;
  currentSegment: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  answers: string[];
  isPlaying: boolean;
  showSuccess: boolean;
}

export interface ExerciseState extends Exercise {
  audioList: AudioRecord[];
  currentExercise: FillBlanksExercise | null;
  loading: boolean;
  error: string | null;
}

// 从api.config.ts导入的类型
import type { AudioRecord, FillBlanksExercise } from '../config/api.config'; 