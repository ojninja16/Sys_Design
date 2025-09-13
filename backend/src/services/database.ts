// Simple mock database service
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  prompt: string;
  appType: string;
  complexity: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filesS3Key?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}


// Simple in-memory database
class MockDatabase {
  private users: Map<string, User> = new Map();
  private jobs: Map<string, GenerationJob> = new Map();

  constructor() {
    // Add sample data
    this.createUser({ email: 'demo@example.com', name: 'Demo User' });
    this.createUser({ email: 'test@example.com', name: 'Test User' });
  }

  // User operations
  createUser(userData: { email: string; name: string }): User {
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.set(user.id, user);
    console.log(`👤 Created user: ${user.email}`);
    return user;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  getUserByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  // Job operations
  createJob(jobData: {
    userId: string;
    prompt: string;
    appType?: string;
    complexity?: string;
  }): GenerationJob {
    const job: GenerationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      appType: 'other',
      complexity: 'moderate',
      status: 'pending',
      progress: 0,
      ...jobData,
      createdAt: new Date().toISOString()
    };
    this.jobs.set(job.id, job);
    console.log(`🔄 Created job: ${job.id} for user ${job.userId}`);
    return job;
  }

  getJobById(id: string): GenerationJob | null {
    return this.jobs.get(id) || null;
  }

  getJobsByUserId(userId: string): GenerationJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateJob(id: string, updates: Partial<GenerationJob>): GenerationJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    const updatedJob = { ...job, ...updates };
    if (updates.status === 'completed' && !job.completedAt) {
      updatedJob.completedAt = new Date().toISOString();
    }
    
    this.jobs.set(id, updatedJob);
    console.log(`📝 Updated job ${id}: ${updates.status || 'progress'}`);
    return updatedJob;
  }


}

// Singleton instance
export const db = new MockDatabase();