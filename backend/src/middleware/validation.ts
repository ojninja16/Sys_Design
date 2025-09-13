import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { GenerateRequest } from '../types';

// Validation schemas
const generateRequestSchema = Joi.object({
  prompt: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Prompt must be at least 10 characters long',
      'string.max': 'Prompt cannot exceed 1000 characters',
      'any.required': 'Prompt is required'
    }),
  
  techStack: Joi.object({
    frontend: Joi.string().valid('React', 'Vue', 'Angular', 'Svelte').optional(),
    backend: Joi.string().valid('Express', 'FastAPI', 'Spring Boot', 'Django').optional(),
    database: Joi.string().valid('PostgreSQL', 'MongoDB', 'MySQL', 'SQLite').optional(),
    styling: Joi.string().valid('Tailwind', 'CSS Modules', 'Styled Components', 'SCSS').optional()
  }).optional(),
  
  options: Joi.object({
    includeTests: Joi.boolean().optional(),
    includeDocumentation: Joi.boolean().optional(),
    complexity: Joi.string().valid('simple', 'moderate', 'complex').optional()
  }).optional()
});

export const validateGenerateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = generateRequestSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
    return;
  }
  
  // Attach validated data to request
  req.body = value as GenerateRequest;
  next();
};

export const validateJobId = (req: Request, res: Response, next: NextFunction): void => {
  const { jobId } = req.params;
  
  // Validate job ID format: job_timestamp_randomstring
  const jobIdRegex = /^job_\d+_[a-z0-9]+$/i;
  
  console.log(`🔍 Validating job ID: "${jobId}"`);
  console.log(`📋 Regex test result: ${jobIdRegex.test(jobId)}`);
  
  if (!jobId || !jobIdRegex.test(jobId)) {
    console.log(`❌ Job ID validation failed for: "${jobId}"`);
    res.status(400).json({
      error: 'Invalid job ID format',
      code: 'INVALID_JOB_ID'
    });
    return;
  }
  
  console.log(`✅ Job ID validation passed for: "${jobId}"`);
  next();
};