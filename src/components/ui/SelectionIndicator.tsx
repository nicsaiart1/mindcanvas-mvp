import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  selectedCount: number;
  isVisible: boolean;
}

export default function SelectionIndicator({ selectedCount, isVisible }: Props) {
  return (
    <AnimatePresence>
      {isVisible && selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-20 bg-blue-900 bg-opacity-90 backdrop-blur-sm border border-blue-600 rounded-lg p-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-6 h-6 bg-blue-500 rounded border-2 border-white flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            >
              <span className="text-white text-xs font-bold">✓</span>
            </motion.div>
            
            <div className="text-white">
              <div className="text-sm font-medium">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-blue-200">
                Press DEL to delete, ESC to deselect
              </div>
            </div>
          </div>

          {/* Visual progress indicator */}
          <div className="mt-2 w-full bg-blue-800 rounded-full h-1">
            <motion.div
              className="bg-white h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}