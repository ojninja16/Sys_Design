import { GeneratedProject, TechStack } from '../types';
import { EnhancedPrompt } from './promptEngineering';
import { cache } from './cache';

export interface AIServiceConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface AIResponse {
  success: boolean;
  project?: GeneratedProject;
  error?: string;
  tokensUsed?: number;
  cost?: number;
}

export class AIService {
  private config: AIServiceConfig;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000, 
      ...config
    };
  }

  /**
   * Generate project using AI service or fallback to mock (with caching)
   */
  async generateProject(enhancedPrompt: EnhancedPrompt): Promise<AIResponse> {
    const cacheKey = cache.generatePromptKey(enhancedPrompt.userPrompt);
    const cachedResult = await cache.get<AIResponse>(cacheKey);
    if (cachedResult) {
      console.log('⚡ Using cached response');
      return cachedResult;
    }
    
    const hasApiKey = this.config.apiKey && this.config.apiKey.length > 0;
    let result: AIResponse;
    
    if (hasApiKey) {
      console.log('🤖 Using OpenAI API');
      result = await this.generateWithOpenAI(enhancedPrompt);
    } else {
      console.log('🎭 Using mock AI');
      result = await this.generateWithMock(enhancedPrompt);
    }
    
    // Cache successful results for 1 hour
    if (result.success) {
      await cache.set(cacheKey, result, 3600);
    }
    
    return result;
  }

  /**
   * Generate project using OpenAI API
   */
  private async generateWithOpenAI(enhancedPrompt: EnhancedPrompt): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 OpenAI attempt ${attempt}/${this.retryAttempts}`);
        
        const response = await this.callOpenAI(enhancedPrompt);
        
        if (response.success && response.project) {
          console.log('✅ OpenAI generation successful');
          return response;
        } else {
          throw new Error(response.error || 'Invalid response from OpenAI');
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`⚠️ OpenAI attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    return await this.generateWithMock(enhancedPrompt);
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(enhancedPrompt: EnhancedPrompt): Promise<AIResponse> {
    const requestBody = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: enhancedPrompt.systemPrompt
        },
        {
          role: 'user',
          content: enhancedPrompt.userPrompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as any;
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      const content = data.choices[0].message.content;
      let parsedProject: any;

      try {
        parsedProject = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`);
      }
      const validatedProject = this.validateAndNormalizeProject(parsedProject, enhancedPrompt.analysis.suggestedTechStack);

      const tokensUsed = data.usage?.total_tokens || 1500;
      const cost = this.calculateCost(tokensUsed);

      return {
        success: true,
        project: validatedProject,
        tokensUsed,
        cost
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI request timed out');
      }
      
      throw error;
    }
  }

  //mock response
  private async generateWithMock(enhancedPrompt: EnhancedPrompt): Promise<AIResponse> {
    await this.sleep(2000 + Math.random() * 3000); // 2-5 seconds

    const { analysis } = enhancedPrompt;
    
    try {
      const mockProject = this.createSophisticatedMockProject(analysis.appType, analysis.suggestedTechStack, analysis.complexity, analysis.features);
      
      return {
        success: true,
        project: mockProject,
        tokensUsed: 1500,
        cost: 0.05
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mock generation failed'
      };
    }
  }

  /**
   * Create simple mock project
   */
  private createSophisticatedMockProject(
    appType: string,
    techStack: TechStack,
    _complexity: string,
    features: string[]
  ): GeneratedProject {
    const projectName = `${appType}-app`;
    
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: projectName,
          version: '1.0.0',
          scripts: {
            dev: 'concurrently "cd frontend && npm run dev" "cd backend && npm run dev"',
            build: 'cd frontend && npm run build && cd ../backend && npm run build'
          },
          dependencies: {
            concurrently: '^8.2.2'
          }
        }, null, 2),
        type: 'config' as const
      },
      
      // Simple React App
      {
        path: 'frontend/src/App.tsx',
        content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        ${appType.charAt(0).toUpperCase() + appType.slice(1)} App
      </h1>
      <p className="text-gray-600">Generated by AI App Generator</p>
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Features:</h2>
        <ul className="list-disc list-inside">
          ${features.map(f => `<li>${f}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  );
}

export default App;`,
        type: 'component' as const
      },

      // Simple Express server
      {
        path: 'backend/src/index.ts',
        content: `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', appType: '${appType}' });
});

${appType === 'crud' ? `
app.get('/api/items', (req, res) => {
  res.json({ items: [] });
});

app.post('/api/items', (req, res) => {
  res.json({ message: 'Item created' });
});` : ''}

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        type: 'config' as const
      },

      // Simple README
      {
        path: 'README.md',
        content: `# ${projectName}

A simple ${appType} application.

## Setup
1. npm install
2. npm run dev

## Tech Stack
- React + TypeScript
- Express + TypeScript
- PostgreSQL
- Tailwind CSS`,
        type: 'documentation' as const
      }
    ];

    return {
      projectName,
      techStack,
      files,
      buildInstructions: ['npm install', 'npm run dev'],
      metadata: {
        tokensUsed: 1500,
        generatedAt: new Date().toISOString(),
        estimatedCost: 0.05
      }
    };
  }



  /**
   * Validate and normalize project structure from AI response
   */
  private validateAndNormalizeProject(project: any, techStack: TechStack): GeneratedProject {
    if (!project || typeof project !== 'object') {
      throw new Error('Invalid project structure');
    }

    const normalized: GeneratedProject = {
      projectName: project.projectName || 'generated-app',
      techStack: project.techStack || techStack,
      files: [],
      buildInstructions: project.buildInstructions || ['npm install', 'npm run dev'],
      metadata: {
        tokensUsed: 0,
        generatedAt: new Date().toISOString(),
        estimatedCost: 0
      }
    };

    // Validate and normalize files
    if (Array.isArray(project.files)) {
      normalized.files = project.files.map((file: any) => ({
        path: file.path || 'unknown',
        content: file.content || '',
        type: file.type || 'other'
      }));
    }

    return normalized;
  }

  private calculateCost(tokens: number): number {
    // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
    // Simplified calculation assuming 50/50 split
    return (tokens / 1000) * 0.045;
  }

  //Sleep utility for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}