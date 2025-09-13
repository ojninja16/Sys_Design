import { FileNode } from '@/components/FileTree'

export interface DownloadableFile {
  path: string
  content: string
}

// Convert FileNode tree to flat array of downloadable files
export const flattenFilesForDownload = (nodes: FileNode[]): DownloadableFile[] => {
  const result: DownloadableFile[] = []
  
  const traverse = (node: FileNode) => {
    if (node.type === 'file' && node.content) {
      result.push({
        path: node.path,
        content: node.content
      })
    }
    if (node.children) {
      node.children.forEach(traverse)
    }
  }
  
  nodes.forEach(traverse)
  return result
}

// Create and download a ZIP file (using JSZip)
export const downloadAsZip = async (files: DownloadableFile[], filename: string = 'generated-app.zip') => {
  try {
    // Dynamic import of JSZip to avoid bundle issues
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    // Add each file to the zip
    files.forEach(file => {
      zip.file(file.path, file.content)
    })
    
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' })
    
    // Create download link and trigger download
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error creating zip file:', error)
    return false
  }
}

// Download individual file
export const downloadSingleFile = (content: string, filename: string) => {
  try {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Error downloading file:', error)
    return false
  }
}

// Format filename for download
export const formatFilename = (appName: string): string => {
  return appName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '.zip'
}