
import { CodeViewer } from '@/components/CodeViewer'
import { FileNode } from '@/components/FileTree'

// Sample generated app data for demonstration
const sampleApp = {
  id: 'demo-app-1',
  name: 'Task Tracker App',
  description: 'A simple task management application with user authentication',
  createdAt: new Date(),
  files: [
    {
      name: 'package.json',
      path: 'package.json',
      type: 'file' as const,
      size: 1024,
      content: `{
  "name": "task-tracker-app",
  "version": "1.0.0",
  "description": "A simple task management application",
  "main": "src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "tsx": "^3.12.0"
  }
}`
    },
    {
      name: 'src',
      path: 'src',
      type: 'directory' as const,
      children: [
        {
          name: 'index.ts',
          path: 'src/index.ts',
          type: 'file' as const,
          size: 512,
          content: `import express from 'express';
import { taskRoutes } from './routes/tasks';
import { authRoutes } from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
        },
        {
          name: 'routes',
          path: 'src/routes',
          type: 'directory' as const,
          children: [
            {
              name: 'tasks.ts',
              path: 'src/routes/tasks.ts',
              type: 'file' as const,
              size: 768,
              content: `import { Router } from 'express';

const router = Router();

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

let tasks: Task[] = [];

router.get('/', (req, res) => {
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title } = req.body;
  const newTask: Task = {
    id: Date.now().toString(),
    title,
    completed: false,
    createdAt: new Date()
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], title, completed };
  res.json(tasks[taskIndex]);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

export { router as taskRoutes };`
            },
            {
              name: 'auth.ts',
              path: 'src/routes/auth.ts',
              type: 'file' as const,
              size: 456,
              content: `import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple demo authentication
  if (email === 'demo@example.com' && password === 'password') {
    res.json({ 
      token: 'demo-jwt-token',
      user: { id: '1', email, name: 'Demo User' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  res.status(201).json({
    token: 'demo-jwt-token',
    user: { id: '2', email, name }
  });
});

export { router as authRoutes };`
            }
          ]
        },
        {
          name: 'types',
          path: 'src/types',
          type: 'directory' as const,
          children: [
            {
              name: 'index.ts',
              path: 'src/types/index.ts',
              type: 'file' as const,
              size: 256,
              content: `export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}`
            }
          ]
        }
      ]
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'file' as const,
      size: 512,
      content: `# Task Tracker App

A simple task management application built with Express.js and TypeScript.

## Features

- User authentication (login/register)
- Create, read, update, and delete tasks
- RESTful API design
- TypeScript for type safety

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. The API will be available at http://localhost:3000

## API Endpoints

- \`POST /api/auth/login\` - User login
- \`POST /api/auth/register\` - User registration
- \`GET /api/tasks\` - Get all tasks
- \`POST /api/tasks\` - Create a new task
- \`PUT /api/tasks/:id\` - Update a task
- \`DELETE /api/tasks/:id\` - Delete a task`
    }
  ] as FileNode[]
}

interface CodeViewerDemoProps {
  onDownload?: (app: any) => void
}

export function CodeViewerDemo({ onDownload }: CodeViewerDemoProps) {
  const handleDownload = (app: any) => {
    console.log('Downloading app:', app.name)
    onDownload?.(app)
    // TODO: Implement actual download functionality
  }

  return (
    <CodeViewer 
      app={sampleApp} 
      onDownload={handleDownload}
      className="w-full"
    />
  )
}