import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast } from '@/components/ui/toast'

interface ToastMessage {
  id: string
  message: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToastContextType {
  toast: (message: string, variant?: ToastMessage['variant'], duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: string, variant: ToastMessage['variant'] = 'default', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = { id, message, variant, duration }
    
    setToasts(prev => [...prev, newToast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toastMessage) => (
          <Toast
            key={toastMessage.id}
            variant={toastMessage.variant}
            onClose={() => removeToast(toastMessage.id)}
          >
            {toastMessage.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}