import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Download, Eye, Code2, Folder, FileText, Settings, TestTube } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { GeneratedProject, GeneratedFile } from '@/services/api'
import { downloadAsZip, formatFilename } from '@/utils/downloadUtils'

interface CodePreviewProps {
  project: GeneratedProject
  onDownload?: (projectName: string) => void
  className?: string
}

export function CodePreview({ project, onDownload, className }: CodePreviewProps) {
  const { toast } = useToast()
  
  const highlightCode = (code: string): string => {
    // For now, just return the code as-is with proper escaping
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast("Code copied to clipboard!", "success")
    } catch (err) {
      console.error('Failed to copy code:', err)
      toast("Failed to copy code to clipboard", "destructive")
    }
  }

  const downloadFile = (file: GeneratedFile) => {
    const filename = file.path.split('/').pop() || 'file.txt'
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast(`${filename} has been downloaded`, "success")
  }

  const downloadAllFiles = async () => {
    try {
      // Convert GeneratedFile[] to DownloadableFile[]
      const downloadableFiles = project.files.map(file => ({
        path: file.path,
        content: file.content
      }))
      
      const filename = formatFilename(project.projectName)
      const success = await downloadAsZip(downloadableFiles, filename)
      
      if (success) {
        toast(`Successfully downloaded ${project.projectName} as ZIP!`, "success")
        onDownload?.(project.projectName)
      } else {
        toast("Failed to create ZIP file. Please try again.", "destructive")
      }
    } catch (error) {
      console.error('Download error:', error)
      toast("An error occurred while downloading. Please try again.", "destructive")
    }
  }

  const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'ts': return 'typescript'
      case 'tsx': return 'tsx'
      case 'js': return 'javascript'
      case 'jsx': return 'jsx'
      case 'css': return 'css'
      case 'json': return 'json'
      case 'sql': return 'sql'
      case 'sh': return 'bash'
      case 'md': return 'markdown'
      default: return 'text'
    }
  }



  const getFileIcon = (file: GeneratedFile) => {
    const extension = file.path.split('.').pop()?.toLowerCase()
    if (file.type === 'test') {
      return <TestTube className="h-4 w-4 text-green-500" />
    }
    if (file.type === 'config') {
      return <Settings className="h-4 w-4 text-gray-500" />
    }
    if (file.type === 'documentation') {
      return <FileText className="h-4 w-4 text-blue-500" />
    }
    
    switch (extension) {
      case 'ts':
      case 'tsx':
        return <Code2 className="h-4 w-4 text-blue-500" />
      case 'js':
      case 'jsx':
        return <Code2 className="h-4 w-4 text-yellow-500" />
      case 'css':
        return <Code2 className="h-4 w-4 text-purple-500" />
      case 'json':
        return <Settings className="h-4 w-4 text-orange-500" />
      case 'sql':
        return <Code2 className="h-4 w-4 text-orange-500" />
      case 'md':
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <Code2 className="h-4 w-4 text-gray-500" />
    }
  }

  const getFileTypeColor = (file: GeneratedFile) => {
    switch (file.type) {
      case 'component': return 'bg-blue-100 text-blue-800'
      case 'config': return 'bg-gray-100 text-gray-800'
      case 'documentation': return 'bg-green-100 text-green-800'
      case 'test': return 'bg-purple-100 text-purple-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (!project.files || project.files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No files to preview</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Project Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                {project.projectName}
              </CardTitle>
              <CardDescription>
                Generated on {new Date(project.metadata.generatedAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button onClick={downloadAllFiles} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{project.files.length}</div>
              <div className="text-sm text-muted-foreground">Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{project.techStack.frontend}</div>
              <div className="text-sm text-muted-foreground">Frontend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{project.techStack.backend}</div>
              <div className="text-sm text-muted-foreground">Backend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{project.techStack.database || 'None'}</div>
              <div className="text-sm text-muted-foreground">Database</div>
            </div>
          </div>
          
          {/* Build Instructions */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-semibold mb-2">Quick Start:</h4>
            <div className="space-y-1">
              {project.buildInstructions.map((instruction, index) => (
                <code key={index} className="block text-sm bg-background px-2 py-1 rounded">
                  {instruction}
                </code>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Generated Files
            <Badge variant="secondary">{project.files.length} files</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={project.files[0]?.path} className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="w-max">
                {project.files.map((file) => (
                  <TabsTrigger key={file.path} value={file.path} className="flex items-center gap-2">
                    {getFileIcon(file)}
                    <span className="text-sm">{file.path.split('/').pop()}</span>
                    <Badge variant="outline" className={`text-xs ml-1 ${getFileTypeColor(file)}`}>
                      {file.type}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {project.files.map((file) => (
              <TabsContent key={file.path} value={file.path} className="mt-4">
                <div className="border rounded-lg overflow-hidden">
                  {/* File Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      <span className="font-mono text-sm">{file.path}</span>
                      <Badge variant="outline" className={`text-xs ${getFileTypeColor(file)}`}>
                        {file.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getLanguageFromPath(file.path)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(file.content)}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Code Content */}
                  <ScrollArea className="h-96">
                    <pre className="p-4 text-sm overflow-x-auto bg-slate-50 dark:bg-slate-900">
                      <code 
                        className={`language-${getLanguageFromPath(file.path)} text-slate-800 dark:text-slate-200`}
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(file.content)
                        }}
                      />
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}