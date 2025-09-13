import { Router, Request, Response } from 'express';
import { validateGenerateRequest, validateJobId } from '../middleware/validation';
import { generateRateLimit } from '../middleware/rateLimiter';
import { jobManager } from '../services/jobManager';
import { storage } from '../services/storage';
import { cache } from '../services/cache';
import { GenerationService } from '../services/generationService';
import { GenerateRequest, GenerateResponse, ApiError } from '../types';

const router = Router();
const generationService = new GenerationService();

// POST /api/generate - Create a new generation job
router.post('/generate', 
  generateRateLimit,
  validateGenerateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const generateRequest = req.body as GenerateRequest;
      
      const validation = generationService.validateAndOptimizePrompt(generateRequest.prompt);
      if (!validation.isValid) {
        const apiError: ApiError = {
          error: 'Invalid prompt',
          code: 'INVALID_PROMPT',
          details: validation.issues
        };
        res.status(400).json(apiError);
        return;
      }

      if (validation.optimizedPrompt) {
        generateRequest.prompt = validation.optimizedPrompt;
      }

      const userId = 'user_demo'; // In real app, get from auth
      const jobId = jobManager.createJob(userId, generateRequest.prompt, 'other', 'moderate');
      
      // Start background processing with AI generation
      console.log(`🚀 Starting AI generation for job ${jobId}`);
      
      // Process the request asynchronously
      setImmediate(async () => {
        try {
          const generatedProject = await generationService.processGenerationRequest(jobId, generateRequest);
          const filesKey = `projects/${jobId}/files.zip`;
          const filesContent = JSON.stringify(generatedProject.files);
          await storage.uploadFile(filesKey, filesContent);
          
          jobManager.completeJob(jobId, filesKey);
          
        } catch (error) {
          console.error(`Failed to process job ${jobId}:`, error);
        }
      });
      
      const response: GenerateResponse = {
        jobId,
        status: 'pending',
        message: 'Generation job created successfully'
      };
      
      res.status(202).json(response);
      
    } catch (error) {
      console.error('Error creating generation job:', error);
      const apiError: ApiError = {
        error: 'Failed to create generation job',
        code: 'GENERATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(apiError);
    }
  }
);

// GET /api/jobs/:jobId/status - Get job status
router.get('/jobs/:jobId/status',
  validateJobId,
  (req: Request, res: Response): void => {
    try {
      const { jobId } = req.params;
      console.log(`🔍 Looking for job: ${jobId}`);
      
      const job = jobManager.getJob(jobId);
      
      if (!job) {
        console.log(`❌ Job not found: ${jobId}`);
        const userId = 'user_demo';
        const allJobs = jobManager.getUserJobs(userId);
        console.log(`📋 Existing jobs for user ${userId}:`, allJobs.map(j => ({ id: j.id, status: j.status })));
        
        const apiError: ApiError = {
          error: 'Job not found',
          code: 'JOB_NOT_FOUND'
        };
        res.status(404).json(apiError);
        return;
      }
      
      console.log(`✅ Found job: ${jobId}, status: ${job.status}, progress: ${job.progress}%`);
      const jobStatus = {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        error: job.errorMessage
      };
      
      res.json(jobStatus);
      
    } catch (error) {
      console.error('Error getting job status:', error);
      const apiError: ApiError = {
        error: 'Failed to get job status',
        code: 'STATUS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(apiError);
    }
  }
);

// GET /api/results/:jobId - Get generation results
router.get('/results/:jobId',
  validateJobId,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;
      
      // Check if job exists and is completed
      const job = jobManager.getJob(jobId);
      if (!job) {
        const apiError: ApiError = {
          error: 'Job not found',
          code: 'JOB_NOT_FOUND'
        };
        res.status(404).json(apiError);
        return;
      }
      
      if (job.status !== 'completed') {
        const apiError: ApiError = {
          error: 'Job not completed yet',
          code: 'JOB_NOT_READY',
          details: { currentStatus: job.status, progress: job.progress }
        };
        res.status(409).json(apiError);
        return;
      }
      
      // Get results from storage
      const filesContent = await jobManager.getJobFiles(jobId);
      if (!filesContent) {
        const apiError: ApiError = {
          error: 'Results not found',
          code: 'RESULTS_NOT_FOUND'
        };
        res.status(404).json(apiError);
        return;
      }
      
      // Parse the stored files
      const files = JSON.parse(filesContent);
      const result = {
        projectName: `${job.appType}-app`,
        techStack: { frontend: 'React', backend: 'Express', database: 'PostgreSQL', styling: 'Tailwind' },
        files,
        buildInstructions: ['npm install', 'npm run dev'],
        metadata: {
          generatedAt: job.createdAt,
          tokensUsed: 1500, // Mock value for now
          estimatedCost: 0.02 // Mock value for now
        }
      };
      
      res.json(result);
      
    } catch (error) {
      console.error('Error getting results:', error);
      const apiError: ApiError = {
        error: 'Failed to get results',
        code: 'RESULTS_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(apiError);
    }
  }
);

// GET /api/jobs - Get user jobs (for debugging/monitoring)
router.get('/jobs', (_req: Request, res: Response): void => {
  try {
    // In real app, get userId from auth
    const userId = 'user_demo';
    const jobs = jobManager.getUserJobs(userId);
    
    res.json({
      total: jobs.length,
      jobs: jobs.slice(0, 50) // Limit to 50 most recent
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    const apiError: ApiError = {
      error: 'Failed to get jobs',
      code: 'JOBS_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(apiError);
  }
});



export default router;