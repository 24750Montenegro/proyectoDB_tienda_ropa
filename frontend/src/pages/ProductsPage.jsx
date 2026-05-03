import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CsvButton } from '../components/CsvButton.jsx'
import { DataTable } from '../components/DataTable.jsx'
import { FormField } from '../components/FormField.jsx'
import { Modal } from '../components/Modal.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { ProductForm } from '../components/ProductForm.jsx'
import { SearchInput } from '../components/SearchInput.jsx'
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
  const [modalOpen, setModalOpen] = useState(false)
  const [filters, setFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '' })

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice)
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice)

    return products.data.filter((product) => {
      const text = `${product.nombre} ${product.categoria} ${product.marca || ''} ${product.color || ''}`.toLowerCase()
      const price = Number(product.precio_venta || 0)
      const matchesSearch = !search || text.includes(search)
      const matchesCategory = !filters.category || String(product.id_categoria) === filters.category
      const matchesMin = minPrice === null || price >= minPrice
      const matchesMax = maxPrice === null || price <= maxPrice
      return matchesSearch && matchesCategory && matchesMin && matchesMax
    })
  }, [filters, products.data])

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
      setModalOpen(false)
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
        actions={
          <>
            <button className="primary-button" type="button" onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Nuevo producto
            </button>
            <CsvButton filename="productos-weargt.csv" rows={filteredProducts} disabled={products.loading} />
          </>
        }
      />
      <Notice type="error">{error || products.error || categories.error}</Notice>
      <Notice type="success">{message}</Notice>
      <Modal
        open={modalOpen}
        title="Nuevo producto"
        description="Los campos obligatorios validan contra el backend."
        onClose={() => setModalOpen(false)}
      >
        <ProductForm
          form={form}
          categories={categories.data}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Crear producto"
        />
      </Modal>
      <Section
        title="Catalogo"
        actions={
          <button className="secondary-button compact-button" type="button" onClick={products.reload}>
            <RefreshCw size={16} />
            Actualizar
          </button>
        }
      >
        <div className="filter-grid">
          <SearchInput
            value={filters.search}
            onChange={(value) => setFilters((current) => ({ ...current, search: value }))}
            placeholder="Buscar producto, marca o color"
          />
          <FormField label="Categoria">
            <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
              <option value="">Todas</option>
              {categories.data.map((category) => (
                <option key={category.id_categoria} value={category.id_categoria}>{category.nombre}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Precio minimo">
            <input type="number" min="0" step="0.01" value={filters.minPrice} onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))} />
          </FormField>
          <FormField label="Precio maximo">
            <input type="number" min="0" step="0.01" value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))} />
          </FormField>
        </div>
        <DataTable
          loading={products.loading}
          rows={filteredProducts}
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
                  <Link className="secondary-button compact-button" to={`/productos/${row.id_producto}`}>
                    <Edit3 size={15} />
                    Editar
                  </Link>
                  <button className="danger-button compact-button" type="button" onClick={() => handleDelete(row.id_producto)}>
                    <Trash2 size={15} />
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
