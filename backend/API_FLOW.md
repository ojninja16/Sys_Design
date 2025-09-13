# AI App Generator API Flow

## Quick Start

### 1. Create Generation Job
```bash
POST /api/generate
```

**Request:**
```json
{
  "prompt": "Build me a todo app with user authentication"
}
```

**Response (202):**
```json
{
  "jobId": "job_1704110400000_abc123",
  "status": "pending",
  "message": "Generation job created successfully"
}
```

### 2. Check Job Status
```bash
GET /api/jobs/{jobId}/status
```

**Response:**
```json
{
  "jobId": "job_1704110400000_abc123",
  "status": "processing",
  "progress": 50,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

**Status Values:** `pending` → `processing` → `completed` | `failed`

### 3. Get Results (when completed)
```bash
GET /api/results/{jobId}
```

**Response:**
```json
{
  "projectName": "crud-app",
  "techStack": {
    "frontend": "React",
    "backend": "Express", 
    "database": "PostgreSQL",
    "styling": "Tailwind"
  },
  "files": [
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"crud-app\",\n  \"scripts\": {...}\n}",
      "type": "config"
    },
    {
      "path": "frontend/src/App.tsx", 
      "content": "import React from 'react';\n\nfunction App() {...}",
      "type": "component"
    },
    {
      "path": "backend/src/index.ts",
      "content": "import express from 'express';\n\nconst app = express();...",
      "type": "config"
    }
  ],
  "buildInstructions": [
    "npm install",
    "npm run dev"
  ]
}
```

## Other Endpoints

### Health Check
```bash
GET /api/health
# Returns: { "status": "ok", "timestamp": "..." }
```

### List User Jobs
```bash
GET /api/jobs
# Returns: { "total": 5, "jobs": [...] }
```

## Flow Summary

1. **POST /generate** → Get `jobId` immediately
2. **GET /jobs/{jobId}/status** → Poll until `status: "completed"`
3. **GET /results/{jobId}** → Download generated project files
