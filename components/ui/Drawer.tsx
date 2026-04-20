'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'left' | 'right'
}

export function Drawer({ isOpen, onClose, title, children, position = 'right' }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const positionClasses = position === 'right' ? 'right-0' : 'left-0'
  const slideClasses = position === 'right' ? 'translate-x-0' : '-translate-x-0'

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute ${positionClasses} top-0 h-full w-full max-w-md bg-background shadow-xl ${slideClasses} transition-transform overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
