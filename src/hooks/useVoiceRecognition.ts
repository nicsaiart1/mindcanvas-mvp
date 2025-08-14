import { useState, useEffect, useRef, useCallback } from 'react';
import type { VoiceRecognitionState } from '../types/ai';

export interface UseVoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const {
    language = 'en-US',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onError,
  } = options;

  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: '',
    confidence: 0,
    isSupported: false,
    error: undefined,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStartingRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: true }));
      
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      // Event handlers
      recognition.onstart = () => {
        isStartingRef.current = false;
        setState(prev => ({ 
          ...prev, 
          isListening: true, 
          error: undefined,
          transcript: '',
          confidence: 0 
        }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const result = event.results[current];
        
        if (result) {
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          const isFinal = result.isFinal;
          
          setState(prev => ({
            ...prev,
            transcript,
            confidence,
          }));
          
          if (onResult) {
            onResult(transcript, isFinal);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false,
        }));
        
        if (onError) {
          onError(errorMessage);
        }
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: 'Speech recognition not supported in this browser'
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, maxAlternatives, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported || isStartingRef.current) {
      return;
    }

    try {
      isStartingRef.current = true;
      setState(prev => ({ ...prev, error: undefined }));
      recognitionRef.current.start();
    } catch (error) {
      isStartingRef.current = false;
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recognition';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [state.isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        transcript: '', 
        confidence: 0 
      }));
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      confidence: 0, 
      error: undefined 
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  };
}