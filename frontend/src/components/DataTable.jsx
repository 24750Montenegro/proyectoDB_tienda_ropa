import { Link } from 'react-router-dom'
import { EmptyState } from './EmptyState.jsx'
import { LoadingState } from './LoadingState.jsx'

export function DataTable({ columns, rows, loading, emptyText = 'No hay datos para mostrar' }) {
  if (loading) return <LoadingState />
  if (!rows.length) return <EmptyState text={emptyText} />

  return (
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
          {rows.map((row, index) => (
            <tr key={row.id_producto || row.id_categoria || row.id_venta || row.id_usuario || index}>
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
  )
}
