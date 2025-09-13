# AI App Generator - System Design Document

## 1. Overview

**System**: AI-powered application code generator  
**Purpose**: Transform natural language prompts into complete, structured application scaffolds  
**Architecture**: Microservices-ready monolith with async job processing  

## 2. Requirements

### Functional
- Process natural language prompts (max 1000 chars)
- Generate complete application code (React + Express + PostgreSQL)
- Provide real-time preview and file download
- Support multiple complexity levels and tech stacks

### Non-Functional
- **Performance**: <1.5mins response time, 1000+ concurrent users
- **Availability**: 99.9% uptime with graceful degradation
- **Scalability**: Horizontal scaling with stateless design
- **Cost**: Optimized AI usage through caching and deduplication

## 3. System Architecture

### Current Implementation (POC)
```
React Frontend ───▶ Express Backend ───▶ Mock Services
     │                    │                    │
  (Port 3000)         (Port 3001)      (In-Memory Storage)
```

**Current Stack:**
- **Frontend**: React + TypeScript + ShadCN UI + Tailwind CSS ✅
- **Backend**: Node.js + Express + TypeScript ✅
- **Database**: In-memory mock (no PostgreSQL) 🔄
- **Cache**: Basic in-memory (no Redis) 🔄
- **Storage**: Mock file storage (no S3) 🔄
- **AI**: Mock responses (no OpenAI) 🔄

### Production Architecture (Designed)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│ Application │───▶│   Service   │
│    Tier     │    │    Tier     │    │    Layer    │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                   ┌─────────────┐    ┌─────────────┐
                   │    Data     │    │  External   │
                   │    Tier     │    │  Services   │
                   └─────────────┘    └─────────────┘
```

**Production Stack (Future):**
- **Database**: PostgreSQL (primary) + Read Replicas
- **Cache**: Redis (in-memory caching + pub/sub)
- **Storage**: AWS S3 (generated files + presigned URLs)
- **AI**: OpenAI GPT-4 (structured JSON output)
- **Load Balancer**: ALB/Nginx for traffic distribution
- **CDN**: CloudFlare for static assets

## 4. User Flow

### Primary Flow
1. **Input**: User enters natural language prompt ✅
2. **Validation**: System validates prompt (length, content) ✅
3. **Job Creation**: Async job created with unique ID ✅
4. **Processing**: Mock AI generates structured code output ✅
5. **Storage**: Files stored in-memory (S3 in production) 🔄
6. **Delivery**: Direct content (presigned URLs in production) 🔄

### API Endpoints (Implemented)
```
POST   /api/generate           → Create job, return jobId ✅
GET    /api/jobs/:id/status    → Poll job progress ✅
GET    /api/results/:id        → Get file content (presigned URLs in production) ✅
GET    /api/health             → System health check ✅
```

## 5. Data Flow

### Request Processing
- User types prompt → Frontend validates it
- POST /api/generate → Backend creates job, returns jobId immediately
- Background processing starts → AI generates code while user waits , uppdates status , pushes generated code as files to S3
- Frontend polls GET /api/jobs/{jobId}/status every 2 seconds
- When complete → GET /api/results/{jobId} returns a map of filenames with other metadata along with a mapping of files and their pre-signed URL's
- User downloads → ZIP file with complete project

### Caching Strategy
- **Prompt Hash**: 24h TTL for identical requests
- **Job Status**: 5min TTL for polling optimization  
- **Presigned URLs**: 1h TTL (URLs valid 24h)

## 6. Scalability Design

### Horizontal Scaling
- **Stateless API servers** (no session state)
- **Shared Redis cache** across instances
- **Database connection pooling** (10-20 per instance)
- **Load balancer** with health checks

### Performance Optimizations Possible
- **CDN**: Static assets and file downloads
- **Database**: Read replicas, optimized indexes
- **AI Cost**: Prompt deduplication, token monitoring
- **Async Processing**: Non-blocking job execution

## 7. Security & Reliability

### Security Measures
- **Input Validation**: Prompt sanitization, length limits
- **Rate Limiting**: 10 requests/min per user
- **HTTPS**: TLS 1.3 for all communications
- **Secrets**: Environment variables, no hardcoded keys

### Error Handling
- **Circuit Breaker**: AI service failure protection
- **Retry Logic**: Exponential backoff (1s, 2s, 4s)
- **Graceful Degradation**: Fallback to cached responses

## 8. Implementation Status

### Current POC (What Actually Works)
- ✅ React frontend with ShadCN UI components
- ✅ Express backend with TypeScript
- ✅ Job-based async processing flow
- ✅ Mock AI responses with realistic output
- ✅ In-memory data storage
- ✅ File preview and download simulation

### Architecture Ready (Code Exists, Not Active)
-  PostgreSQL schemas 
-  S3 service abstraction layer
-  Redis cache integration patterns
-  OpenAI client with structured output
-  Environment variable setup

### Missing for Production
- ❌ Load balancer (ALB/Nginx)
- ❌ CDN for static assets
- ❌ Database read replicas
- ❌ Monitoring and alerting
- ❌ Auto-scaling configuration
- Job Queues implementation

### Immediate Next Steps
-  Database schemas and migrations
-  Replacing short polling with SSE or WebSockets.
-  S3 service abstraction layer
-  Redis cache integration
-  OpenAI client with structured output
-  Docker Compose with volumes
-  Environment configuration

### Next Steps
1. Add OpenAI API key to environment
2. Enable PostgreSQL + Redis in Docker
3. Configure AWS S3 credentials
4. Deploy with load balancer
5. Add monitoring and alerting
6. Replacing short polling with SSE or WebSockets for real-time updates and better scala

## 9. Capacity Planning

### Expected Load
- **Users**: 1000 concurrent
- **Requests**: 10 generations/user/day
- **Processing**: 30s average per generation
- **Storage**: 1TB for generated files

### Resource Requirements
```
API Servers: 4 × (2 vCPU, 4GB RAM)
Database: 1 × (4 vCPU, 16GB RAM) + 2 read replicas
Redis: 1 × (2 vCPU, 8GB RAM)
Storage: 1TB S3 bucket
```

### Cost Estimates
- **AI**: ~$3000/month (10K generations × $0.30)
- **Infrastructure**: ~$800/month
- **Total**: ~$3800/month

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-13  
