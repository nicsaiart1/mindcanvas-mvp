import { motion, AnimatePresence } from 'framer-motion';
import type { AIResourceUsage } from '../../types/ai';

interface Props {
  usage: AIResourceUsage;
  isVisible: boolean;
}

export default function AIResourceMonitor({ usage, isVisible }: Props) {
  const formatCost = (cost: number) => {
    return cost < 0.01 ? '<$0.01' : `$${cost.toFixed(3)}`;
  };

  const getUsageColor = () => {
    if (usage.rateLimitReached) return 'border-red-500 bg-red-900/20';
    if (usage.requestsPerMinute > 40) return 'border-yellow-500 bg-yellow-900/20';
    if (usage.currentRequests > 0) return 'border-blue-500 bg-blue-900/20';
    return 'border-gray-600 bg-gray-900/20';
  };

  const getStatusIcon = () => {
    if (usage.rateLimitReached) return '🚫';
    if (usage.currentRequests > 0) return '⚡';
    return '🤖';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`fixed top-4 right-4 z-20 ${getUsageColor()} border rounded-lg p-3 backdrop-blur-sm shadow-lg min-w-[200px]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getStatusIcon()}</span>
              <span className="text-sm font-medium text-white">AI Usage</span>
            </div>
            {usage.currentRequests > 0 && (
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-3 bg-blue-400 rounded-full"
                    animate={{
                      scaleY: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>Active:</span>
              <span className="text-blue-400">{usage.currentRequests}</span>
            </div>
            
            <div className="flex justify-between text-gray-300">
              <span>Per minute:</span>
              <span className={usage.requestsPerMinute > 50 ? 'text-red-400' : 'text-gray-300'}>
                {usage.requestsPerMinute}/60
              </span>
            </div>
            
            <div className="flex justify-between text-gray-300">
              <span>Total:</span>
              <span>{usage.totalRequests}</span>
            </div>
            
            <div className="flex justify-between text-gray-300">
              <span>Tokens:</span>
              <span>{usage.tokensUsed.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-gray-300">
              <span>Est. cost:</span>
              <span className="text-green-400">{formatCost(usage.estimatedCost)}</span>
            </div>
          </div>

          {/* Rate Limit Warning */}
          {usage.rateLimitReached && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-red-900/50 border border-red-600 rounded text-xs text-red-300"
            >
              <div className="font-medium">Rate limit reached!</div>
              <div>
                Reset: {usage.resetTime ? new Date(usage.resetTime).toLocaleTimeString() : 'Unknown'}
              </div>
            </motion.div>
          )}

          {/* High Usage Warning */}
          {usage.requestsPerMinute > 40 && !usage.rateLimitReached && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-yellow-900/50 border border-yellow-600 rounded text-xs text-yellow-300"
            >
              <div className="font-medium">High usage detected</div>
              <div>Consider slowing down requests</div>
            </motion.div>
          )}

          {/* Progress Bar for Current Requests */}
          {usage.currentRequests > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-1">
                <motion.div
                  className="bg-blue-500 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (usage.currentRequests / 5) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {usage.currentRequests} active request{usage.currentRequests !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}