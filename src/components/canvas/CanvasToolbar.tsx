import { motion } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvasStore';

export default function CanvasToolbar() {
  const { 
    intentions, 
    canvasState, 
    updateCanvasState, 
    resetCanvas 
  } = useCanvasStore();

  const handleZoomIn = () => {
    updateCanvasState({ zoom: Math.min(canvasState.zoom * 1.2, 3) });
  };

  const handleZoomOut = () => {
    updateCanvasState({ zoom: Math.max(canvasState.zoom / 1.2, 0.3) });
  };

  const handleResetZoom = () => {
    updateCanvasState({ zoom: 1, panX: 0, panY: 0 });
  };

  const activeIntentions = intentions.filter(i => i.status === 'active').length;
  const completedIntentions = intentions.filter(i => i.status === 'fulfilled').length;
  const totalTasks = intentions.reduce((acc, i) => acc + i.tasks.length, 0);

  return (
    <motion.div
      data-toolbar
      className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-3 shadow-2xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>{intentions.length} Intentions</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>{activeIntentions} Active</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          <span>{completedIntentions} Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
          <span>{totalTasks} Tasks</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="canvas-button-secondary"
          title="Zoom Out"
        >
          🔍➖
        </button>
        
        <span className="text-xs text-gray-400 min-w-[3rem] text-center">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        
        <button
          onClick={handleZoomIn}
          className="canvas-button-secondary"
          title="Zoom In"
        >
          🔍➕
        </button>
        
        <button
          onClick={handleResetZoom}
          className="canvas-button-secondary"
          title="Reset View"
        >
          🎯
        </button>
        
        {intentions.length > 0 && (
          <button
            onClick={resetCanvas}
            className="canvas-button-secondary ml-2"
            title="Clear Canvas"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Instructions */}
      {intentions.length === 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            💡 Click anywhere on the canvas to create an intention
          </p>
        </div>
      )}
    </motion.div>
  );
}