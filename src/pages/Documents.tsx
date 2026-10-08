import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DocType, DocStatus } from '../types/database'
import { getDocuments, deleteDocument } from '../services/documents'
import { submitForApproval } from '../services/approvals'
import { logActivity } from '../services/activityLogs'
import { useAuth } from '../contexts/AuthContext'
import { exportToCSV, exportToExcel, exportToJSON } from '../services/export'
import {
  Plus,
  Search,
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  Trash2,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck,
  BookOpen,
  Briefcase,
  Building2,
  ArrowUpDown,
  Loader2,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// config
const DOC_TYPES: { label: string; value: DocType | 'All'; icon: React.ElementType; color: string }[] = [
  { label: 'All Types', value: 'All', icon: FileText, color: 'text-slate-500' },
  { label: 'SOP', value: 'SOP', icon: FileCheck, color: 'text-blue-600' },
  { label: 'Technical Document', value: 'Technical Document', icon: BookOpen, color: 'text-teal-600' },
  { label: 'Operational Case', value: 'Operational Case', icon: Briefcase, color: 'text-orange-500' },
  { label: 'Organizational Information', value: 'Organizational Information', icon: Building2, color: 'text-slate-500' },
]

const STATUS_STYLES: Record<DocStatus, string> = {
  Approved: 'bg-green-100 text-green-700',
  'In Review': 'bg-amber-100 text-amber-700',
  Draft: 'bg-slate-100 text-slate-600',
  Rejected: 'bg-red-100 text-red-600',
}

const STATUS_ICONS: Record<DocStatus, React.ElementType> = {
  Approved: CheckCircle,
  'In Review': Clock,
  Draft: FileText,
  Rejected: AlertCircle,
}

const TYPE_STYLES: Record<DocType, string> = {
  SOP: 'bg-blue-100 text-blue-700',
  'Technical Document': 'bg-teal-100 text-teal-700',
  'Operational Case': 'bg-orange-100 text-orange-700',
  'Organizational Information': 'bg-slate-100 text-slate-600',
}

// row actions menu
function ActionsMenu({ doc, onClose, onDeleted }: { doc: any; onClose: () => void; onDeleted: (id: string) => void }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleDownload = () => {
    if (!doc) return
    const content = `${doc.title}\n${doc.code}\n\nDescription:\n${doc.description || ''}\n\nContent:\n${doc.content || ''}\n\nVersion: ${doc.version}\nStatus: ${doc.status}\nOwner: ${doc.users?.name || 'Unknown'}\nCreated: ${new Date(doc.created_at).toLocaleDateString()}\nUpdated: ${new Date(doc.updated_at).toLocaleDateString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.code.replace(/\s+/g, '_')}_${doc.version}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSubmitForApproval = async () => {
    try {
      setSubmitting(true)
      await submitForApproval(doc.id)
      await logActivity({
        user_id: user?.id,
        action: 'edit',
        target_type: 'document',
        target_id: doc.id,
        target_title: doc.title,
        target_code: doc.code,
        details: `Submitted for approval: ${doc.title}`,
      })
      onClose()
      navigate(`/documents/${doc.id}`)
    } catch (err) {
      console.error('Failed to submit for approval:', err)
      alert('Failed to submit: ' + (err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    try {
      setDeleting(true)
      await deleteDocument(doc.id)
      await logActivity({
        user_id: user?.id,
        action: 'delete',
        target_type: 'document',
        target_id: doc.id,
        target_title: doc.title,
        target_code: doc.code,
        details: `Deleted ${doc.type}: ${doc.title}`,
      })
      onDeleted(doc.id)
    } catch (err) {
      console.error('Failed to delete document:', err)
      alert('Failed to delete document: ' + (err as Error).message)
    } finally {
      setDeleting(false)
      onClose()
    }
  }

  return (
    <div className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-48" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => { navigate(`/documents/${doc.id}`); onClose() }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
        View Document
      </button>
      <button
        onClick={() => { navigate(`/documents/${doc.id}/edit`); onClose() }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      {(doc.status === 'Draft' || doc.status === 'Rejected') && (
        <button
          onClick={handleSubmitForApproval}
          disabled={submitting}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      )}
      <button
        onClick={() => { handleDownload(); onClose() }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}

// main page
export function Documents() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<DocType | 'All'>('All')
  const [activeStatus, setActiveStatus] = useState<DocStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'title' | 'code' | 'type' | 'version' | 'owner' | 'status' | 'updatedAt'>('updatedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function loadDocuments() {
      try {
        console.log('Loading documents from Supabase...')
        const data = await getDocuments()
        console.log('Documents loaded:', data)
        setDocuments(data)
      } catch (err) {
        console.error('Error loading documents:', err)
        setError('Failed to load documents: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    loadDocuments()
  }, [])

  // filter logic
  const filtered = documents.filter(doc => {
    const matchType = activeType === 'All' || doc.type === activeType
    const matchStatus = activeStatus === 'All' || doc.status === activeStatus
    const matchSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.code.toLowerCase().includes(search.toLowerCase()) ||
      (doc.users?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  // sort logic
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'code':
        comparison = a.code.localeCompare(b.code)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'version':
        comparison = a.version.localeCompare(b.version)
        break
      case 'owner':
        comparison = (a.users?.name || '').localeCompare(b.users?.name || '')
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'updatedAt':
        comparison = a.updated_at.localeCompare(b.updated_at)
        break
    }
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // pagination logic
  const totalPages = Math.ceil(sorted.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDocs = sorted.slice(startIndex, endIndex)

  // reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeType, activeStatus, search, sortBy, sortDirection])

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-5" onClick={() => setOpenMenu(null)}>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Loading documents...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* page header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Documents</h1>
              <p className="text-[13px] text-slate-500 mt-0.5">
                {documents.length} documents · SOPs, Technical Documents, Operational Cases & Org Info
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigate('/documents/create')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Document
              </button>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[13px] font-medium rounded-lg transition-colors"
                    title="Export documents"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 w-32 hidden group-hover:block z-20">
                    <button
                      onClick={() => {
                        const docs = sorted.map(d => ({
                          id: d.id,
                          title: d.title,
                          code: d.code,
                          type: d.type,
                          status: d.status,
                          version: d.version,
                          description: d.description,
                          content: d.content,
                          owner: d.users?.name,
                          created_at: d.created_at,
                          updated_at: d.updated_at,
                        }))
                        exportToCSV(docs, `documents_${new Date().toISOString().split('T')[0]}.csv`)
                      }}
                      className="w-full text-left px-3.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        const docs = sorted.map(d => ({
                          id: d.id,
                          title: d.title,
                          code: d.code,
                          type: d.type,
                          status: d.status,
                          version: d.version,
                          description: d.description,
                          content: d.content,
                          owner: d.users?.name,
                          created_at: d.created_at,
                          updated_at: d.updated_at,
                        }))
                        exportToExcel(docs, `documents_${new Date().toISOString().split('T')[0]}.xlsx`)
                      }}
                      className="w-full text-left px-3.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => {
                        const docs = sorted.map(d => ({
                          id: d.id,
                          title: d.title,
                          code: d.code,
                          type: d.type,
                          status: d.status,
                          version: d.version,
                          description: d.description,
                          content: d.content,
                          owner: d.users?.name,
                          created_at: d.created_at,
                          updated_at: d.updated_at,
                        }))
                        exportToJSON(docs, `documents_${new Date().toISOString().split('T')[0]}.json`)
                      }}
                      className="w-full text-left px-3.5 py-2 text-[12px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* type filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-2 sm:pb-0">
            {DOC_TYPES.map(({ label, value, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => setActiveType(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  activeType === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeType === value ? 'text-white' : color}`} />
                <span className="font-medium">{label}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeType === value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {value === 'All'
                    ? documents.length
                    : documents.filter(d => d.type === value).length}
                </span>
              </button>
            ))}
          </div>

        {/* search + status filter bar */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
          {/* search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search POS, printer, scanner documents…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400 transition-colors"
            />
          </div>

          {/* divider */}
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />

          {/* status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] text-slate-500 font-medium">Status:</span>
            {(['All', 'Approved', 'In Review', 'Draft', 'Rejected'] as const).map(s => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  activeStatus === s
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max md:min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50">
                  <th className="text-left py-3 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                    >
                      Document
                      {sortBy === 'title' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'title' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                    >
                      Type
                      {sortBy === 'type' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'type' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    <button
                      onClick={() => handleSort('version')}
                      className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                    >
                      Version
                      {sortBy === 'version' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'version' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                    <button
                      onClick={() => handleSort('owner')}
                      className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                    >
                      Owner
                      {sortBy === 'owner' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'owner' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                    >
                      Status
                      {sortBy === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'status' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">
                    <button
                      onClick={() => handleSort('updatedAt')}
                      className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                    >
                      Last Updated
                      {sortBy === 'updatedAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                      {sortBy !== 'updatedAt' && <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-[13px] font-medium text-slate-400">No documents found</p>
                      <p className="text-[12px] text-slate-300 mt-1">Try adjusting your filters or search term</p>
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map(doc => {
                    const StatusIcon = STATUS_ICONS[doc.status]
                    return (
                      <tr
                        key={doc.id}
                        className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors group"
                      >
                        {/* title + code */}
                        <td className="py-3.5 px-5">
                          <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{doc.code} · {doc.description?.slice(0, 55)}…</p>
                        </td>

                        {/* type */}
                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded ${TYPE_STYLES[doc.type]}`}>
                            {doc.type}
                          </span>
                        </td>

                        {/* version */}
                        <td className="py-3.5 px-3 text-[12px] font-medium text-slate-600 dark:text-slate-300">{doc.version}</td>

                        {/* owner */}
                        <td className="py-3.5 px-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${doc.users?.avatar_color || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                              {doc.users?.initials || doc.users?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </div>
                            <span className="text-[12px] text-slate-600 dark:text-slate-300">{doc.users?.name || 'Unknown'}</span>
                          </div>
                        </td>

                        {/* status */}
                        <td className="py-3.5 px-3">
                          <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded ${STATUS_STYLES[doc.status]}`}>
                            <StatusIcon className="w-3 h-3" />
                            {doc.status}
                          </div>
                        </td>

                        {/* updated */}
                        <td className="py-3.5 px-3 text-[12px] text-slate-400 dark:text-slate-500 hidden lg:table-cell">{new Date(doc.updated_at).toLocaleDateString()}</td>

                        {/* actions */}
                        <td className="py-3.5 px-3 relative">
                          <button
                            onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === doc.id ? null : doc.id) }}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenu === doc.id && (
                            <ActionsMenu
                              doc={doc}
                              onClose={() => setOpenMenu(null)}
                              onDeleted={(deletedId) => {
                                setDocuments(prev => prev.filter(d => d.id !== deletedId))
                                setOpenMenu(null)
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Showing {sorted.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, sorted.length)} of {sorted.length} documents
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {(['Approved', 'In Review', 'Draft', 'Rejected'] as DocStatus[]).map(s => (
                <div key={s} className="flex items-center gap-1 ml-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    s === 'Approved' ? 'bg-green-500' :
                    s === 'In Review' ? 'bg-amber-500' :
                    s === 'Draft' ? 'bg-slate-400' : 'bg-red-500'
                  }`} />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{documents.filter(d => d.status === s).length} {s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        </>
      )}
    </div>
  )
}
