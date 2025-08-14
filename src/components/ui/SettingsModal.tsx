import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load current settings
  useEffect(() => {
    if (isOpen) {
      const currentApiKey = localStorage.getItem('mindcanvas_openai_api_key') || 
                           import.meta.env.VITE_OPENAI_API_KEY || '';
      const currentModel = localStorage.getItem('mindcanvas_ai_model') || 'gpt-4';
      const currentTemp = localStorage.getItem('mindcanvas_ai_temperature');
      const currentTokens = localStorage.getItem('mindcanvas_ai_max_tokens');

      setApiKey(currentApiKey);
      setModel(currentModel);
      setTemperature(currentTemp ? Number(currentTemp) : 0.7);
      setMaxTokens(currentTokens ? Number(currentTokens) : 2000);
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save to localStorage
    if (apiKey) {
      localStorage.setItem('mindcanvas_openai_api_key', apiKey);
    }
    localStorage.setItem('mindcanvas_ai_model', model);
    localStorage.setItem('mindcanvas_ai_temperature', temperature.toString());
    localStorage.setItem('mindcanvas_ai_max_tokens', maxTokens.toString());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    setApiKey('');
    setModel('gpt-4');
    setTemperature(0.7);
    setMaxTokens(2000);
    
    // Clear from localStorage
    localStorage.removeItem('mindcanvas_openai_api_key');
    localStorage.removeItem('mindcanvas_ai_model');
    localStorage.removeItem('mindcanvas_ai_temperature');
    localStorage.removeItem('mindcanvas_ai_max_tokens');
  };

  const isConfigValid = apiKey && apiKey !== 'your_openai_api_key_here';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">AI Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              {!isConfigValid && apiKey && (
                <p className="text-xs text-red-400 mt-1">
                  Please enter a valid OpenAI API key
                </p>
              )}
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4">GPT-4 (Recommended)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, cheaper)</option>
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Creativity Level: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative (0)</span>
                <span>Balanced (1)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Response Length: {maxTokens} tokens
              </label>
              <input
                type="range"
                min="500"
                max="4000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Short (500)</span>
                <span>Medium (2000)</span>
                <span>Long (4000)</span>
              </div>
            </div>
          </div>

          {/* Status */}
          {isConfigValid && (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✅</span>
                <span>AI features are configured and ready</span>
              </div>
            </div>
          )}

          {!isConfigValid && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
              <div className="text-yellow-400 text-sm">
                <p className="font-medium mb-1">⚠️ AI features unavailable</p>
                <p>Please add your OpenAI API key to enable AI task generation.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saved ? '✓ Saved!' : 'Save Settings'}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400">
              💡 Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                OpenAI Platform
              </a>
              . Your key is stored locally and never sent to our servers.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}