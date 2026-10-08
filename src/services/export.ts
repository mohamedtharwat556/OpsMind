import * as XLSX from 'xlsx'

interface ExportDocument {
  id: string
  title: string
  code: string
  type: string
  status: string
  version: string
  description?: string
  content?: string
  owner?: string
  created_at: string
  updated_at: string
}

/**
 * Export documents to CSV
 */
export function exportToCSV(documents: ExportDocument[], filename = 'documents.csv') {
  const csvData = [
    ['ID', 'Title', 'Code', 'Type', 'Status', 'Version', 'Description', 'Owner', 'Created', 'Updated'],
    ...documents.map(doc => [
      doc.id,
      doc.title,
      doc.code,
      doc.type,
      doc.status,
      doc.version,
      doc.description || '',
      doc.owner || '',
      new Date(doc.created_at).toLocaleString(),
      new Date(doc.updated_at).toLocaleString(),
    ]),
  ]

  const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, filename)
}

/**
 * Export documents to Excel
 */
export function exportToExcel(documents: ExportDocument[], filename = 'documents.xlsx') {
  const data = documents.map(doc => ({
    ID: doc.id,
    Title: doc.title,
    Code: doc.code,
    Type: doc.type,
    Status: doc.status,
    Version: doc.version,
    Description: doc.description || '',
    Owner: doc.owner || '',
    Created: new Date(doc.created_at).toLocaleString(),
    Updated: new Date(doc.updated_at).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents')
  
  // Auto-fit columns
  const maxWidth = 30
  const colWidths = Object.keys(data[0] || {}).map(() => maxWidth)
  worksheet['!cols'] = colWidths.map(w => ({ wch: w }))

  XLSX.writeFile(workbook, filename)
}

/**
 * Export document to PDF (uses html2pdf)
 */
export async function exportToPDF(doc: ExportDocument, filename = 'document.pdf') {
  // Dynamically import html2pdf to reduce bundle size
  const html2pdf = (await import('html2pdf.js')).default

  const element = document.createElement('div')
  element.innerHTML = `
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      h1 { color: #1a1f2e; margin-bottom: 5px; }
      .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
      .section { margin-top: 20px; }
      .label { font-weight: bold; color: #1a1f2e; margin-top: 10px; }
      .value { color: #333; line-height: 1.6; }
    </style>
    <h1>${doc.title}</h1>
    <div class="meta">
      <p><strong>Code:</strong> ${doc.code}</p>
      <p><strong>Type:</strong> ${doc.type} | <strong>Status:</strong> ${doc.status} | <strong>Version:</strong> ${doc.version}</p>
      <p><strong>Owner:</strong> ${doc.owner || 'Unknown'}</p>
      <p><strong>Created:</strong> ${new Date(doc.created_at).toLocaleDateString()} | <strong>Updated:</strong> ${new Date(doc.updated_at).toLocaleDateString()}</p>
    </div>
    ${doc.description ? `
      <div class="section">
        <div class="label">Description</div>
        <div class="value">${doc.description}</div>
      </div>
    ` : ''}
    ${doc.content ? `
      <div class="section">
        <div class="label">Content</div>
        <div class="value">${doc.content}</div>
      </div>
    ` : ''}
  `

  const opt: any = {
    margin: 10,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  }

  html2pdf().set(opt).from(element).save()
}

/**
 * Download file
 */
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export documents to JSON
 */
export function exportToJSON(documents: ExportDocument[], filename = 'documents.json') {
  const json = JSON.stringify(documents, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  downloadFile(blob, filename)
}
