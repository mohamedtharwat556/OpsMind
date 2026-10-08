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
 * Enhanced PDF export with professional formatting
 */
export async function exportToPDF(doc: ExportDocument, filename = 'document.pdf') {
  // Dynamically import html2pdf to reduce bundle size
  const html2pdf = (await import('html2pdf.js')).default

  const createdDate = new Date(doc.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const updatedDate = new Date(doc.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const statusColorMap: Record<string, string> = {
    'Approved': '#10b981',
    'In Review': '#f59e0b',
    'Draft': '#6b7280',
    'Rejected': '#ef4444',
  }

  const typeColorMap: Record<string, string> = {
    'SOP': '#3b82f6',
    'Technical Document': '#14b8a6',
    'Operational Case': '#f97316',
    'Organizational Information': '#64748b',
  }

  const element = document.createElement('div')
  element.innerHTML = `
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1f2937;
            line-height: 1.6;
          }
          .page {
            page-break-after: always;
            padding: 40px;
          }
          .header {
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 30px;
            margin-bottom: 30px;
          }
          .header-title {
            font-size: 32px;
            font-weight: 700;
            color: #1a1f2e;
            margin-bottom: 10px;
            word-wrap: break-word;
          }
          .header-code {
            font-size: 14px;
            color: #6b7280;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .metadata {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
          }
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          .meta-label {
            font-size: 12px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 5px;
          }
          .meta-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            color: white;
            width: fit-content;
          }
          .section {
            margin-top: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1a1f2e;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .section-content {
            font-size: 14px;
            line-height: 1.8;
            color: #374151;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          }
          .footer-text {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <div class="header">
            <div class="header-title">${doc.title}</div>
            <div class="header-code">Document Code: ${doc.code}</div>
          </div>

          <!-- Metadata Section -->
          <div class="metadata">
            <div class="meta-item">
              <div class="meta-label">Document Type</div>
              <div class="meta-value">${doc.type}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Status</div>
              <div style="margin-top: 2px;">
                <span class="badge" style="background-color: ${statusColorMap[doc.status] || '#6b7280'}">
                  ${doc.status}
                </span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Version</div>
              <div class="meta-value">v${doc.version}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Owner</div>
              <div class="meta-value">${doc.owner || 'Unknown'}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Created Date</div>
              <div class="meta-value">${createdDate}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Last Updated</div>
              <div class="meta-value">${updatedDate}</div>
            </div>
          </div>

          <!-- Description Section -->
          ${doc.description ? `
            <div class="section">
              <div class="section-title">Description</div>
              <div class="section-content">${doc.description}</div>
            </div>
          ` : ''}

          <!-- Content Section -->
          ${doc.content ? `
            <div class="section">
              <div class="section-title">Content</div>
              <div class="section-content">${doc.content}</div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">Generated from OpsMind Knowledge Base</div>
            <div class="footer-text">${new Date().toLocaleString()}</div>
            <div class="footer-text">This document contains confidential information</div>
          </div>
        </div>
      </body>
    </html>
  `

  const opt: any = {
    margin: [10, 10, 20, 10] as [number, number, number, number],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
  }

  try {
    await html2pdf().set(opt).from(element).save()
  } catch (err) {
    console.error('PDF export failed:', err)
    throw new Error('Failed to generate PDF')
  }
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
 * Export documents to Excel with formatting
 */
export function exportToExcel(documents: ExportDocument[], filename = 'documents.xlsx') {
  const data = documents.map(doc => ({
    'Document ID': doc.id,
    'Title': doc.title,
    'Code': doc.code,
    'Type': doc.type,
    'Status': doc.status,
    'Version': doc.version,
    'Description': doc.description || '',
    'Owner': doc.owner || '',
    'Created': new Date(doc.created_at).toLocaleString(),
    'Updated': new Date(doc.updated_at).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Documents')
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // ID
    { wch: 25 }, // Title
    { wch: 12 }, // Code
    { wch: 18 }, // Type
    { wch: 12 }, // Status
    { wch: 10 }, // Version
    { wch: 30 }, // Description
    { wch: 15 }, // Owner
    { wch: 20 }, // Created
    { wch: 20 }, // Updated
  ]
  worksheet['!cols'] = colWidths

  XLSX.writeFile(workbook, filename)
}

/**
 * Download file utility
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
 * Export documents to JSON with formatting
 */
export function exportToJSON(documents: ExportDocument[], filename = 'documents.json') {
  const json = JSON.stringify(documents, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  downloadFile(blob, filename)
}
