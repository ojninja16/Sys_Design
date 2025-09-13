
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onReset?: () => void;
  title?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onReset, 
  title = "Generation Failed" 
}: ErrorDisplayProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2 justify-center">
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {onReset && (
          <Button 
            variant="secondary" 
            onClick={onReset}
          >
            Start Over
          </Button>
        )}
      </div>
    </div>
  );
}