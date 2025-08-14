import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Intention } from '../../types/canvas';
import { useCanvasStore } from '../../stores/canvasStore';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { useAI } from '../../hooks/useAI';
import VoiceInput from '../ui/VoiceInput';
import TaskCard from './TaskCard';

interface Props {
  intention: Intention;
  isActive: boolean;
}

export default function IntentionCard({ intention, isActive }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const { updateIntention, setActiveIntention } = useCanvasStore();
  const { processIntention, processingState, isAIAvailable, generateMoreTasks } = useAI();

  // Memoize the onResult callback to prevent recreation on every render
  const handleVoiceResult = useCallback((finalTranscript: string, isFinal: boolean) => {
    if (isFinal && finalTranscript.trim()) {
      // First update the intention with the voice input
      updateIntention(intention.id, {
        originalVoiceInput: finalTranscript,
        title: finalTranscript,
        status: 'processing',
      });
      
      // Then trigger AI processing if available
      if (isAIAvailable) {
        processIntention(intention.id, finalTranscript);
      } else {
        // Fallback when AI is not available
        updateIntention(intention.id, {
          status: 'active',
          description: `Voice input captured: "${finalTranscript}". AI processing unavailable - add tasks manually.`,
          aiProgress: 0,
        });
      }
      
      setActiveIntention(null);
    }
  }, [intention.id, updateIntention, setActiveIntention, isAIAvailable, processIntention]);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useVoiceRecognition({
    onResult: handleVoiceResult,
  });

  // Auto-start listening when intention is created and active
  useEffect(() => {
    if (intention.status === 'listening' && isActive && isSupported) {
      startListening();
    }
  }, [intention.status, isActive, isSupported, startListening]);

  // Auto-expand when processing or active
  useEffect(() => {
    if (intention.status === 'processing' || intention.status === 'active') {
      setIsExpanded(true);
    }
  }, [intention.status]);

  const getStatusIcon = () => {
    switch (intention.status) {
      case 'listening': return '🎤';
      case 'processing': return '🤖';
      case 'active': return '🎯';
      case 'fulfilled': return '✅';
      default: return '🎯';
    }
  };

  const getStatusColor = () => {
    switch (intention.status) {
      case 'listening': return 'border-blue-400 shadow-blue-400/20';
      case 'processing': return 'border-yellow-400 shadow-yellow-400/20';
      case 'active': return 'border-green-400 shadow-green-400/20';
      case 'fulfilled': return 'border-purple-400 shadow-purple-400/20';
      default: return 'border-gray-400 shadow-gray-400/20';
    }
  };

  const getStatusText = () => {
    // Show AI processing state if currently processing
    if (processingState.isProcessing) {
      return processingState.currentStep || 'AI Processing...';
    }
    
    switch (intention.status) {
      case 'listening': return isListening ? 'Listening...' : 'Ready to listen';
      case 'processing': return 'AI Processing...';
      case 'active': return 'Active';
      case 'fulfilled': return 'Fulfilled';
      default: return 'Unknown';
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    updateIntention(intention.id, {
      position: {
        x: intention.position.x + info.offset.x,
        y: intention.position.y + info.offset.y,
      }
    });
  };

  const handleComplete = () => {
    updateIntention(intention.id, { status: 'fulfilled' });
  };

  return (
    <>
      <motion.div
        data-canvas-item
        className={`absolute canvas-card border-2 ${getStatusColor()} min-w-[400px] max-w-[500px] shadow-2xl`}
        style={{
          left: intention.position.x,
          top: intention.position.y,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.5)' : undefined
        }}
        exit={{ scale: 0, opacity: 0 }}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05, zIndex: 1000 }}
        layout
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-2xl"
              animate={{ 
                rotate: intention.status === 'processing' ? 360 : 0,
                scale: isListening ? [1, 1.2, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 2, repeat: intention.status === 'processing' ? Infinity : 0 },
                scale: { duration: 0.5, repeat: Infinity }
              }}
            >
              {getStatusIcon()}
            </motion.span>
            <div>
              <span className="text-sm text-gray-400 block">
                {getStatusText()}
              </span>
                          {(intention.status === 'processing' || processingState.isProcessing) && (
              <div className="w-24 h-1 bg-gray-700 rounded-full mt-1">
                <motion.div
                  className="h-1 bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: processingState.isProcessing 
                      ? `${processingState.progress}%` 
                      : '100%' 
                  }}
                  transition={{ 
                    duration: processingState.isProcessing ? 0.5 : 3, 
                    repeat: processingState.isProcessing ? 0 : Infinity 
                  }}
                />
              </div>
            )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {intention.tasks.length > 0 && (
              <button
                onClick={() => setShowTasks(!showTasks)}
                className="text-gray-400 hover:text-white text-xs"
              >
                {showTasks ? '👁️' : '👁️‍🗨️'}
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? '⬇️' : '⬆️'}
            </button>
          </div>
        </div>

        {/* Voice Input (only when listening) */}
        {intention.status === 'listening' && (
          <VoiceInput
            isListening={isListening}
            transcript={transcript}
            onStartListening={startListening}
            onStopListening={stopListening}
            onReset={resetTranscript}
            isSupported={isSupported}
          />
        )}

        {/* Content */}
        {isExpanded && (
          <motion.div
            className="space-y-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {intention.originalVoiceInput && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Your Intention:</p>
                <p className="text-sm text-gray-300 italic">"{intention.originalVoiceInput}"</p>
              </div>
            )}

            {intention.title && intention.title !== intention.originalVoiceInput && (
              <div>
                <p className="text-xs text-gray-500 mb-1">AI Analysis:</p>
                <p className="text-white">{intention.title}</p>
              </div>
            )}

            {intention.status === 'active' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Progress:</p>
                  <span className="text-xs text-gray-400">{intention.aiProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${intention.aiProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {intention.tasks.length} task{intention.tasks.length !== 1 ? 's' : ''} generated
                </p>
              </div>
            )}

            {/* AI Error Display */}
            {processingState.error && (
              <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 mb-3">
                <p className="text-xs text-red-300 mb-2">AI Processing Error:</p>
                <p className="text-xs text-red-200">{processingState.error}</p>
                <button
                  onClick={() => processIntention(intention.id, intention.originalVoiceInput)}
                  className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded mt-2"
                >
                  🔄 Retry AI Processing
                </button>
              </div>
            )}

            {/* AI Availability Warning */}
            {!isAIAvailable && intention.status === 'active' && (
              <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-2 mb-3">
                <p className="text-xs text-yellow-300">
                  ⚠️ AI features unavailable. Add OpenAI API key to enable automatic task generation.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {intention.tasks.length > 0 && (
                <button
                  onClick={() => setShowTasks(!showTasks)}
                  className={`canvas-button-${showTasks ? 'secondary' : 'primary'}`}
                >
                  {showTasks ? 'Hide' : 'Show'} Tasks ({intention.tasks.length})
                </button>
              )}
              
              {intention.status === 'active' && (
                <>
                  <button
                    onClick={handleComplete}
                    className="canvas-button-success"
                  >
                    ✓ Mark Complete
                  </button>
                  
                  {isAIAvailable && (
                    <button
                      onClick={() => generateMoreTasks(intention.id)}
                      className="canvas-button-primary"
                      title="Generate more AI tasks"
                    >
                      🤖+ More Tasks
                    </button>
                  )}
                </>
              )}
              
              {intention.status === 'listening' && !isListening && isSupported && (
                <button
                  onClick={startListening}
                  className="canvas-button-primary"
                >
                  🎤 Start Recording
                </button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Task Cards */}
      {showTasks && intention.tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          parentPosition={{
            x: intention.position.x + 50,
            y: intention.position.y + 250 + (index * 120),
          }}
        />
      ))}
    </>
  );
}