import { type ReactNode } from 'react'

interface MobileFormFieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
}

/**
 * Mobile-optimized form field wrapper
 * - Larger labels for readability
 * - Better spacing on small screens
 * - Clear error messages
 */
export function MobileFormField({
  label,
  error,
  required,
  hint,
  children,
}: MobileFormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
          <span className="mt-0.5">⚠️</span>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  )
}

interface MobileSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ label: string; value: string }>
}

/**
 * Mobile-optimized select component
 * - Larger font size for better readability
 * - Better touch targets
 */
export function MobileSelect({ options, className = '', ...props }: MobileSelectProps) {
  return (
    <select
      className={`
        w-full px-4 py-3 min-h-12
        border border-slate-300 dark:border-slate-600
        rounded-lg bg-white dark:bg-slate-800
        text-slate-900 dark:text-white text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors
        ${className}
      `}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

interface MobileTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Mobile-optimized textarea component
 * - Minimum height of 120px for better typing experience
 * - Better spacing and padding
 */
export function MobileTextArea({ className = '', ...props }: MobileTextAreaProps) {
  return (
    <textarea
      className={`
        w-full px-4 py-3 min-h-[120px]
        border border-slate-300 dark:border-slate-600
        rounded-lg bg-white dark:bg-slate-800
        text-slate-900 dark:text-white text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500
        resize-vertical
        transition-colors
        ${className}
      `}
      {...props}
    />
  )
}
