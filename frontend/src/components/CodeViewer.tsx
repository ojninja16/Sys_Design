import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileTree, FileNode } from '@/components/FileTree'
import { CodePreview } from '@/components/CodePreview'
import { Download, Eye, FolderOpen, Code2, Loader2 } from 'lucide-react'
import { downloadAsZip, flattenFilesForDownload, formatFilename } from '@/utils/downloadUtils'
import { useToast } from '@/hooks/useToast'
import { GeneratedProject, GeneratedFile } from '@/services/api'

interface GeneratedApp {
  id: string
  name: string
  description: string
  files: FileNode[]
  createdAt: Date
}

interface CodeViewerProps {
  app: GeneratedApp
  onDownload?: (app: GeneratedApp) => void
  className?: string
}

export function CodeViewer({ app, onDownload, className }: CodeViewerProps) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'preview'>('tree')
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  // Convert FileNode tree to GeneratedFile array for CodePreview
  const flattenFiles = (nodes: FileNode[]): GeneratedFile[] => {
    const result: GeneratedFile[] = []
    
    const traverse = (node: FileNode) => {
      if (node.type === 'file' && node.content) {
        result.push({
          path: node.path,
          content: node.content,
          type: 'other'
        })
      }
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    
    nodes.forEach(traverse)
    return result
  }



  const fileContents = useMemo(() => flattenFiles(app.files), [app.files])

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file)
    setViewMode('preview')
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const downloadableFiles = flattenFilesForDownload(app.files)
      const filename = formatFilename(app.name)
      
      const success = await downloadAsZip(downloadableFiles, filename)
      
      if (success) {
        toast(`Successfully downloaded ${app.name}!`, 'success')
        onDownload?.(app)
      } else {
        toast('Failed to download the app. Please try again.', 'destructive')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast('An error occurred while downloading. Please try again.', 'destructive')
    } finally {
      setIsDownloading(false)
    }
  }

  const createProjectFromFiles = (files: GeneratedFile[], name: string): GeneratedProject => ({
    projectName: name,
    techStack: {
      frontend: 'React',
      backend: 'Express',
      database: 'PostgreSQL',
      styling: 'Tailwind'
    },
    files,
    buildInstructions: ['npm install', 'npm run dev'],
    metadata: {
      generatedAt: new Date().toISOString()
    }
  })

  const selectedFileProject = selectedFile && selectedFile.content ? 
    createProjectFromFiles([{
      path: selectedFile.path,
      content: selectedFile.content,
      type: 'other'
    }], selectedFile.name) : null

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              {app.name}
            </CardTitle>
            <CardDescription>{app.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Structure
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Download Generated App</DialogTitle>
                  <DialogDescription>
                    Download the complete application code as a ZIP file.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p><strong>App:</strong> {app.name}</p>
                    <p><strong>Files:</strong> {fileContents.length}</p>
                    <p><strong>Total Size:</strong> {Math.round(fileContents.reduce((sum, f) => sum + f.content.length, 0) / 1024)} KB</p>
                  </div>
                  <Button onClick={handleDownload} className="w-full" disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? 'Creating ZIP...' : 'Download ZIP'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'tree' ? (
          <FileTree
            files={app.files}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile?.path}
          />
        ) : viewMode === 'preview' && selectedFileProject ? (
          <CodePreview
            project={selectedFileProject}
            onDownload={() => handleDownload()}
          />
        ) : (
          <CodePreview
            project={createProjectFromFiles(fileContents, app.name)}
            onDownload={() => handleDownload()}
          />
        )}
      </CardContent>
    </Card>
  )
}