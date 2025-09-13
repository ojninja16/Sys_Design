import { useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { PromptInput } from '@/components/PromptInput'
import { GenerateButton } from '@/components/GenerateButton'
import { ExamplePrompts } from '@/components/ExamplePrompts'
import { CodePreview } from '@/components/CodePreview'
import { LoadingDisplay } from '@/components/LoadingDisplay'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { ToastProvider } from '@/hooks/useToast'
import { useGeneration } from '@/hooks/useGeneration'
import { useToast } from '@/hooks/useToast'
import './App.css'
import './styles/syntax-highlighting.css'

function AppContent() {
  const [prompt, setPrompt] = useState('')
  const { state, generateApp, reset, retry } = useGeneration()
  const { toast } = useToast()

  const handleGenerate = async (promptText: string) => {
    try {
      await generateApp(promptText, {
        options: {
          complexity: 'moderate',
          includeTests: true,
          includeDocumentation: true,
        }
      })
      
    } catch (error) {
      console.error('Failed to start generation:', error)
      toast("Failed to start app generation. Please try again.", "destructive")
    }
  }

  const handleReset = () => {
    reset()
    setPrompt('')
  }

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt)
  }

  const handleDownload = (projectName: string) => {
    if (!state.result) return
    
  
    const projectData = {
      name: projectName,
      files: state.result.files,
      techStack: state.result.techStack,
      buildInstructions: state.result.buildInstructions,
    }
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName}-generated.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast(`${projectName} project data has been downloaded.`, "success")
  }

  return (
    <AppLayout showBackToTop={state.status === 'completed'}>
      <div className="space-y-6">
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleGenerate}
          disabled={state.status === 'generating'}
        />
        
        <GenerateButton
          onClick={() => handleGenerate(prompt)}
          onReset={handleReset}
          disabled={!prompt.trim() || prompt.trim().length < 10 || state.status === 'generating'}
          loading={state.status === 'generating'}
          progress={state.progress}
          status={state.status}
        />

        {state.status === 'idle' && (
          <ExamplePrompts
            onSelectPrompt={handleSelectPrompt}
          />
        )}

        {state.status === 'generating' && (
          <LoadingDisplay 
            progress={state.progress}
          />
        )}

        {state.status === 'completed' && state.result && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 App Generated Successfully!</h2>
              <p className="text-muted-foreground">Your application is ready. You can preview the code and download it below.</p>
            </div>
            <CodePreview
              project={state.result}
              onDownload={handleDownload}
            />
          </div>
        )}

        {state.status === 'failed' && (
          <ErrorDisplay
            error={state.error || 'Something went wrong while generating your app.'}
            onRetry={retry}
            onReset={handleReset}
          />
        )}
      </div>
    </AppLayout>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App