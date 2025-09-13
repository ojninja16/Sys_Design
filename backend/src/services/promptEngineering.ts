import { TechStack, GenerationOptions } from '../types';

export interface PromptAnalysis {
  appType: 'crud' | 'dashboard' | 'other';
  complexity: 'simple' | 'moderate';
  suggestedTechStack: TechStack;
  features: string[];
}

export interface EnhancedPrompt {
  systemPrompt: string;
  userPrompt: string;
  analysis: PromptAnalysis;
}

export class PromptEngineering {
  // Simplified app type detection
  private readonly APP_TYPE_PATTERNS = {
    crud: /todo|task|list|manage|create|edit|delete|crud|inventory|admin/i,
    dashboard: /dashboard|analytics|chart|graph|metric|report|visualization|data/i
  };

  // Simple tech stack - always the same
  private readonly DEFAULT_TECH_STACK = {
    frontend: 'React',
    backend: 'Express',
    database: 'PostgreSQL',
    styling: 'Tailwind'
  };

  // Simple system prompt
  private readonly SYSTEM_PROMPT = `You are an expert full-stack developer. Generate a complete React + Express application.

CRITICAL: Respond with valid JSON in this exact format:
{
  "projectName": "string",
  "techStack": {"frontend": "React", "backend": "Express", "database": "PostgreSQL", "styling": "Tailwind"},
  "files": [
    {"path": "src/App.tsx", "content": "// Complete React component code", "type": "component"},
    {"path": "server/index.js", "content": "// Complete Express server code", "type": "config"}
  ],
  "buildInstructions": ["npm install", "npm run dev"]
}

Requirements:
- Use React with TypeScript for frontend
- Use Express with TypeScript for backend
- Include proper error handling
- Make it responsive with Tailwind CSS
- Include basic CRUD operations if applicable`;

  /**
   * Analyze user prompt - simplified version
   */
  analyzePrompt(prompt: string, options?: GenerationOptions): PromptAnalysis {
    const normalizedPrompt = prompt.toLowerCase();
    
    // Simple app type detection
    const appType = this.detectAppType(normalizedPrompt);
    
    // Simple complexity determination
    const complexity = options?.complexity === 'simple' ? 'simple' : 'moderate';
    
    // Basic features
    const features = ['database', 'api', 'responsive'];
    if (normalizedPrompt.includes('auth') || normalizedPrompt.includes('login')) {
      features.push('authentication');
    }
    
    return {
      appType,
      complexity,
      suggestedTechStack: { ...this.DEFAULT_TECH_STACK },
      features
    };
  }

  /**
   * Generate enhanced prompt - simplified
   */
  generateEnhancedPrompt(
    userPrompt: string, 
    techStack?: TechStack, 
    options?: GenerationOptions
  ): EnhancedPrompt {
    const analysis = this.analyzePrompt(userPrompt, options);
    const finalTechStack = techStack || analysis.suggestedTechStack;
    
    // Simple enhanced prompt
    const enhancedUserPrompt = `Build: ${userPrompt}
    
Tech Stack: React + Express + PostgreSQL + Tailwind
App Type: ${analysis.appType}
Complexity: ${analysis.complexity}

Include basic ${analysis.appType === 'crud' ? 'CRUD operations' : 'functionality'} and make it responsive.`;
    
    return {
      systemPrompt: this.SYSTEM_PROMPT,
      userPrompt: enhancedUserPrompt,
      analysis: {
        ...analysis,
        suggestedTechStack: finalTechStack
      }
    };
  }

  /**
   * Simple app type detection
   */
  private detectAppType(prompt: string): PromptAnalysis['appType'] {
    if (this.APP_TYPE_PATTERNS.crud.test(prompt)) return 'crud';
    if (this.APP_TYPE_PATTERNS.dashboard.test(prompt)) return 'dashboard';
    return 'other';
  }

  /**
   * Simple example prompts
   */
  getExamplePrompts(): Record<string, string[]> {
    return {
      crud: [
        "Build me a todo app with tasks",
        "Create a simple inventory system",
        "Make a user management app"
      ],
      dashboard: [
        "Create a simple dashboard with charts",
        "Build an analytics dashboard",
        "Make a data visualization app"
      ],
      other: [
        "Build a simple web app",
        "Create a basic website",
        "Make a simple application"
      ]
    };
  }
}