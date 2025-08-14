import { motion } from 'framer-motion';

interface Props {
  isListening: boolean;
  transcript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onReset: () => void;
  isSupported: boolean;
}

export default function VoiceInput({ 
  isListening, 
  transcript, 
  onStartListening, 
  onStopListening, 
  onReset,
  isSupported 
}: Props) {
  if (!isSupported) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-sm mb-2">
          Voice recognition is not supported in this browser
        </p>
        <p className="text-gray-500 text-xs">
          Try using Chrome, Edge, or Safari
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Microphone Visualization */}
      <div className="flex items-center justify-center">
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-colors ${
            isListening 
              ? 'bg-red-500/20 border-2 border-red-500' 
              : 'bg-blue-500/20 border-2 border-blue-500 hover:bg-blue-500/30'
          }`}
          onClick={isListening ? onStopListening : onStartListening}
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 1,
              repeat: isListening ? Infinity : 0,
            },
          }}
        >
          {isListening ? '🔴' : '🎤'}
        </motion.div>
      </div>

      {/* Audio Waves Animation */}
      {isListening && (
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-blue-400 rounded-full"
              animate={{
                height: [8, 24, 8],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-gray-400 mb-1">
            {isListening ? 'Listening...' : 'Captured:'}
          </p>
          <p className="text-sm text-white">
            {transcript}
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isListening && (
          <button
            onClick={onStartListening}
            className="canvas-button-primary"
          >
            🎤 Start Recording
          </button>
        )}
        
        {isListening && (
          <button
            onClick={onStopListening}
            className="canvas-button-secondary"
          >
            ⏹️ Stop
          </button>
        )}
        
        {transcript && (
          <button
            onClick={onReset}
            className="canvas-button-secondary"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {/* Helpful Text */}
      {!isListening && !transcript && (
        <p className="text-xs text-gray-500 text-center">
          Click the microphone to describe your intention
        </p>
      )}
    </div>
  );
}