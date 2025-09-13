import { GenerateRequest, GeneratedProject, TechStack } from '../types';
import { PromptEngineering } from './promptEngineering';
import { jobManager } from './jobManager';
import { AIService } from './aiService';

export class GenerationService {
  private promptEngineering: PromptEngineering;
  private aiService: AIService;

  constructor() {
    this.promptEngineering = new PromptEngineering();
    
    const config: any = {
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
    };
    
    if (process.env.OPENAI_API_KEY) {
      config.apiKey = process.env.OPENAI_API_KEY;
    }
    
    this.aiService = new AIService(config);
  }

  /**
   * Process a generation request and generate the complete project
   */
  async processGenerationRequest(jobId: string, request: GenerateRequest): Promise<GeneratedProject> {
    try {
      console.log(`🔄 Processing generation request for job ${jobId}`);
      jobManager.updateJobProgress(jobId, 10, 'processing');
      
      // Generate enhanced prompt
      const enhancedPrompt = this.promptEngineering.generateEnhancedPrompt(
        request.prompt,
        request.techStack,
        request.options
      );
      
      console.log(`📊 Prompt analysis for job ${jobId}:`, {
        appType: enhancedPrompt.analysis.appType,
        complexity: enhancedPrompt.analysis.complexity,
        features: enhancedPrompt.analysis.features
      });
      
      // Update progress
      jobManager.updateJobProgress(jobId, 25);
      
      // Generate project using AI service
      console.log(`🤖 Generating project with AI for job ${jobId}`);
      jobManager.updateJobProgress(jobId, 50);
      
      const aiResponse = await this.aiService.generateProject(enhancedPrompt);
      
      if (!aiResponse.success || !aiResponse.project) {
        throw new Error(aiResponse.error || 'AI generation failed');
      }
      
      // Update progress
      jobManager.updateJobProgress(jobId, 90);
      
      // Use the generated project as-is
      const finalProject: GeneratedProject = aiResponse.project;
      
      console.log(`✅ Project generation completed for job ${jobId}`);
      return finalProject;
      
    } catch (error) {
      console.error(`❌ Error processing generation request for job ${jobId}:`, error);
      jobManager.failJob(jobId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  analyzePrompt(prompt: string, _techStack?: TechStack) {
    return this.promptEngineering.analyzePrompt(prompt);
  }

  
  getExamplePrompts() {
    return this.promptEngineering.getExamplePrompts();
  }

 
  validateAndOptimizePrompt(prompt: string): { isValid: boolean; optimizedPrompt?: string; issues?: string[] } {
    const issues: string[] = [];
    
    if (prompt.length < 10) {
      issues.push('Prompt is too short. Please provide more details about your desired application.');
    }
    
    if (prompt.length > 1000) {
      issues.push('Prompt is too long. Please keep it under 1000 characters.');
    }
    
    // Check for vague prompts
    const vaguePhrases = [
      /^(build|create|make) (me )?an? app$/i,
      /^(build|create|make) (me )?a website$/i,
      /^help me$/i
    ];
    
    const isVague = vaguePhrases.some(pattern => pattern.test(prompt.trim()));
    if (isVague) {
      issues.push('Prompt is too vague. Please specify what type of application you want and its main features.');
    }
    
    // Check for potentially problematic content
    const problematicPatterns = [
      /hack|crack|exploit|malware|virus/i,
      /illegal|piracy|copyright/i,
      /adult|nsfw|explicit/i
    ];
    
    const hasProblematicContent = problematicPatterns.some(pattern => pattern.test(prompt));
    if (hasProblematicContent) {
      issues.push('Prompt contains potentially problematic content. Please revise your request.');
    }
    
    // Optimize prompt if valid
    let optimizedPrompt: string | undefined;
    if (issues.length === 0) {
      optimizedPrompt = this.optimizePrompt(prompt);
    }
    
    const result: { isValid: boolean; optimizedPrompt?: string; issues?: string[] } = {
      isValid: issues.length === 0
    };
    
    if (optimizedPrompt) {
      result.optimizedPrompt = optimizedPrompt;
    }
    
    if (issues.length > 0) {
      result.issues = issues;
    }
    
    return result;
  }

  /**
   * Optimize prompt for better AI generation
   */
  private optimizePrompt(prompt: string): string {
    let optimized = prompt.trim();
    
    // Add context if missing
    if (!optimized.toLowerCase().includes('app') && !optimized.toLowerCase().includes('application')) {
      optimized = `Build an application that ${optimized}`;
    }
    
    // Ensure it starts with an action verb
    const actionVerbs = ['build', 'create', 'make', 'develop', 'generate'];
    const startsWithAction = actionVerbs.some(verb => 
      optimized.toLowerCase().startsWith(verb)
    );
    
    if (!startsWithAction) {
      optimized = `Build ${optimized}`;
    }
    
    // Add technical context if missing
    const hasTechContext = /react|vue|angular|express|node|database|api/i.test(optimized);
    if (!hasTechContext && optimized.length < 100) {
      optimized += '. Use modern web technologies and best practices.';
    }
    
    return optimized;
  }

  getCostEstimation(prompt: string, _techStack?: TechStack) {
    const analysis = this.promptEngineering.analyzePrompt(prompt);
    
    return {
      complexity: analysis.complexity,
      appType: analysis.appType,
      features: analysis.features
    };
  }


}