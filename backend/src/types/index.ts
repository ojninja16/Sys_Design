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