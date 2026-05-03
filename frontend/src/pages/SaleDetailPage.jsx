import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DataTable } from '../components/DataTable.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Section } from '../components/Section.jsx'
import { apiRequest } from '../services/api.js'

export function SaleDetailPage() {
  const { id } = useParams()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSale() {
      setLoading(true)
      setError('')
      try {
        setSale(await apiRequest(`/ventas/${id}`))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSale()
  }, [id])

  return (
    <>
      <PageHeader
        title={`Venta #${id}`}
        description={sale ? `${sale.cliente} atendido por ${sale.empleado}` : 'Detalle de venta'}
        actions={<Link className="secondary-button compact-button" to="/ventas"><ArrowLeft size={16} />Volver</Link>}
      />
      <Notice type="error">{error}</Notice>
      {sale ? (
        <div className="detail-summary">
          <span>Total: Q{Number(sale.total).toFixed(2)}</span>
          <span>Pago: {sale.metodo_pago}</span>
          <span>Estado: {sale.estado}</span>
        </div>
      ) : null}
      <Section title="Productos vendidos">
        <DataTable
          loading={loading}
          rows={sale?.detalle || []}
          columns={[
            { key: 'producto', label: 'Producto' },
            { key: 'cantidad', label: 'Cantidad' },
            { key: 'precio_unitario', label: 'Precio', render: (row) => `Q${Number(row.precio_unitario).toFixed(2)}` },
            { key: 'subtotal', label: 'Subtotal', render: (row) => `Q${Number(row.subtotal).toFixed(2)}` },
          ]}
        />
      </Section>
    </>
  )
}
