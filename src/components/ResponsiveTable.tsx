import { type ReactNode } from 'react'

interface ResponsiveTableProps {
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => ReactNode
  }>
  data: any[]
  onRowClick?: (row: any) => void
  responsive?: boolean
  mobileColumns?: string[] // Show only these columns on mobile
}

/**
 * Responsive table that collapses to card view on mobile
 */
export function ResponsiveTable({
  columns,
  data,
  onRowClick,
  responsive = true,
  mobileColumns,
}: ResponsiveTableProps) {
  const displayColumns = responsive && mobileColumns ? columns.filter(c => mobileColumns.includes(c.key)) : columns

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              {displayColumns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                {displayColumns.map(col => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-slate-600 dark:text-slate-400"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {data.map((row, idx) => (
          <div
            key={idx}
            onClick={() => onRowClick?.(row)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800"
          >
            {displayColumns.map(col => (
              <div key={col.key} className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
                  {col.label}
                </span>
                <span className="text-sm text-slate-900 dark:text-white text-right flex-1">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">No data to display</p>
        </div>
      )}
    </div>
  )
}
