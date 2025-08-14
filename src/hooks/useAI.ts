import { useState, useEffect, useRef, useCallback } from 'react';
import { AIService } from '../services/aiService';
import { useCanvasStore } from '../stores/canvasStore';
import type { AIProcessingState, AIConfiguration } from '../types/ai';

// Default AI configuration
const DEFAULT_AI_CONFIG: Partial<AIConfiguration> = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
};

export function useAI() {
  const [processingState, setProcessingState] = useState<AIProcessingState>({
    isProcessing: false,
    progress: 0,
    currentStep: '',
    error: undefined,
  });
  
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const aiServiceRef = useRef<AIService | null>(null);
  
  const { updateIntention, addTask, updateTask } = useCanvasStore();

  // Initialize AI service when API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (apiKey) {
      const config: AIConfiguration = {
        ...DEFAULT_AI_CONFIG,
        apiKey,
      } as AIConfiguration;
      
      aiServiceRef.current = new AIService(config);
      
      // Test connection
      aiServiceRef.current.testConnection().then(setIsConnected);
    } else {
      console.warn('OpenAI API key not found. AI features will be disabled.');
      setIsConnected(false);
    }
  }, []);

  // Process intention with AI
  const processIntention = useCallback(async (intentionId: string, voiceInput: string, context?: string[]) => {
    if (!aiServiceRef.current) {
      console.error('AI service not initialized');
      return;
    }

    setProcessingState({
      isProcessing: true,
      progress: 0,
      currentStep: 'Analyzing your intention...',
      error: undefined,
    });

    try {
      // Update intention status to processing
      updateIntention(intentionId, { 
        status: 'processing', 
        originalVoiceInput: voiceInput 
      });

      setProcessingState(prev => ({
        ...prev,
        progress: 25,
        currentStep: 'Connecting to AI...',
      }));

      // Get AI analysis
      const aiResponse = await aiServiceRef.current.analyzeIntention(voiceInput, context);
      
      setProcessingState(prev => ({
        ...prev,
        progress: 60,
        currentStep: 'Generating tasks...',
      }));

      // Update intention with AI analysis
      updateIntention(intentionId, {
        title: aiResponse.intentionAnalysis,
        description: aiResponse.intentionAnalysis,
        status: 'active',
        aiProgress: aiResponse.progressEstimate,
      });

      setProcessingState(prev => ({
        ...prev,
        progress: 80,
        currentStep: 'Creating task cards...',
      }));

      // Create AI-generated tasks with staggered animation
      for (let i = 0; i < aiResponse.suggestedTasks.length; i++) {
        const taskData = aiResponse.suggestedTasks[i];
        
        setTimeout(() => {
          addTask(intentionId, {
            intentionId,
            title: taskData.title,
            description: taskData.description,
            status: 'spawning',
            position: { x: 50, y: i * 120 }, // Offset tasks vertically
            aiReasoning: taskData.reasoning,
            relatedAttachments: [],
          });
        }, i * 800); // Stagger task creation for visual effect
      }

      setProcessingState(prev => ({
        ...prev,
        progress: 100,
        currentStep: 'Complete!',
      }));

      // Clear processing state after completion
      setTimeout(() => {
        setProcessingState({
          isProcessing: false,
          progress: 0,
          currentStep: '',
          error: undefined,
        });
      }, 1000);

    } catch (error) {
      console.error('AI processing failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'AI processing failed';
      
      setProcessingState({
        isProcessing: false,
        progress: 0,
        currentStep: '',
        error: errorMessage,
      });

      // Revert intention status if AI fails
      updateIntention(intentionId, { 
        status: 'active',
        title: voiceInput,
        description: `I heard: "${voiceInput}". AI processing failed, but you can still work with this intention manually.`
      });
    }
  }, [updateIntention, addTask]);

  // Update a task with new context
  const updateTaskWithAI = useCallback(async (taskId: string, newContext: string) => {
    if (!aiServiceRef.current) {
      console.error('AI service not initialized');
      return;
    }

    const intention = useCanvasStore.getState().intentions.find(i => 
      i.tasks.some(t => t.id === taskId)
    );
    
    const task = intention?.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error('Task not found');
      return;
    }

    try {
      const aiUpdate = await aiServiceRef.current.processTaskUpdate(task, newContext);
      
      updateTask(taskId, {
        description: aiUpdate.updatedDescription,
        status: aiUpdate.status,
      });
    } catch (error) {
      console.error('AI task update failed:', error);
    }
  }, [updateTask]);

  // Generate additional tasks for an intention
  const generateMoreTasks = useCallback(async (intentionId: string) => {
    if (!aiServiceRef.current) {
      console.error('AI service not initialized');
      return;
    }

    const intention = useCanvasStore.getState().getIntentionById(intentionId);
    
    if (!intention) {
      console.error('Intention not found');
      return;
    }

    try {
      const suggestions = await aiServiceRef.current.generateTaskSuggestions(
        intention.title,
        intention.tasks
      );

      // Add new suggested tasks
      suggestions.forEach((taskData, index) => {
        setTimeout(() => {
          addTask(intentionId, {
            intentionId,
            title: taskData.title,
            description: taskData.description,
            status: 'spawning',
            position: { 
              x: 50, 
              y: (intention.tasks.length + index) * 120 
            },
            aiReasoning: taskData.reasoning,
            relatedAttachments: [],
          });
        }, index * 500);
      });
    } catch (error) {
      console.error('AI task generation failed:', error);
    }
  }, [addTask]);

  // Clear any processing errors
  const clearError = useCallback(() => {
    setProcessingState(prev => ({ ...prev, error: undefined }));
  }, []);

  // Retry AI processing
  const retryProcessing = useCallback((intentionId: string, voiceInput: string, context?: string[]) => {
    clearError();
    processIntention(intentionId, voiceInput, context);
  }, [processIntention, clearError]);

  return {
    // State
    processingState,
    isConnected,
    isAIAvailable: !!aiServiceRef.current && isConnected === true,
    
    // Actions
    processIntention,
    updateTaskWithAI,
    generateMoreTasks,
    clearError,
    retryProcessing,
    
    // Service instance (for advanced usage)
    aiService: aiServiceRef.current,
  };
}