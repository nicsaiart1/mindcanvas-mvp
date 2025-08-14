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

export interface AIResourceUsage {
  currentRequests: number;
  totalRequests: number;
  requestsPerMinute: number;
  tokensUsed: number;
  estimatedCost: number;
  rateLimitReached: boolean;
  resetTime?: Date;
}

export interface AITaskExecution {
  taskId: string;
  status: 'starting' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  outputs: TaskExecutionOutput[];
  startTime: Date;
  endTime?: Date;
}

export interface TaskExecutionOutput {
  timestamp: Date;
  type: 'progress' | 'result' | 'error';
  content: string;
}

export interface AITaskExecution {
  taskId: string;
  status: 'starting' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  outputs: Array<{
    timestamp: Date;
    type: 'progress' | 'result' | 'error';
    content: string;
  }>;
  startTime: Date;
  endTime?: Date;
}