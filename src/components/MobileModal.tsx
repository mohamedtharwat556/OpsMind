import { X } from 'lucide-react'
import { type ReactNode } from 'react'

interface MobileModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'danger' | 'secondary'
    loading?: boolean
  }>
}

/**
 * Mobile-optimized modal that takes full screen on small devices
 */
export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  actions,
}: MobileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-3 p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 min-h-12 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            {actions.map((action, idx) => {
              const baseClass =
                'flex-1 px-4 py-3 min-h-12 rounded-lg font-medium transition-colors disabled:opacity-50'

              const variantClass = {
                primary:
                  'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
                danger:
                  'bg-red-600 text-white hover:bg-red-700 active:scale-95',
                secondary:
                  'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600',
              }[action.variant || 'primary']

              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`${baseClass} ${variantClass}`}
                >
                  {action.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    </span>
                  ) : (
                    action.label
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
