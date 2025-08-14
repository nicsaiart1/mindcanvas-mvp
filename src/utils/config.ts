// Get stored configuration from localStorage
const getStoredApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mindcanvas_openai_api_key') || '';
  }
  return '';
};

const getStoredModel = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mindcanvas_ai_model') || 'gpt-4';
  }
  return 'gpt-4';
};

const getStoredTemperature = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mindcanvas_ai_temperature');
    return stored ? Number(stored) : 0.7;
  }
  return 0.7;
};

const getStoredMaxTokens = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mindcanvas_ai_max_tokens');
    return stored ? Number(stored) : 2000;
  }
  return 2000;
};

// Environment configuration utilities
export const config = {
  // OpenAI API settings (with localStorage fallback)
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || getStoredApiKey(),
    model: import.meta.env.VITE_AI_MODEL || getStoredModel(),
    temperature: Number(import.meta.env.VITE_AI_TEMPERATURE) || getStoredTemperature(),
    maxTokens: Number(import.meta.env.VITE_AI_MAX_TOKENS) || getStoredMaxTokens(),
  },
  
  // App settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'MindCanvas MVP',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    enableAIFallback: import.meta.env.VITE_ENABLE_AI_FALLBACK !== 'false',
  },
  
  // Development settings
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validation functions
export const validateConfig = () => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Get current config (refresh in case localStorage changed)
  const currentApiKey = import.meta.env.VITE_OPENAI_API_KEY || getStoredApiKey();
  const currentModel = import.meta.env.VITE_AI_MODEL || getStoredModel();
  const currentTemperature = Number(import.meta.env.VITE_AI_TEMPERATURE) || getStoredTemperature();
  
  // Check OpenAI API key
  if (!currentApiKey) {
    warnings.push('OpenAI API key not configured. AI features will be disabled.');
  } else if (currentApiKey === 'your_openai_api_key_here') {
    errors.push('Please replace the placeholder OpenAI API key with your actual key.');
  }
  
  // Check model configuration
  if (!['gpt-4', 'gpt-3.5-turbo'].includes(currentModel)) {
    warnings.push(`Unknown AI model: ${currentModel}. This may cause issues.`);
  }
  
  // Check temperature range
  if (currentTemperature < 0 || currentTemperature > 2) {
    warnings.push(`AI temperature should be between 0 and 2. Current: ${currentTemperature}`);
  }
  
  if (config.app.debugMode) {
    console.log('🔧 MindCanvas Configuration:', config);
    
    if (warnings.length > 0) {
      console.warn('⚠️ Configuration warnings:', warnings);
    }
    
    if (errors.length > 0) {
      console.error('❌ Configuration errors:', errors);
    }
  }
  
  return { warnings, errors, isValid: errors.length === 0 };
};

// Helper to check if AI is available
export const isAIAvailable = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || getStoredApiKey();
  return !!(
    apiKey && 
    apiKey !== 'your_openai_api_key_here'
  );
};

// Initialize configuration validation
if (config.isDevelopment) {
  validateConfig();
}