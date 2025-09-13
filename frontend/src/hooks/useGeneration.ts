import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService, GenerateRequest, GeneratedProject, JobStatus, ApiError } from '@/services/api';

export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed';

export interface GenerationState {
  status: GenerationStatus;
  progress: number;
  jobId: string | null;
  result: GeneratedProject | null;
  error: string | null;
}

export interface UseGenerationReturn {
  state: GenerationState;
  generateApp: (prompt: string, options?: Partial<GenerateRequest>) => Promise<void>;
  reset: () => void;
  retry: () => void;
}

const POLLING_INTERVAL = 4000; 
const MAX_POLLING_ATTEMPTS = 45;

export function useGeneration(): UseGenerationReturn {
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    jobId: null,
    result: null,
    error: null,
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<GenerateRequest | null>(null);
  const pollingAttemptsRef = useRef(0);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const updateState = useCallback((updates: Partial<GenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const jobStatus: JobStatus = await apiService.getJobStatus(jobId);
      let progress = state.progress;
      if (jobStatus.status === 'processing') {
        progress = jobStatus.progress || Math.min(90, state.progress + 5);
      } else if (jobStatus.status === 'completed') {
        progress = 100;
      }

      updateState({
        progress,
        error: jobStatus.error || null,
      });

      if (jobStatus.status === 'completed') {
        clearPolling();
        
        try {
          const result = await apiService.getResults(jobId);
          updateState({
            status: 'completed',
            result,
            progress: 100,
          });
        } catch (error) {
          console.error('Failed to get results:', error);
          updateState({
            status: 'failed',
            error: error instanceof ApiError ? error.message : 'Failed to get results',
          });
        }
        
      } else if (jobStatus.status === 'failed') {
        clearPolling();
        updateState({
          status: 'failed',
          error: jobStatus.error || 'Generation failed',
        });
        
      } else {
        pollingAttemptsRef.current++;
        
        if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
          clearPolling();
          updateState({
            status: 'failed',
            error: 'Generation timed out. Please try again.',
          });
        }
      }
      
    } catch (error) {
      console.error('Polling error:', error);
      pollingAttemptsRef.current++;
      
      // If we've had too many polling errors, give up
      if (pollingAttemptsRef.current >= 10) {
        clearPolling();
        updateState({
          status: 'failed',
          error: 'Lost connection to server. Please try again.',
        });
      }
    }
  }, [state.progress, updateState, clearPolling]);

  const startPolling = useCallback((jobId: string) => {
    clearPolling();
    pollingAttemptsRef.current = 0;
    
    // Poll immediately, then every POLLING_INTERVAL
    pollJobStatus(jobId);
    
    pollingRef.current = setInterval(() => {
      pollJobStatus(jobId);
    }, POLLING_INTERVAL);
  }, [pollJobStatus, clearPolling]);

  const generateApp = useCallback(async (prompt: string, options: Partial<GenerateRequest> = {}) => {
    try {
      // Reset state
      updateState({
        status: 'generating',
        progress: 0,
        jobId: null,
        result: null,
        error: null,
      });

      const request: GenerateRequest = {
        prompt: prompt.trim(),
        techStack: options.techStack,
        options: {
          complexity: 'moderate',
          includeTests: true,
          includeDocumentation: true,
          ...options.options,
        },
      };

      lastRequestRef.current = request;

      const response = await apiService.generateApp(request);
      
      updateState({
        jobId: response.jobId,
        progress: 10, // Initial progress
      });

      startPolling(response.jobId);
      
    } catch (error) {
      console.error('Generation error:', error);
      updateState({
        status: 'failed',
        error: error instanceof ApiError ? error.message : 'Failed to start generation',
      });
    }
  }, [updateState, startPolling]);

  const reset = useCallback(() => {
    clearPolling();
    lastRequestRef.current = null;
    pollingAttemptsRef.current = 0;
    
    setState({
      status: 'idle',
      progress: 0,
      jobId: null,
      result: null,
      error: null,
    });
  }, [clearPolling]);

  const retry = useCallback(async () => {
    if (lastRequestRef.current) {
      await generateApp(lastRequestRef.current.prompt, {
        techStack: lastRequestRef.current.techStack,
        options: lastRequestRef.current.options,
      });
    }
  }, [generateApp]);


  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return {
    state,
    generateApp,
    reset,
    retry,
  };
}