import { Link } from 'react-router-dom'
import { DataTable } from '../components/DataTable.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Section } from '../components/Section.jsx'
import { StatCard } from '../components/StatCard.jsx'
import { useApiResource } from '../hooks/useApiResource.js'

export function DashboardPage() {
  const products = useApiResource('/productos')
  const sales = useApiResource('/ventas')
  const lowStock = useApiResource('/reportes/productos-bajo-stock')

  const inventoryValue = products.data.reduce((total, product) => total + Number(product.precio_venta || 0) * Number(product.stock_actual || 0), 0)

  return (
    <>
      <PageHeader
        title="Panel de control"
        description="Resumen operativo conectado a la base de datos PostgreSQL."
        actions={<Link className="primary-button" to="/ventas">Nueva venta</Link>}
      />
      <Notice type="error">{products.error || sales.error || lowStock.error}</Notice>
      <div className="stats-grid">
        <StatCard label="Productos" value={products.data.length} detail="Catalogo activo" />
        <StatCard label="Ventas" value={sales.data.length} detail="Registros historicos" />
        <StatCard label="Bajo stock" value={lowStock.data.length} detail="Requieren atencion" />
        <StatCard label="Valor inventario" value={`Q${inventoryValue.toFixed(2)}`} detail="Precio de venta" />
      </div>
      <Section title="Productos con bajo stock" description="Reporte alimentado por una vista SQL.">
        <DataTable
          loading={lowStock.loading}
          rows={lowStock.data.slice(0, 8)}
          columns={[
            { key: 'producto', label: 'Producto' },
            { key: 'categoria', label: 'Categoria' },
            { key: 'stock_actual', label: 'Stock' },
            { key: 'stock_minimo', label: 'Minimo' },
            { key: 'faltante', label: 'Faltante' },
          ]}
        />
      </Section>
    </>
  )
}
