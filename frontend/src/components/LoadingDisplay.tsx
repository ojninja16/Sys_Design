import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Code, FileText, Zap } from 'lucide-react';

interface LoadingDisplayProps {
  progress: number;
  status?: string;
}

const getProgressMessage = (progress: number): { message: string; icon: React.ReactNode } => {
  if (progress < 20) {
    return {
      message: "Analyzing your prompt...",
      icon: <Sparkles className="h-4 w-4 text-blue-500" />
    };
  } else if (progress < 40) {
    return {
      message: "Planning application architecture...",
      icon: <Code className="h-4 w-4 text-green-500" />
    };
  } else if (progress < 60) {
    return {
      message: "Generating code components...",
      icon: <FileText className="h-4 w-4 text-purple-500" />
    };
  } else if (progress < 80) {
    return {
      message: "Creating project structure...",
      icon: <Zap className="h-4 w-4 text-orange-500" />
    };
  } else {
    return {
      message: "Finalizing your application...",
      icon: <Loader2 className="h-4 w-4 text-primary animate-spin" />
    };
  }
};

export function LoadingDisplay({ progress, status }: LoadingDisplayProps) {
  const { message, icon } = getProgressMessage(progress);
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {icon}
              <h3 className="text-lg font-semibold">Generating Your App</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {status || message}
            </p>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This usually takes 30-60 seconds. Please don't close this page.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}