import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CsvButton } from '../components/CsvButton.jsx'
import { DataTable } from '../components/DataTable.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { ProductForm } from '../components/ProductForm.jsx'
import { Section } from '../components/Section.jsx'
import { useApiResource } from '../hooks/useApiResource.js'
import { apiRequest } from '../services/api.js'

const emptyProduct = {
  id_categoria: '',
  nombre: '',
  descripcion: '',
  talla: '',
  color: '',
  marca: '',
  genero: 'UNISEX',
  precio_venta: '',
  precio_costo: '',
  stock_actual: 0,
  stock_minimo: 0,
}

function normalizeProduct(form) {
  return {
    ...form,
    id_categoria: Number(form.id_categoria),
    precio_venta: Number(form.precio_venta),
    precio_costo: Number(form.precio_costo),
    stock_actual: Number(form.stock_actual || 0),
    stock_minimo: Number(form.stock_minimo || 0),
  }
}

export function ProductsPage() {
  const products = useApiResource('/productos')
  const categories = useApiResource('/categorias')
  const [form, setForm] = useState(emptyProduct)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await apiRequest('/productos', { method: 'POST', body: normalizeProduct(form) })
      setForm(emptyProduct)
      setMessage('Producto creado correctamente')
      products.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    setMessage('')
    try {
      await apiRequest(`/productos/${id}`, { method: 'DELETE' })
      setMessage('Producto eliminado correctamente')
      products.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <PageHeader
        title="Productos"
        description="CRUD completo del catalogo de prendas."
        actions={<CsvButton filename="productos-weargt.csv" rows={products.data} disabled={products.loading} />}
      />
      <Notice type="error">{error || products.error || categories.error}</Notice>
      <Notice type="success">{message}</Notice>
      <Section title="Nuevo producto" description="Los campos obligatorios validan contra el backend.">
        <ProductForm
          form={form}
          categories={categories.data}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Crear producto"
        />
      </Section>
      <Section
        title="Catalogo"
        actions={
          <button className="secondary-button compact-button" type="button" onClick={products.reload}>
            <RefreshCw size={16} />
            Actualizar
          </button>
        }
      >
        <DataTable
          loading={products.loading}
          rows={products.data}
          columns={[
            { key: 'nombre', label: 'Producto', linkTo: (row) => `/productos/${row.id_producto}` },
            { key: 'categoria', label: 'Categoria' },
            { key: 'marca', label: 'Marca' },
            { key: 'precio_venta', label: 'Precio', render: (row) => `Q${Number(row.precio_venta).toFixed(2)}` },
            { key: 'stock_actual', label: 'Stock' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="row-actions">
                  <Link className="secondary-button compact-button" to={`/productos/${row.id_producto}`}>Editar</Link>
                  <button className="danger-button compact-button" type="button" onClick={() => handleDelete(row.id_producto)}>
                    <Plus className="rotate-icon" size={15} />
                    Eliminar
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Section>
    </>
  )
}
