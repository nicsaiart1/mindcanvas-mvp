import { motion } from 'framer-motion';
import type { Task, Position } from '../../types/canvas';
import { useCanvasStore } from '../../stores/canvasStore';

interface Props {
  task: Task;
  parentPosition: Position;
}

export default function TaskCard({ task, parentPosition }: Props) {
  const { updateTask } = useCanvasStore();

  const getStatusIcon = () => {
    switch (task.status) {
      case 'spawning': return '✨';
      case 'executing': return '⚡';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'spawning': return 'border-yellow-300 shadow-yellow-300/20';
      case 'executing': return 'border-orange-400 shadow-orange-400/20';
      case 'completed': return 'border-green-400 shadow-green-400/20';
      default: return 'border-gray-400 shadow-gray-400/20';
    }
  };

  const handleComplete = () => {
    updateTask(task.id, { status: 'completed' });
  };

  const handleExecute = () => {
    updateTask(task.id, { status: 'executing' });
  };

  return (
    <motion.div
      data-canvas-item
      className={`absolute canvas-card border-2 ${getStatusColor()} min-w-[350px] max-w-[400px] shadow-xl`}
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
            >
              ▶️ Start Task
            </button>
          )}
          
          {task.status === 'executing' && (
            <button
              onClick={handleComplete}
              className="canvas-button-success"
            >
              ✓ Complete
            </button>
          )}
          
          {task.status === 'completed' && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <span>✅</span>
              <span>Task completed</span>
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