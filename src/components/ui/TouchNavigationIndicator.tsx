import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isVisible: boolean;
  gestureType: 'pan' | 'pinch';
}

export default function TouchNavigationIndicator({ isVisible, gestureType }: Props) {
  const getGestureIcon = () => {
    switch (gestureType) {
      case 'pan': return '👋';
      case 'pinch': return '🤏';
      default: return '✋';
    }
  };

  const getGestureText = () => {
    switch (gestureType) {
      case 'pan': return 'Panning Canvas';
      case 'pinch': return 'Zooming Canvas';
      default: return 'Touch Navigation';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-gray-600 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-white">
              <motion.span
                className="text-lg"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                }}
              >
                {getGestureIcon()}
              </motion.span>
              <span className="text-sm font-medium">{getGestureText()}</span>
            </div>
            
            {/* Gesture visualization */}
            <div className="flex items-center justify-center mt-1">
              {gestureType === 'pan' && (
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-blue-400 rounded-full"
                      animate={{
                        opacity: [0, 1, 0],
                        x: [-4, 4, -4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}
              
              {gestureType === 'pinch' && (
                <motion.div
                  className="relative w-8 h-8"
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  <div className="absolute inset-0 border-2 border-blue-400 rounded-full opacity-50" />
                  <div className="absolute inset-1 border border-blue-300 rounded-full opacity-75" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}