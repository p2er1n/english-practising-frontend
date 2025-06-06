import axios from 'axios';
import type { ApiResponse, AudioRecord, AudioSegment, FillBlanksExercise, FillBlanksSubmission, FillBlanksResult } from '../config/api.config';
import { apiConfig } from '../config/api.config';

// 创建axios实例
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 错误处理
const handleError = (error: any): never => {
  if (error.response) {
    throw {
      error: error.response.data.error,
      message: error.response.data.message
    };
  }
  throw {
    error: 'network_error',
    message: '网络请求失败'
  };
};

// API服务类
export class ApiService {
  // 上传音频文件
  static async uploadAudio(audioFile: File): Promise<ApiResponse<{
    audio_id: string;
    message: string;
    total_segments: number;
    processing_time: number;
  }>> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);

    try {
      const response = await apiClient.post(apiConfig.endpoints.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 获取音频列表
  static async getAudioList(): Promise<ApiResponse<AudioRecord[]>> {
    try {
      const response = await apiClient.get(apiConfig.endpoints.audioList);
      console.log('API响应:', response);
      
      // 检查响应格式是否正确
      if (!response.data) {
        console.error('API响应为空');
        throw new Error('API响应为空');
      }
      
      // 确保返回的是数组
      const audioList = response.data;
      if (!Array.isArray(audioList)) {
        console.error('API返回的不是数组:', audioList);
        throw new Error('API返回的不是数组');
      }
      
      return {
        data: audioList
      };
    } catch (error) {
      console.error('获取音频列表失败:', error);
      return handleError(error);
    }
  }

  // 获取音频信息
  static async getAudioInfo(audioId: string): Promise<ApiResponse<AudioRecord>> {
    try {
      const response = await apiClient.get(apiConfig.endpoints.audioInfo(audioId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 获取音频转写数据
  static async getAudioTranscription(audioId: string): Promise<ApiResponse<{
    audio_id: string;
    total_duration: number;
    full_text: string;
    segments: AudioSegment[];
  }>> {
    try {
      const response = await apiClient.get(apiConfig.endpoints.audioTranscription(audioId));
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 获取特定音频片段
  static async getAudioSegment(audioId: string, order: number): Promise<ApiResponse<AudioSegment>> {
    try {
      const response = await apiClient.get(apiConfig.endpoints.audioSegment(audioId), {
        params: { order }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  // 获取填空练习
  static async getFillBlanksExercise(
    audioId: string,
    order: number,
    difficulty: 'Easy' | 'Medium' | 'Hard'
  ): Promise<ApiResponse<FillBlanksExercise>> {
    try {
      console.log('请求填空练习，参数:', { audioId, order, difficulty });
      const response = await apiClient.get(apiConfig.endpoints.fillBlanks(audioId), {
        params: { order, difficulty }
      });
      console.log('填空练习API响应:', response);

      // 检查响应格式是否正确
      if (!response.data) {
        console.error('填空练习API响应为空');
        throw new Error('填空练习API响应为空');
      }

      // API直接返回练习数据，不需要再访问 .data
      const exerciseData = response.data;
      console.log('处理后的练习数据:', exerciseData);

      // 验证数据格式
      if (!exerciseData.fill_blanks_exercise_id || !exerciseData.blanked_text || !Array.isArray(exerciseData.blanks)) {
        console.error('填空练习数据格式不正确:', exerciseData);
        throw new Error('填空练习数据格式不正确');
      }

      return {
        data: exerciseData
      };
    } catch (error) {
      console.error('获取填空练习失败:', error);
      return handleError(error);
    }
  }

  // 检查填空练习答案
  static async checkFillBlanksAnswers(
    exerciseId: string,
    submission: FillBlanksSubmission
  ): Promise<ApiResponse<FillBlanksResult>> {
    try {
      const response = await apiClient.post(
        apiConfig.endpoints.checkFillBlanks(exerciseId),
        submission
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
} 