import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckSquare, 
  BarChart3, 
  ShoppingCart, 
  MessageSquare, 
  Users, 
  FileText,
  Lightbulb
} from 'lucide-react'

interface ExamplePrompt {
  id: string
  title: string
  description: string
  prompt: string
  icon: React.ReactNode
  tags: string[]
}

const examplePrompts: ExamplePrompt[] = [
  {
    id: 'todo',
    title: 'Todo App',
    description: 'Task management with user authentication',
    prompt: 'Build me a todo app with user login, where users can add, edit, delete, and mark tasks as complete. Include categories and due dates.',
    icon: <CheckSquare className="h-5 w-5" />,
    tags: ['CRUD', 'Auth', 'Tasks']
  },
  {
    id: 'blog',
    title: 'Blog Platform',
    description: 'Content management with comments',
    prompt: 'Create a blog platform where users can write posts with a rich text editor, add comments, categories, tags, and user profiles.',
    icon: <FileText className="h-5 w-5" />,
    tags: ['CMS', 'Blog', 'Comments']
  },
  {
    id: 'dashboard',
    title: 'Analytics Dashboard',
    description: 'Data visualization with charts',
    prompt: 'Create a sales analytics dashboard with interactive charts, KPI widgets, data filtering, and export functionality.',
    icon: <BarChart3 className="h-5 w-5" />,
    tags: ['Charts', 'Analytics', 'Dashboard']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Store',
    description: 'Online store with shopping cart',
    prompt: 'Build an online store with product catalog, shopping cart, user accounts, order management, and payment integration.',
    icon: <ShoppingCart className="h-5 w-5" />,
    tags: ['E-commerce', 'Cart', 'Payments']
  },
  {
    id: 'social',
    title: 'Social Media App',
    description: 'Social platform with posts and following',
    prompt: 'Create a Twitter-like social media app with user posts, following/followers system, likes, comments, and user profiles.',
    icon: <Users className="h-5 w-5" />,
    tags: ['Social', 'Posts', 'Following']
  },
  {
    id: 'chat',
    title: 'Chat Application',
    description: 'Real-time messaging system',
    prompt: 'Build a real-time chat application with multiple rooms, user presence indicators, message history, and file sharing.',
    icon: <MessageSquare className="h-5 w-5" />,
    tags: ['Real-time', 'Chat', 'WebSocket']
  }
]

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
  disabled?: boolean
}

export function ExamplePrompts({ onSelectPrompt, disabled = false }: ExamplePromptsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Example Prompts
        </CardTitle>
        <CardDescription>
          Get started quickly with these example app ideas, or use them as inspiration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examplePrompts.map((example) => (
            <Card key={example.id} className="border-muted hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                      {example.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{example.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {example.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {example.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {example.prompt}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onSelectPrompt(example.prompt)}
                  disabled={disabled}
                >
                  Use This Prompt
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}