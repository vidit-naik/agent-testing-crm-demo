'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppContextType {
  toasts: Toast[]
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  modalState: { isOpen: boolean; type: string | null; data?: any }
  refreshKey: number
  triggerRefresh: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [modalState, setModalState] = useState({ isOpen: false, type: null as string | null, data: undefined as any })
  const [refreshKey, setRefreshKey] = useState(0)

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const openModal = useCallback((type: string, data?: any) => {
    setModalState({ isOpen: true, type, data })
  }, [])

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, type: null, data: undefined })
  }, [])

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  return (
    <AppContext.Provider value={{ toasts, addToast, removeToast, openModal, closeModal, modalState, refreshKey, triggerRefresh }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
