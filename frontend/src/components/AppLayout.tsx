import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Code, Zap, Info } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  showBackToTop?: boolean
}

export function AppLayout({ children, showBackToTop = false }: AppLayoutProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI App Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into complete applications with natural language. 
            Describe what you want to build, and get production-ready code in seconds.
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Code className="h-3 w-3" />
              Full-Stack
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              TypeScript
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Generate Your App</CardTitle>
            <CardDescription className="text-base">
              Describe your application idea and let AI create the complete codebase for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-6 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Pro tip:</strong> Be specific about your requirements. Mention the type of app, 
            key features, preferred tech stack, and any special requirements for best results.
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by advanced AI • Built with React, TypeScript & Tailwind CSS</p>
          {showBackToTop && (
            <button 
              onClick={scrollToTop}
              className="mt-2 text-primary hover:text-primary/80 underline"
            >
              Back to top
            </button>
          )}
        </div>
      </div>
    </div>
  )
}