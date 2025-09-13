// import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

interface GenerateButtonProps {
  onClick: () => void
  onReset?: () => void
  disabled?: boolean
  loading?: boolean
  progress?: number
  status?: 'idle' | 'generating' | 'completed' | 'failed'
  estimatedTime?: number
}

export function GenerateButton({ 
  onClick, 
  onReset,
  disabled = false, 
  loading = false, 
  progress = 0,
  status = 'idle',
  estimatedTime = 30
}: GenerateButtonProps) {
  const getButtonContent = () => {
    switch (status) {
      case 'generating':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        )
      case 'completed':
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            App Generated!
          </>
        )
      case 'failed':
        return (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            Try Again
          </>
        )
      default:
        return (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate App
          </>
        )
    }
  }

  const getButtonVariant = () => {
    switch (status) {
      case 'completed':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const isDisabled = disabled || loading || status === 'generating'

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={onClick}
          disabled={isDisabled}
          variant={getButtonVariant()}
          size="lg"
          className="flex-1"
        >
          {getButtonContent()}
        </Button>
        
        {status === 'completed' && onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="px-4"
            title="Generate another app"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {status === 'generating' && (
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          {/* Status Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {progress < 30 ? 'Analyzing prompt...' :
                 progress < 60 ? 'Generating code...' :
                 progress < 90 ? 'Organizing files...' :
                 'Finalizing...'}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {Math.round(progress)}%
            </Badge>
          </div>
          
          {/* Estimated Time */}
          {progress > 0 && progress < 100 && (
            <div className="text-center">
              <span className="text-xs text-muted-foreground">
                Estimated time remaining: {Math.max(1, Math.round((100 - progress) / 100 * estimatedTime))}s
              </span>
            </div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            Usually takes 15-30 seconds to generate a complete app
          </span>
        </div>
      )}
    </div>
  )
}