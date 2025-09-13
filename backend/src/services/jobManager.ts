// Simple job manager using the database service
import { db, GenerationJob } from './database';
import { storage } from './storage';

class JobManager {
  
  createJob(userId: string, prompt: string, appType?: string, complexity?: string): string {
    const job = db.createJob({
      userId,
      prompt,
      appType: appType || 'other',
      complexity: complexity || 'moderate'
    });
    
    console.log(`📝 Created job ${job.id} for user ${userId}`);
    return job.id;
  }

  updateJobProgress(jobId: string, progress: number, status?: string): GenerationJob | null {
    const updates: Partial<GenerationJob> = { progress };
    if (status) updates.status = status as any;
    
    const job = db.updateJob(jobId, updates);
    if (job) {
      console.log(`📊 Job ${jobId} progress: ${progress}%`);
    }
    return job;
  }

  completeJob(jobId: string, filesS3Key: string): GenerationJob | null {
    const job = db.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      filesS3Key
    });
    
    if (job) {
      console.log(`✅ Job ${jobId} completed with files: ${filesS3Key}`);
    }
    return job;
  }

  failJob(jobId: string, error: string): GenerationJob | null {
    const job = db.updateJob(jobId, {
      status: 'failed',
      errorMessage: error
    });
    
    if (job) {
      console.log(`❌ Job ${jobId} failed: ${error}`);
    }
    return job;
  }

  getJob(jobId: string): GenerationJob | null {
    return db.getJobById(jobId);
  }

  getUserJobs(userId: string): GenerationJob[] {
    return db.getJobsByUserId(userId);
  }

  async getJobFiles(jobId: string): Promise<string | null> {
    const job = db.getJobById(jobId);
    if (!job || !job.filesS3Key) return null;
    
    return await storage.downloadFile(job.filesS3Key);
  }
}

export const jobManager = new JobManager();