import * as XLSX from 'xlsx'

export interface ImportedDocument {
  title: string
  code: string
  type: string
  description?: string
  content?: string
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<ImportedDocument[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const documents: ImportedDocument[] = []

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          
          const doc: ImportedDocument = {
            title: values[1] || '',
            code: values[2] || '',
            type: values[3] || 'Technical Document',
            description: values[6] || '',
            content: '',
          }

          if (doc.title && doc.code) {
            documents.push(doc)
          }
        }

        resolve(documents)
      } catch (err) {
        reject(new Error('Failed to parse CSV: ' + (err as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Parse Excel file
 */
export async function parseExcel(file: File): Promise<ImportedDocument[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(buffer, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(worksheet) as any[]

        const documents: ImportedDocument[] = json
          .filter(row => row.Title && row.Code)
          .map(row => ({
            title: row.Title || '',
            code: row.Code || '',
            type: row.Type || 'Technical Document',
            description: row.Description || '',
            content: row.Content || '',
          }))

        resolve(documents)
      } catch (err) {
        reject(new Error('Failed to parse Excel: ' + (err as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse JSON file
 */
export async function parseJSON(file: File): Promise<ImportedDocument[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const documents: ImportedDocument[] = (Array.isArray(json) ? json : [json])
          .filter(doc => doc.title && doc.code)
          .map(doc => ({
            title: doc.title || '',
            code: doc.code || '',
            type: doc.type || 'Technical Document',
            description: doc.description || '',
            content: doc.content || '',
          }))

        resolve(documents)
      } catch (err) {
        reject(new Error('Failed to parse JSON: ' + (err as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Detect file type and parse accordingly
 */
export async function parseImportFile(file: File): Promise<ImportedDocument[]> {
  const filename = file.name.toLowerCase()

  if (filename.endsWith('.csv')) {
    return parseCSV(file)
  } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
    return parseExcel(file)
  } else if (filename.endsWith('.json')) {
    return parseJSON(file)
  } else {
    throw new Error('Unsupported file format. Please use CSV, Excel, or JSON.')
  }
}
