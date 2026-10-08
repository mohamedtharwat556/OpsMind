import { X, Menu } from 'lucide-react'
import { useState } from 'react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * Mobile-optimized menu component with full-height overlay
 */
export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="fixed inset-0 z-40 lg:hidden flex">
        <div className="w-64 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Mobile-optimized button component with larger touch targets
 */
export function MobileButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`min-h-12 px-4 py-3 rounded-lg transition-colors active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Mobile-optimized input component
 */
export function MobileInput({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-12 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}
