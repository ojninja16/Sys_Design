import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  File,
  Code2,
  FileText,
  Settings,
  Package
} from 'lucide-react'

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  children?: FileNode[]
  content?: string
}

interface FileTreeProps {
  files: FileNode[]
  onFileSelect?: (file: FileNode) => void
  selectedFile?: string
  className?: string
}

export function FileTree({ files, onFileSelect, selectedFile, className }: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/', 'src', 'components']))

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedDirs(newExpanded)
  }

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return expandedDirs.has(fileName) ? 
        <FolderOpen className="h-4 w-4 text-blue-500" /> : 
        <Folder className="h-4 w-4 text-blue-500" />
    }

    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'ts':
      case 'tsx':
        return <Code2 className="h-4 w-4 text-blue-600" />
      case 'js':
      case 'jsx':
        return <Code2 className="h-4 w-4 text-yellow-500" />
      case 'css':
        return <Code2 className="h-4 w-4 text-purple-500" />
      case 'json':
        return <Settings className="h-4 w-4 text-orange-500" />
      case 'md':
        return <FileText className="h-4 w-4 text-gray-600" />
      case 'sql':
        return <Code2 className="h-4 w-4 text-green-600" />
      case 'lock':
        return <Package className="h-4 w-4 text-gray-400" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedDirs.has(node.path)
    const isSelected = selectedFile === node.path
    const paddingLeft = depth * 16 + 8

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <Collapsible open={isExpanded} onOpenChange={() => toggleDirectory(node.path)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start h-8 px-2 hover:bg-accent ${
                  isSelected ? 'bg-accent' : ''
                }`}
                style={{ paddingLeft }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                {getFileIcon(node.name, true)}
                <span className="ml-2 text-sm font-medium">{node.name}</span>
                {node.children && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {node.children.length}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {node.children?.map((child) => renderFileNode(child, depth + 1))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )
    }

    return (
      <Button
        key={node.path}
        variant="ghost"
        className={`w-full justify-start h-8 px-2 hover:bg-accent ${
          isSelected ? 'bg-accent' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => onFileSelect?.(node)}
      >
        {getFileIcon(node.name, false)}
        <span className="ml-2 text-sm">{node.name}</span>
        {node.size && (
          <Badge variant="outline" className="ml-auto text-xs">
            {formatFileSize(node.size)}
          </Badge>
        )}
      </Button>
    )
  }

  const getTotalFiles = (nodes: FileNode[]): number => {
    return nodes.reduce((total, node) => {
      if (node.type === 'file') {
        return total + 1
      }
      return total + (node.children ? getTotalFiles(node.children) : 0)
    }, 0)
  }

  const getTotalSize = (nodes: FileNode[]): number => {
    return nodes.reduce((total, node) => {
      if (node.type === 'file' && node.size) {
        return total + node.size
      }
      return total + (node.children ? getTotalSize(node.children) : 0)
    }, 0)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Project Structure</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{getTotalFiles(files)} files</Badge>
          <Badge variant="outline">{formatFileSize(getTotalSize(files))}</Badge>
        </div>
      </div>

      <div className="border rounded-lg">
        <ScrollArea className="h-96">
          <div className="p-2">
            {files.map((node) => renderFileNode(node))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}