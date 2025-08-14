import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvasStore';
import IntentionCard from './IntentionCard';
import CanvasToolbar from './CanvasToolbar';

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { 
    intentions, 
    createIntention, 
    canvasState,
    isCreatingIntention,
    activeIntention 
  } = useCanvasStore();

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Don't create intention if clicking on an existing card or toolbar
    const target = e.target as HTMLElement;
    if (target.closest('[data-canvas-item]') || target.closest('[data-toolbar]')) {
      return;
    }

    // Don't create if already creating an intention
    if (isCreatingIntention) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left - canvasState.panX) / canvasState.zoom;
      const y = (e.clientY - rect.top - canvasState.panY) / canvasState.zoom;
      
      createIntention({ x, y });
    }
  }, [createIntention, canvasState, isCreatingIntention]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Canvas Toolbar */}
      <CanvasToolbar />
      
      {/* Main Canvas */}
      <motion.div
        ref={canvasRef}
        className="w-full h-full bg-gradient-to-br from-canvas-dark via-canvas-blue to-canvas-forest relative cursor-crosshair"
        onClick={handleCanvasClick}
        style={{
          transform: `scale(${canvasState.zoom}) translate(${canvasState.panX}px, ${canvasState.panY}px)`,
          transformOrigin: '0 0',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 bg-dot-pattern opacity-20"
          style={{
            backgroundSize: `${20 * canvasState.zoom}px ${20 * canvasState.zoom}px`,
          }}
        />
        
        {/* Intention Cards */}
        {intentions.map((intention) => (
          <IntentionCard 
            key={intention.id} 
            intention={intention}
            isActive={activeIntention === intention.id}
          />
        ))}
        
        {/* Helper Text */}
        {intentions.length === 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-light text-white/70 mb-4">
                Welcome to MindCanvas
              </h2>
              <p className="text-lg text-white/50 mb-8">
                Click anywhere to create your first intention
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                <span>AI-powered task generation ready</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}