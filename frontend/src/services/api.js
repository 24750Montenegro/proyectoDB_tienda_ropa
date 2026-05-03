const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

let authToken = localStorage.getItem('weargt_token')

export function setAuthToken(token) {
  authToken = token
}

export async function apiRequest(path, options = {}) {
  const { body, skipAuth = false, headers = {}, ...config } = options
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (!skipAuth && authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...config,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return null

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo completar la solicitud')
  }

  return data
}

export function buildCsv(rows) {
  if (!rows.length) return ''
  const columns = Object.keys(rows[0])
  const escapeCell = (value) => {
    const text = value === null || value === undefined ? '' : String(value)
    return `"${text.replaceAll('"', '""')}"`
  }
  return [columns.join(','), ...rows.map((row) => columns.map((key) => escapeCell(row[key])).join(','))].join('\n')
}

export function downloadCsv(filename, rows) {
  const csv = buildCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
