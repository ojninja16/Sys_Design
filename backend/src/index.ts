import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiRateLimit } from './middleware/rateLimiter';
import generateRoutes from './routes/generate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiRateLimit);

// logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint - to make sure backend is healthy
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Basic API info route
app.get('/api', (_req, res) => {
  res.json({ 
    message: 'AI App Generator API',
    version: '1.0.0',
    description: 'Generate complete application scaffolds using AI and advanced prompt engineering',
    endpoints: {
      health: 'GET /api/health - Check API health',
      generate: 'POST /api/generate - Create generation job',
      jobStatus: 'GET /api/jobs/:jobId/status - Get job status',
      results: 'GET /api/results/:jobId - Get generation results',
      jobs: 'GET /api/jobs - List user jobs',
    },
    features: [
      'Simple prompt engineering',
      'App type detection',
      'Mock AI responses',
      'Real-time job tracking',
      'File generation'
    ]
  });
});

// API routes
app.use('/api', generateRoutes);

// Global error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

app.use('*', (_req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

app.listen(PORT, () => {
  console.log(`AI App Generator API Server`);
  console.log(`Running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API docs: http://localhost:${PORT}/api`);
});