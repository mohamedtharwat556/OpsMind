export function ConfigurationError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Configuration Error</h1>
            <p className="text-sm text-slate-500">OpsMind is not properly configured</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{message}</p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">To fix this:</p>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>Create a <code className="bg-slate-100 px-1 rounded">.env.local</code> file in the project root</li>
                <li>Add your Supabase configuration:</li>
              </ol>
              <pre className="bg-slate-900 text-slate-100 p-2 rounded text-xs mt-2 overflow-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
              <li className="text-xs text-slate-600 mt-2">Restart the development server</li>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              © 2026 OpsMind. Technical Support Knowledge Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
