# AI App Generator

A pseudo-app demonstrating system design for AI-powered code generation. Users input natural language prompts and receive complete application scaffolds with preview capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+

### Installation & Run
```bash
# Install dependencies
npm run install:all

# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Example Usage

### Input Prompt
```json
{
  "prompt": "Build me a todo app with user login, where users can add, edit, delete, and mark tasks as complete. Include categories and due dates.",
  "options": {
    "complexity": "moderate",
    "includeTests": true,
    "includeDocumentation": true
  }
}
```

### API Flow
1. **POST** `/api/generate` → Returns `jobId`
2. **GET** `/api/jobs/{jobId}/status` → Poll for completion
3. **GET** `/api/results/{jobId}` → Get file URLs (presigned URLs in production)

### Output Example
```json
{
  "projectName": "todo-app",
  "techStack": {
    "frontend": "React",
    "backend": "Express", 
    "database": "PostgreSQL",
    "styling": "Tailwind"
  },
  "files": [
    {"path": "package.json", "content": "...", "type": "config"},
    {"path": "frontend/src/App.tsx", "content": "...", "type": "component"},
    {"path": "backend/src/index.ts", "content": "...", "type": "config"},
    {"path": "README.md", "content": "...", "type": "documentation"}
  ]
}
```

## Current Implementation

**Status**: Pseudo-app with mocked services for demonstration

### What Works
- ✅ Full UI/UX flow with React + ShadCN
- ✅ Express API with job-based processing
- ✅ Mock AI generation with realistic responses
- ✅ File preview and download simulation

### What's Mocked
- 🔄 In-memory database (no PostgreSQL)
- 🔄 Mock file storage (no AWS S3 presigned URLs)
- 🔄 Simulated AI responses (no OpenAI integration)
- 🔄 Basic caching (no Redis)

##  Tech Stack

**Frontend**: React + TypeScript + ShadCN UI + Tailwind  
**Backend**: Express + TypeScript + Mock Services  
**Design**: System design patterns for scalability

##  Limitations

- All data is in-memory (resets on restart)
- No real AI integration (uses mock responses)
- No persistent storage or user authentication
- Single-instance deployment only

## 📊 System Architecture
<img width="1486" height="832" alt="systemarhcitecture" src="https://github.com/user-attachments/assets/fabfc2b4-a9fd-4b9c-85e7-7559d11b1a04" />




## 🔄 User Flow Diagram
<img width="915" height="783" alt="UserFlow" src="https://github.com/user-attachments/assets/0a3beed0-13e2-44ca-a806-9e69d16aec8f" />



## 🚀 Next Steps (Production)

**Everything is already architected and ready!** We have configurations for Redis, OpenAI client, S3 bucket, etc. in place - just need to integrate them with backend and add the required env setup like Docker volumes for backend with DB + caching and AWS credentials.
### What Changes in Production
- **File Storage**: Direct file content → AWS S3 presigned URLs (24h expiry)
- **Database**: In-memory → PostgreSQL with persistent volumes
- **Cache**: Basic → Redis with TTL and prompt deduplication
- **AI**: Mock responses → Real OpenAI GPT-4 integration
- **Scaling**: Single instance → Load balanced with horizontal scaling

### Infrastructure Ready
- ✅ S3 service abstraction in `backend/src/services/storage.ts`
- ✅ Cache service with Redis integration ready
- ✅ OpenAI client with structured JSON output
- ✅ Environment configuration and secrets management


