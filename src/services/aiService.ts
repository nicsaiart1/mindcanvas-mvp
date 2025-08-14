import type { AIResponse, AITaskUpdate, AIConfiguration } from '../types/ai';
import type { Task } from '../types/canvas';

export class AIService {
  private config: AIConfiguration;
  
  constructor(config: AIConfiguration) {
    this.config = {
      maxTokens: 2000,
      ...config,
      model: config.model || 'gpt-4',
      temperature: config.temperature !== undefined ? config.temperature : 0.7,
    };
  }

  async analyzeIntention(voiceInput: string, context?: string[]): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that helps users fulfill their intentions by breaking them down into actionable tasks.
              
              Analyze the user's spoken intention and:
              1. Provide a clear interpretation of what they want to achieve
              2. Generate 3-5 specific, actionable tasks that would help fulfill this intention
              3. Estimate overall progress (0-100) that can be made immediately
              4. For each task, provide reasoning for why it's important
              
              Return your response as valid JSON in this exact format:
              {
                "intentionAnalysis": "Clear interpretation of the user's goal",
                "suggestedTasks": [
                  {
                    "title": "Task title (max 50 characters)",
                    "description": "Detailed task description (max 200 characters)", 
                    "reasoning": "Why this task is important for the intention (max 150 characters)"
                  }
                ],
                "progressEstimate": 25
              }
              
              Keep descriptions concise and actionable. Focus on immediate next steps the user can take.`
            },
            {
              role: 'user',
              content: `User's intention: "${voiceInput}"${context ? `\nAdditional context: ${context.join(', ')}` : ''}`
            }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      // Parse the JSON response
      const aiResponse: AIResponse = JSON.parse(content);
      
      // Validate the response structure
      if (!aiResponse.intentionAnalysis || !Array.isArray(aiResponse.suggestedTasks)) {
        throw new Error('Invalid AI response format');
      }

      return aiResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Return a fallback response if AI fails
      return {
        intentionAnalysis: `I heard: "${voiceInput}". Let me help you break this down into actionable steps.`,
        suggestedTasks: [
          {
            title: 'Research and Planning',
            description: 'Gather information and create a plan for your intention',
            reasoning: 'Good planning is essential for successful execution'
          },
          {
            title: 'First Action Step',
            description: 'Take the first concrete action towards your goal',
            reasoning: 'Starting is often the hardest part'
          },
          {
            title: 'Review and Adjust',
            description: 'Evaluate progress and make necessary adjustments',
            reasoning: 'Regular review ensures you stay on track'
          }
        ],
        progressEstimate: 10
      };
    }
  }

  async processTaskUpdate(task: Task, newContext: string): Promise<AITaskUpdate> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `You are helping update a task based on new context or information.
              
              Analyze the current task and new context, then provide:
              1. An updated task description that incorporates the new information
              2. An appropriate status for the task: "spawning", "executing", or "completed"
              
              Return your response as valid JSON:
              {
                "updatedDescription": "Updated task description",
                "status": "executing"
              }`
            },
            {
              role: 'user',
              content: `Current task: "${task.title}" - ${task.description}\nCurrent status: ${task.status}\nNew context: ${newContext}`
            }
          ],
          temperature: this.config.temperature,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('AI Task Update Error:', error);
      
      // Return a fallback response
      return {
        updatedDescription: `${task.description} (Updated with: ${newContext})`,
        status: task.status === 'spawning' ? 'executing' : task.status
      };
    }
  }

  async generateTaskSuggestions(intentionTitle: string, existingTasks: Task[]): Promise<Array<{title: string; description: string; reasoning: string}>> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `Generate additional helpful tasks for an intention, avoiding duplication with existing tasks.
              
              Return 2-3 new tasks as valid JSON:
              {
                "newTasks": [
                  {
                    "title": "Task title",
                    "description": "Task description",
                    "reasoning": "Why this task helps"
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: `Intention: ${intentionTitle}\nExisting tasks: ${existingTasks.map(t => t.title).join(', ')}`
            }
          ],
          temperature: this.config.temperature,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        return [];
      }

      const result = JSON.parse(content);
      return result.newTasks || [];
    } catch (error) {
      console.error('AI Task Suggestions Error:', error);
      return [];
    }
  }

  // Test connection to OpenAI API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('AI Connection Test Failed:', error);
      return false;
    }
  }
}