export interface AIResponse {
  intentionAnalysis: string;
  suggestedTasks: Array<{
    title: string;
    description: string;
    reasoning: string;
  }>;
  progressEstimate: number;
}

export interface AITaskUpdate {
  updatedDescription: string;
  status: 'spawning' | 'executing' | 'completed';
}

export interface AIConfiguration {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens?: number;
}

export interface AIProcessingState {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  error?: string;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  isSupported: boolean;
  error?: string;
}