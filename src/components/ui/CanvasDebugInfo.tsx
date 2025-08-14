import { motion, AnimatePresence } from 'framer-motion';
import type { CanvasState } from '../../types/canvas';

interface Props {
  canvasState: CanvasState;
  isVisible: boolean;
}

export default function CanvasDebugInfo({ canvasState, isVisible }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 bg-black bg-opacity-75 text-white text-xs p-2 rounded font-mono"
        >
          <div>Zoom: {canvasState.zoom.toFixed(2)}x</div>
          <div>Pan: ({canvasState.panX.toFixed(0)}, {canvasState.panY.toFixed(0)})</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}