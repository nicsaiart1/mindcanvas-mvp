// Environment configuration utilities
export const config = {
  // OpenAI API settings
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_AI_MODEL || 'gpt-4',
    temperature: Number(import.meta.env.VITE_AI_TEMPERATURE) || 0.7,
    maxTokens: Number(import.meta.env.VITE_AI_MAX_TOKENS) || 2000,
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
  
  // Check OpenAI API key
  if (!config.openai.apiKey) {
    warnings.push('OpenAI API key not configured. AI features will be disabled.');
  } else if (config.openai.apiKey === 'your_openai_api_key_here') {
    errors.push('Please replace the placeholder OpenAI API key with your actual key.');
  }
  
  // Check model configuration
  if (!['gpt-4', 'gpt-3.5-turbo'].includes(config.openai.model)) {
    warnings.push(`Unknown AI model: ${config.openai.model}. This may cause issues.`);
  }
  
  // Check temperature range
  if (config.openai.temperature < 0 || config.openai.temperature > 2) {
    warnings.push(`AI temperature should be between 0 and 2. Current: ${config.openai.temperature}`);
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
  return !!(
    config.openai.apiKey && 
    config.openai.apiKey !== 'your_openai_api_key_here'
  );
};

// Initialize configuration validation
if (config.isDevelopment) {
  validateConfig();
}