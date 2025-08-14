import { motion } from 'framer-motion';
import type { Task, Position } from '../../types/canvas';
import { useCanvasStore } from '../../stores/canvasStore';
import { useAI } from '../../hooks/useAI';

interface Props {
  task: Task;
  parentPosition: Position;
}

export default function TaskCard({ task, parentPosition }: Props) {
  const { updateTask, selectElement, isElementSelected } = useCanvasStore();
  const { executeTask, isAIAvailable } = useAI();

  const getStatusIcon = () => {
    switch (task.status) {
      case 'spawning': return '✨';
      case 'executing': return '⚡';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const getStatusColor = () => {
    const baseColor = (() => {
      switch (task.status) {
        case 'spawning': return 'border-yellow-300 shadow-yellow-300/20';
        case 'executing': return 'border-orange-400 shadow-orange-400/20';
        case 'completed': return 'border-green-400 shadow-green-400/20';
        default: return 'border-gray-400 shadow-gray-400/20';
      }
    })();
    
    return isSelected 
      ? `${baseColor} ring-2 ring-white/50 ring-offset-2 ring-offset-transparent` 
      : baseColor;
  };

  const handleComplete = () => {
    updateTask(task.id, { status: 'completed' });
  };

  const handleExecute = () => {
    if (isAIAvailable) {
      executeTask(task.id);
    } else {
      updateTask(task.id, { status: 'executing' });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectElement('task', task.id, isMultiSelect);
  };

  const isSelected = isElementSelected('task', task.id);

  return (
    <motion.div
      data-canvas-item
      className={`absolute canvas-card border-2 ${getStatusColor()} min-w-[350px] max-w-[400px] shadow-xl cursor-pointer select-none`}
      onClick={handleClick}
      style={{
        left: parentPosition.x,
        top: parentPosition.y,
      }}
      initial={{ 
        scale: 0, 
        opacity: 0,
        x: -50,
        y: -20
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: 0,
        y: 0
      }}
      exit={{ 
        scale: 0, 
        opacity: 0,
        x: -50,
        y: -20
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={(_event, info) => {
        updateTask(task.id, {
          position: {
            x: task.position.x + info.offset.x,
            y: task.position.y + info.offset.y,
          }
        });
      }}
      whileDrag={{ scale: 1.05, zIndex: 999 }}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-xl"
            animate={{
              rotate: task.status === 'executing' ? [0, 360] : 0,
              scale: task.status === 'spawning' ? [1, 1.2, 1] : 1
            }}
            transition={{
              rotate: {
                duration: 2,
                repeat: task.status === 'executing' ? Infinity : 0,
                ease: "linear"
              },
              scale: {
                duration: 1.5,
                repeat: task.status === 'spawning' ? Infinity : 0,
              }
            }}
          >
            {getStatusIcon()}
          </motion.span>
          <span className="text-xs text-gray-400">
            {task.status === 'spawning' && 'Spawning...'}
            {task.status === 'executing' && 'In Progress'}
            {task.status === 'completed' && 'Completed'}
          </span>
        </div>
        
        <div className="text-xs text-gray-500">
          Task
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-white font-medium text-sm mb-1">
            {task.title}
          </h3>
          <p className="text-gray-300 text-xs leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Progress Bar */}
        {task.status === 'executing' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Progress:</span>
              <span className="text-gray-300">{Math.round(task.progress || 0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <motion.div
                className="h-1.5 bg-blue-500 rounded-full"
                style={{ width: `${task.progress || 0}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${task.progress || 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {task.currentStep && (
              <p className="text-xs text-blue-400 mt-1 italic">
                {task.currentStep}
              </p>
            )}
          </div>
        )}

        {/* Recent Output */}
        {task.outputs.length > 0 && task.status === 'executing' && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Latest Output:</p>
            <div className="bg-gray-800/50 p-2 rounded text-xs text-gray-300 max-h-16 overflow-y-auto">
              {task.outputs[task.outputs.length - 1].content}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        {task.aiReasoning && (
          <div>
            <p className="text-xs text-gray-500 mb-1">AI Reasoning:</p>
            <p className="text-xs text-gray-400 italic">
              {task.aiReasoning}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {task.status === 'spawning' && (
            <button
              onClick={handleExecute}
              className="canvas-button-primary"
              title={isAIAvailable ? "Execute with AI" : "Mark as executing"}
            >
              {isAIAvailable ? '🤖 AI Execute' : '▶️ Start Task'}
            </button>
          )}
          
          {task.status === 'executing' && (
            <>
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <motion.div
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <span>Executing...</span>
              </div>
              <button
                onClick={handleComplete}
                className="canvas-button-success text-xs"
              >
                ✓ Force Complete
              </button>
            </>
          )}
          
          {task.status === 'completed' && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-green-400">
                <span>✅</span>
                <span>Task completed</span>
              </div>
              {task.executionCompleted && (
                <div className="text-xs text-gray-500">
                  Completed {task.executionCompleted.toLocaleTimeString()}
                </div>
              )}
              {task.outputs.filter(o => o.type === 'result').length > 0 && (
                <div className="text-xs text-green-300">
                  {task.outputs.filter(o => o.type === 'result').length} result(s) generated
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-600 pt-1 border-t border-gray-700">
          Created {task.createdAt.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}