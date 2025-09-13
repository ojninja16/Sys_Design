import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (prompt: string) => void
  disabled?: boolean
  maxLength?: number
}

export function PromptInput({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  maxLength = 1000 
}: PromptInputProps) {
  const [error, setError] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const trimmedValue = value.trim()
    
    if (!trimmedValue) {
      setError('Please enter a description of the app you want to generate')
      return
    }
    
    if (trimmedValue.length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)')
      return
    }
    
    if (trimmedValue.length > maxLength) {
      setError(`Description is too long (${trimmedValue.length}/${maxLength} characters)`)
      return
    }
    
    onSubmit(trimmedValue)
  }

  const characterCount = value.length
  const isNearLimit = characterCount > maxLength * 0.8
  const isOverLimit = characterCount > maxLength

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="prompt-input" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Describe your app
        </label>
        <div className="relative">
          <Textarea
            id="prompt-input"
            placeholder="e.g., Build me a task tracker app with login and a task list where users can add, edit, and delete tasks..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`min-h-[120px] resize-none ${isOverLimit ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <Badge 
              variant={isOverLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
              className="text-xs"
            >
              {characterCount}/{maxLength}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: Press Ctrl+Enter to generate • Be specific about features, tech stack preferences, and UI requirements
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}