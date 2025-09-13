// API service for communicating with the backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

export interface GenerateRequest {
  prompt: string;
  techStack?: TechStack;
  options?: GenerationOptions;
}

export interface GenerateResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database?: string;
  styling?: string;
}

export interface GenerationOptions {
  includeTests?: boolean;
  includeDocumentation?: boolean;
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'config' | 'documentation' | 'test' | 'other';
}

export interface GeneratedProject {
  projectName: string;
  techStack: TechStack;
  files: GeneratedFile[];
  buildInstructions: string[];
  metadata: {
    tokensUsed?: number;
    generatedAt: string;
    estimatedCost?: number;
  };
}

export interface ApiError {
  error: string;
  code: string;
  details?: any;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'Network error',
          code: 'NETWORK_ERROR',
          details: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        throw new ApiError(errorData.error, errorData.code, errorData.details);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or parsing errors
      throw new ApiError(
        'Failed to connect to server',
        'CONNECTION_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Create a new generation job
  async generateApp(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>(`/jobs/${jobId}/status`);
  }

  // Get generation results
  async getResults(jobId: string): Promise<GeneratedProject> {
    return this.request<GeneratedProject>(`/results/${jobId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Export singleton instance
export const apiService = new ApiService();