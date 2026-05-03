import { Download } from 'lucide-react'
import { downloadCsv } from '../services/api.js'

export function CsvButton({ filename, rows, disabled }) {
  return (
    <button className="secondary-button compact-button" type="button" disabled={disabled || !rows.length} onClick={() => downloadCsv(filename, rows)}>
      <Download size={16} />
      CSV
    </button>
  )
}
