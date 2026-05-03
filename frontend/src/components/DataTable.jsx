import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from './EmptyState.jsx'
import { LoadingState } from './LoadingState.jsx'

export function DataTable({ columns, rows, loading, emptyText = 'No hay datos para mostrar', pageSize = 12 }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [page, pageSize, rows])

  useEffect(() => {
    setPage(1)
  }, [rows])

  if (loading) return <LoadingState />
  if (!rows.length) return <EmptyState text={emptyText} />

  return (
    <div className="table-stack">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, index) => (
              <tr key={row.id_producto || row.id_categoria || row.id_venta || row.id_usuario || row.id_cliente || index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.linkTo ? (
                      <Link className="table-link" to={column.linkTo(row)}>
                        {column.render ? column.render(row) : row[column.key]}
                      </Link>
                    ) : column.render ? (
                      column.render(row)
                    ) : (
                      row[column.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-bar">
        <span>
          Pagina {page} de {totalPages} · {rows.length} registros
        </span>
        <div className="pagination-actions">
          <button className="icon-button" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Pagina anterior">
            <ChevronLeft size={17} />
          </button>
          <button className="icon-button" type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} aria-label="Pagina siguiente">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
