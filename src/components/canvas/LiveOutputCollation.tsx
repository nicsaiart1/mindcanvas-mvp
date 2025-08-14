import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '../../types/canvas';

interface Props {
  tasks: Task[];
  collatedOutput?: string;
  onUpdateCollatedOutput: (output: string) => void;
}

export default function LiveOutputCollation({ tasks, collatedOutput, onUpdateCollatedOutput }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedOutput, setEditedOutput] = useState(collatedOutput || '');

  // Update local state when collatedOutput changes
  useEffect(() => {
    setEditedOutput(collatedOutput || '');
  }, [collatedOutput]);

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const hasNewResults = completedTasks.some(task => 
    task.outputs.some(output => output.type === 'result')
  );

  const generateCollatedOutput = () => {
    const results = completedTasks
      .map(task => {
        const resultOutputs = task.outputs.filter(output => output.type === 'result');
        if (resultOutputs.length > 0) {
          return `**${task.title}**\n${resultOutputs.map(output => output.content).join('\n\n')}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n\n---\n\n');

    return results || 'No results yet - tasks are still in progress.';
  };

  const handleAutoGenerate = () => {
    const generated = generateCollatedOutput();
    setEditedOutput(generated);
    onUpdateCollatedOutput(generated);
  };

  const handleSave = () => {
    onUpdateCollatedOutput(editedOutput);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditedOutput(collatedOutput || '');
    setEditMode(false);
  };

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-white font-medium">Live Results Collation</h3>
          {hasNewResults && !collatedOutput && (
            <motion.span
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? '⬇️' : '⬆️'}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        {!collatedOutput && hasNewResults && (
          <motion.button
            onClick={handleAutoGenerate}
            className="canvas-button-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ Auto-Generate Summary
          </motion.button>
        )}
        
        {collatedOutput && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="canvas-button-secondary"
          >
            ✏️ Edit
          </button>
        )}
        
        {editMode && (
          <>
            <button
              onClick={handleSave}
              className="canvas-button-success"
            >
              ✓ Save
            </button>
            <button
              onClick={handleCancel}
              className="canvas-button-secondary"
            >
              ✕ Cancel
            </button>
          </>
        )}
        
        <button
          onClick={handleAutoGenerate}
          className="canvas-button-secondary"
          title="Regenerate from task results"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {editMode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <textarea
                  value={editedOutput}
                  onChange={(e) => setEditedOutput(e.target.value)}
                  className="w-full h-40 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Edit the collated output..."
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {collatedOutput ? (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                      {collatedOutput}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <span>💡</span>
                      <span>
                        {hasNewResults 
                          ? 'New task results available! Click "Auto-Generate Summary" to collate them.'
                          : 'Tasks are still running. Results will appear here when completed.'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Task Results Preview */}
            {completedTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 space-y-2"
              >
                <h4 className="text-xs font-medium text-gray-400 mb-2">
                  Individual Task Results:
                </h4>
                {completedTasks.map((task) => {
                  const resultOutputs = task.outputs.filter(output => output.type === 'result');
                  if (resultOutputs.length === 0) return null;
                  
                  return (
                    <div key={task.id} className="bg-gray-900/50 border border-gray-700 rounded p-2">
                      <div className="text-xs font-medium text-blue-400 mb-1">
                        {task.title}
                      </div>
                      {resultOutputs.map((output, index) => (
                        <div key={output.id || index} className="text-xs text-gray-300 mb-1">
                          <span className="text-gray-500">
                            {output.timestamp.toLocaleTimeString()}:
                          </span>{' '}
                          {output.content.slice(0, 100)}
                          {output.content.length > 100 && '...'}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}