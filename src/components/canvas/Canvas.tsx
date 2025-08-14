import { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAI } from '../../hooks/useAI';
import IntentionCard from './IntentionCard';
import CanvasToolbar from './CanvasToolbar';
import AIResourceMonitor from '../ui/AIResourceMonitor';
import TouchNavigationIndicator from '../ui/TouchNavigationIndicator';
import SelectionIndicator from '../ui/SelectionIndicator';
import CanvasDebugInfo from '../ui/CanvasDebugInfo';

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [, setDimensions] = useState({ width: 0, height: 0 });
  const [touchNavigation, setTouchNavigation] = useState<{ isActive: boolean; gestureType: 'pan' | 'pinch' }>({
    isActive: false,
    gestureType: 'pan'
  });
  const { 
    intentions, 
    createIntention, 
    canvasState,
    updateCanvasState,
    isCreatingIntention,
    activeIntention,
    cancelActiveIntention,
    selectedElements,
    deleteSelectedElements,
    clearSelection
  } = useCanvasStore();
  const { resourceUsage, isAIAvailable } = useAI();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to cancel active intention
      if (e.key === 'Escape' && activeIntention) {
        e.preventDefault();
        cancelActiveIntention();
        console.log('ESC pressed - cancelled active intention:', activeIntention);
        return;
      }

      // DEL to delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.length > 0) {
        e.preventDefault();
        deleteSelectedElements();
        return;
      }

      // Arrow keys for navigation (when no input is focused)
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
        const panSpeed = e.shiftKey ? 100 : 20; // Shift for faster movement
        
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            updateCanvasState({ panY: canvasState.panY + panSpeed });
            console.log('Keyboard navigation: Up');
            break;
          case 'ArrowDown':
            e.preventDefault();
            updateCanvasState({ panY: canvasState.panY - panSpeed });
            console.log('Keyboard navigation: Down');
            break;
          case 'ArrowLeft':
            e.preventDefault();
            updateCanvasState({ panX: canvasState.panX + panSpeed });
            console.log('Keyboard navigation: Left');
            break;
          case 'ArrowRight':
            e.preventDefault();
            updateCanvasState({ panX: canvasState.panX - panSpeed });
            console.log('Keyboard navigation: Right');
            break;
          case '=':
          case '+':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              updateCanvasState({ zoom: Math.min(3, canvasState.zoom * 1.1) });
              console.log('Keyboard zoom in');
            }
            break;
          case '-':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              updateCanvasState({ zoom: Math.max(0.1, canvasState.zoom * 0.9) });
              console.log('Keyboard zoom out');
            }
            break;
          case '0':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              updateCanvasState({ zoom: 1, panX: 0, panY: 0 });
              console.log('Keyboard reset view');
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIntention, cancelActiveIntention, selectedElements, deleteSelectedElements, canvasState, updateCanvasState]);

  // Handle two-finger swipe navigation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTouches: TouchList | null = null;
    let initialDistance = 0;
    let initialZoom = canvasState.zoom;
    let initialPanX = canvasState.panX;
    let initialPanY = canvasState.panY;
    let isNavigating = false;
    let gestureStartTime = 0;

    const getTouchDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touches: TouchList) => {
      if (touches.length < 2) return { x: 0, y: 0 };
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastTouches = e.touches;
        initialDistance = getTouchDistance(e.touches);
        initialZoom = canvasState.zoom;
        initialPanX = canvasState.panX;
        initialPanY = canvasState.panY;
        isNavigating = true;
        gestureStartTime = Date.now();
        setTouchNavigation({ isActive: true, gestureType: 'pan' });
        
        console.log('Two-finger gesture detected - starting navigation', {
          touchCount: e.touches.length,
          initialDistance,
          initialPan: { x: initialPanX, y: initialPanY },
          currentCanvasState: canvasState
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouches && isNavigating) {
        e.preventDefault();
        
        const currentCenter = getTouchCenter(e.touches);
        const lastCenter = getTouchCenter(lastTouches);
        const currentDistance = getTouchDistance(e.touches);
        const elapsed = Date.now() - gestureStartTime;
        
        // Calculate deltas
        const deltaX = currentCenter.x - lastCenter.x;
        const deltaY = currentCenter.y - lastCenter.y;
        const distanceChange = Math.abs(currentDistance - initialDistance);
        const panDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Determine primary gesture intention - give some time before deciding
        let currentGesture: 'pan' | 'pinch';
        if (elapsed > 100) { // Wait 100ms before determining gesture
          // If significant distance change AND minimal pan movement = pinch
          // If significant pan movement AND minimal distance change = pan
          if (distanceChange > 15 && panDistance < 10) {
            currentGesture = 'pinch';
          } else if (panDistance > 10 && distanceChange < 15) {
            currentGesture = 'pan';
          } else if (distanceChange > panDistance) {
            currentGesture = 'pinch';
          } else {
            currentGesture = 'pan';
          }
        } else {
          currentGesture = 'pan'; // Default to pan for the first 100ms
        }
        
        // Apply transformations based on gesture type
        let newZoom = canvasState.zoom;
        let newPanX = canvasState.panX;
        let newPanY = canvasState.panY;
        
        if (currentGesture === 'pinch') {
          // Only apply zoom, don't pan during pinch
          const zoomFactor = currentDistance / initialDistance;
          newZoom = Math.max(0.1, Math.min(3, initialZoom * zoomFactor));
        } else {
          // Only apply pan, don't zoom during pan
          const panSensitivity = 1.0;
          newPanX = canvasState.panX + (deltaX * panSensitivity);
          newPanY = canvasState.panY + (deltaY * panSensitivity);
        }
        
        updateCanvasState({
          zoom: newZoom,
          panX: newPanX,
          panY: newPanY,
        });
        
        setTouchNavigation({ isActive: true, gestureType: currentGesture });
        
        console.log('Two-finger gesture navigation', {
          gesture: currentGesture,
          delta: { x: deltaX, y: deltaY },
          zoom: { current: canvasState.zoom, new: newZoom },
          pan: { current: { x: canvasState.panX, y: canvasState.panY }, new: { x: newPanX, y: newPanY } },
          distances: { initial: initialDistance, current: currentDistance, change: distanceChange },
          elapsed
        });
        
        lastTouches = e.touches;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        if (isNavigating) {
          console.log('Two-finger navigation ended');
          setTouchNavigation({ isActive: false, gestureType: 'pan' });
        }
        lastTouches = null;
        isNavigating = false;
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canvasState.panX, canvasState.panY, updateCanvasState]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Don't create intention if clicking on an existing card or toolbar
    const target = e.target as HTMLElement;
    if (target.closest('[data-canvas-item]') || target.closest('[data-toolbar]')) {
      return;
    }

    // Clear selection when clicking on empty canvas (unless multi-selecting)
    if (!(e.ctrlKey || e.metaKey)) {
      clearSelection();
    }

    // Don't create if already creating an intention
    if (isCreatingIntention) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      // Since click handler is on the container (not the transformed canvas),
      // we need to account for the canvas transform: translate(panX, panY) scale(zoom)
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Reverse the transform: undo translate, then undo scale
      const x = (clickX - canvasState.panX) / canvasState.zoom;
      const y = (clickY - canvasState.panY) / canvasState.zoom;
      
      createIntention({ x, y });
    }
  }, [createIntention, canvasState, isCreatingIntention, clearSelection]);

  return (
    <div className="canvas-responsive">
      {/* Canvas Toolbar */}
      <CanvasToolbar />
      
      {/* AI Resource Monitor */}
      <AIResourceMonitor
        usage={resourceUsage}
        isVisible={isAIAvailable && (resourceUsage.currentRequests > 0 || resourceUsage.totalRequests > 0)}
      />
      
      {/* Touch Navigation Indicator */}
      <TouchNavigationIndicator
        isVisible={touchNavigation.isActive}
        gestureType={touchNavigation.gestureType}
      />
      
      {/* Selection Indicator */}
      <SelectionIndicator
        selectedCount={selectedElements.length}
        isVisible={selectedElements.length > 0}
      />
      
      {/* Debug Info */}
      <CanvasDebugInfo
        canvasState={canvasState}
        isVisible={false}
      />
      
             {/* Canvas Container with overflow clipping */}
       <div 
         className="absolute inset-0 overflow-hidden"
         ref={canvasRef}
         onClick={handleCanvasClick}
       >
         {/* Main Canvas */}
         <motion.div
           className="bg-gradient-to-br from-canvas-dark via-canvas-blue to-canvas-forest relative cursor-crosshair"
        style={{
          transform: `translate(${canvasState.panX}px, ${canvasState.panY}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0',
          // Make canvas large enough to fill viewport at minimum zoom (0.1x)
          width: '1000vw', 
          height: '1000vh',
          minWidth: '1000vw',
          minHeight: '1000vh',
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
    </div>
  );
}