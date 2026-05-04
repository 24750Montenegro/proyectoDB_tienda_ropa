import { ChevronDown, ChevronUp, Eye, ReceiptText, Save, Search, UserPlus, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '../components/DataTable.jsx'
import { FormField } from '../components/FormField.jsx'
import { Modal } from '../components/Modal.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { ProductSaleCard } from '../components/ProductSaleCard.jsx'
import { SaleCart } from '../components/SaleCart.jsx'
import { SearchInput } from '../components/SearchInput.jsx'
import { SearchableSelect } from '../components/SearchableSelect.jsx'
import { Section } from '../components/Section.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { apiRequest } from '../services/api.js'

const paymentMethods = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR']
const emptyClient = { dpi_nit: '', nombre: '', apellido: '', email: '', telefono: '', direccion: '' }

export function SalesPage() {
  const { user } = useAuth()
  const sales = useApiResource('/ventas')
  const products = useApiResource('/productos')
  const [form, setForm] = useState({ metodo_pago: 'EFECTIVO' })
  const [cart, setCart] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [registerOpen, setRegisterOpen] = useState(true)
  const [productFilters, setProductFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '' })
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [saleFilters, setSaleFilters] = useState({ search: '', payment: '', minTotal: '', maxTotal: '' })
  const [newClientOpen, setNewClientOpen] = useState(false)
  const [newClient, setNewClient] = useState(emptyClient)
  const [creatingClient, setCreatingClient] = useState(false)
  const debouncedProductSearch = useDebounce(productFilters.search)
  const debouncedSaleSearch = useDebounce(saleFilters.search)
  const debouncedClientSearch = useDebounce(clientSearch)
  const categoryOptions = useMemo(
    () =>
      [...new Map(products.data.map((product) => [product.id_categoria, product.categoria])).entries()].map(([id, name]) => ({
        value: id,
        label: name,
      })),
    [products.data],
  )

  const cartItems = useMemo(
    () =>
      products.data
        .map((product) => {
          const cantidad = Number(cart[product.id_producto] || 0)
          return {
            ...product,
            cantidad,
            subtotal: Number(product.precio_venta || 0) * cantidad,
          }
        })
        .filter((product) => product.cantidad > 0),
    [cart, products.data],
  )

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  const filteredProductCards = useMemo(() => {
    const term = debouncedProductSearch.trim().toLowerCase()
    const minPrice = productFilters.minPrice === '' ? null : Number(productFilters.minPrice)
    const maxPrice = productFilters.maxPrice === '' ? null : Number(productFilters.maxPrice)

    return products.data.filter((product) =>
      (!term || `${product.nombre} ${product.categoria} ${product.marca || ''} ${product.color || ''}`.toLowerCase().includes(term)) &&
      (!productFilters.category || String(product.id_categoria) === productFilters.category) &&
      (minPrice === null || Number(product.precio_venta || 0) >= minPrice) &&
      (maxPrice === null || Number(product.precio_venta || 0) <= maxPrice),
    )
  }, [debouncedProductSearch, productFilters, products.data])

  const filteredSales = useMemo(() => {
    const term = debouncedSaleSearch.trim().toLowerCase()
    const minTotal = saleFilters.minTotal === '' ? null : Number(saleFilters.minTotal)
    const maxTotal = saleFilters.maxTotal === '' ? null : Number(saleFilters.maxTotal)

    return sales.data.filter((sale) => {
      const totalSale = Number(sale.total || 0)
      const text = `${sale.id_venta} ${sale.cliente} ${sale.empleado} ${sale.metodo_pago} ${sale.estado}`.toLowerCase()
      const matchesText = !term || text.includes(term)
      const matchesPayment = !saleFilters.payment || sale.metodo_pago === saleFilters.payment
      const matchesMin = minTotal === null || totalSale >= minTotal
      const matchesMax = maxTotal === null || totalSale <= maxTotal
      return matchesText && matchesPayment && matchesMin && matchesMax
    })
  }, [debouncedSaleSearch, saleFilters, sales.data])

  useEffect(() => {
    const term = debouncedClientSearch.trim()
    let ignore = false

    async function loadClients() {
      if (!term) {
        setClientResults([])
        return
      }
      try {
        const clients = await apiRequest(`/clientes?q=${encodeURIComponent(term)}&limite=12`)
        if (!ignore) setClientResults(clients)
      } catch (err) {
        if (!ignore) setError(err.message)
      }
    }

    loadClients()
    return () => {
      ignore = true
    }
  }, [debouncedClientSearch])

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function searchClients() {
    setError('')
    try {
      const clients = await apiRequest(`/clientes?q=${encodeURIComponent(clientSearch)}&limite=12`)
      setClientResults(clients)
    } catch (err) {
      setError(err.message)
    }
  }

  function openNewClient() {
    setError('')
    setMessage('')
    setNewClient(emptyClient)
    setNewClientOpen(true)
  }

  function handleNewClientChange(event) {
    setNewClient((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submitNewClient(event) {
    event.preventDefault()
    setError('')
    setCreatingClient(true)
    try {
      const created = await apiRequest('/clientes', { method: 'POST', body: newClient })
      setSelectedClient(created)
      setClientResults([])
      setClientSearch(created.dpi_nit)
      setNewClientOpen(false)
      setNewClient(emptyClient)
      setMessage(`Cliente ${created.nombre} ${created.apellido} creado correctamente`)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreatingClient(false)
    }
  }

  async function useFinalConsumer() {
    setError('')
    try {
      const client = await apiRequest('/clientes/consumidor-final')
      setSelectedClient(client)
      setClientResults([])
      setClientSearch('CF')
    } catch (err) {
      setError(err.message)
    }
  }

  function setProductQuantity(product, value) {
    const stock = Number(product.stock_actual || 0)
    const quantity = Math.max(0, Math.min(stock, Number(value || 0)))
    setCart((current) => ({
      ...current,
      [product.id_producto]: quantity,
    }))
  }

  function increaseProduct(product) {
    setProductQuantity(product, Number(cart[product.id_producto] || 0) + 1)
  }

  function decreaseProduct(product) {
    setProductQuantity(product, Number(cart[product.id_producto] || 0) - 1)
  }

  function removeProduct(id) {
    setCart((current) => ({ ...current, [id]: 0 }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!user?.id_empleado) {
      setError('Tu usuario no tiene un empleado asociado')
      return
    }
    if (!selectedClient?.id_cliente) {
      setError('Selecciona un cliente o usa CF')
      return
    }
    if (!cartItems.length) {
      setError('Selecciona al menos un producto')
      return
    }
    try {
      const payload = {
        id_cliente: Number(selectedClient.id_cliente),
        id_empleado: Number(user.id_empleado),
        metodo_pago: form.metodo_pago,
        items: cartItems.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
        })),
      }
      const sale = await apiRequest('/ventas', { method: 'POST', body: payload })
      setMessage(`Venta registrada con codigo ${sale.id_venta}`)
      setCart({})
      sales.reload()
      products.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <PageHeader title="Ventas" description="Registro transaccional con rollback ante errores de stock." />
      <Notice type="error">{error || sales.error || products.error}</Notice>
      <Notice type="success">{message}</Notice>
      <Section
        title="Registrar venta"
        description="Selecciona cliente, productos y metodo de pago."
        actions={
          <button className="secondary-button compact-button" type="button" onClick={() => setRegisterOpen((current) => !current)}>
            {registerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {registerOpen ? 'Colapsar' : 'Mostrar'}
          </button>
        }
      >
        {registerOpen ? (
          <form className="resource-form" onSubmit={handleSubmit}>
            <div className="form-grid two-cols">
              <div className="info-panel">
                <span className="muted-label">Empleado</span>
                <strong>{user?.empleado || user?.nombre_usuario}</strong>
                <p>ID {user?.id_empleado || 'sin empleado'} - {user?.puesto || user?.rol}</p>
              </div>
              <FormField label="Metodo de pago">
                <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="client-search-block">
              <div className="client-search-row">
                <SearchInput value={clientSearch} onChange={setClientSearch} placeholder="Buscar cliente por NIT, nombre o apellido" />
                <button className="secondary-button" type="button" onClick={searchClients}>
                  <Search size={16} />
                  Buscar
                </button>
                <button className="secondary-button" type="button" onClick={useFinalConsumer}>
                  <UserRound size={16} />
                  Usar CF
                </button>
                <button className="secondary-button" type="button" onClick={openNewClient}>
                  <UserPlus size={16} />
                  Nuevo
                </button>
              </div>
              {selectedClient ? (
                <div className="selected-client">
                  <span className="muted-label">Cliente seleccionado</span>
                  <strong>{selectedClient.nombre} {selectedClient.apellido}</strong>
                  <p>ID {selectedClient.id_cliente} - NIT {selectedClient.dpi_nit}</p>
                </div>
              ) : null}
              {clientResults.length ? (
                <div className="client-result-list">
                  {clientResults.map((client) => (
                    <button className="client-result" type="button" key={client.id_cliente} onClick={() => setSelectedClient(client)}>
                      <strong>{client.nombre} {client.apellido}</strong>
                      <span>ID {client.id_cliente} - NIT {client.dpi_nit}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="sales-workspace">
              <div>
                <div className="filter-search-row">
                  <SearchInput
                    value={productFilters.search}
                    onChange={(value) => setProductFilters((current) => ({ ...current, search: value }))}
                    placeholder="Buscar producto para agregar"
                  />
                </div>
                <div className="filter-grid">
                  <FormField label="Categoria">
                    <SearchableSelect
                      value={productFilters.category}
                      options={categoryOptions}
                      onChange={(value) => setProductFilters((current) => ({ ...current, category: value }))}
                      placeholder="Buscar categoria"
                    />
                  </FormField>
                  <FormField label="Precio minimo">
                    <input type="number" min="0" step="0.01" value={productFilters.minPrice} onChange={(event) => setProductFilters((current) => ({ ...current, minPrice: event.target.value }))} />
                  </FormField>
                  <FormField label="Precio maximo">
                    <input type="number" min="0" step="0.01" value={productFilters.maxPrice} onChange={(event) => setProductFilters((current) => ({ ...current, maxPrice: event.target.value }))} />
                  </FormField>
                </div>
                <div className="product-card-grid">
                  {filteredProductCards.map((product) => (
                    <ProductSaleCard
                      key={product.id_producto}
                      product={product}
                      quantity={Number(cart[product.id_producto] || 0)}
                      onIncrease={() => increaseProduct(product)}
                      onDecrease={() => decreaseProduct(product)}
                      onSetQuantity={(quantity) => setProductQuantity(product, quantity)}
                    />
                  ))}
                </div>
              </div>
              <aside className="cart-panel">
                <SaleCart items={cartItems} total={total} onRemove={removeProduct} />
                <button className="primary-button full-width-button" type="submit" disabled={!cartItems.length || !selectedClient}>
                  <ReceiptText size={16} />
                  Generar venta
                </button>
              </aside>
            </div>
          </form>
        ) : null}
      </Section>
      <Section title="Historial">
        <div className="filter-grid">
          <SearchInput
            value={saleFilters.search}
            onChange={(value) => setSaleFilters((current) => ({ ...current, search: value }))}
            placeholder="Buscar venta, cliente o empleado"
          />
          <FormField label="Metodo de pago">
            <select value={saleFilters.payment} onChange={(event) => setSaleFilters((current) => ({ ...current, payment: event.target.value }))}>
              <option value="">Todos</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Total minimo">
            <input type="number" min="0" step="0.01" value={saleFilters.minTotal} onChange={(event) => setSaleFilters((current) => ({ ...current, minTotal: event.target.value }))} />
          </FormField>
          <FormField label="Total maximo">
            <input type="number" min="0" step="0.01" value={saleFilters.maxTotal} onChange={(event) => setSaleFilters((current) => ({ ...current, maxTotal: event.target.value }))} />
          </FormField>
        </div>
        <DataTable
          loading={sales.loading}
          rows={filteredSales}
          columns={[
            { key: 'id_venta', label: 'Venta', linkTo: (row) => `/ventas/${row.id_venta}`, render: (row) => `#${row.id_venta}` },
            { key: 'cliente', label: 'Cliente' },
            { key: 'empleado', label: 'Empleado' },
            { key: 'metodo_pago', label: 'Pago' },
            { key: 'total', label: 'Total', render: (row) => `Q${Number(row.total).toFixed(2)}` },
            { key: 'estado', label: 'Estado' },
            {
              key: 'detail',
              label: 'Detalle',
              render: (row) => (
                <Link className="secondary-button compact-button" to={`/ventas/${row.id_venta}`}>
                  <Eye size={15} />
                  Ver
                </Link>
              ),
            },
          ]}
        />
      </Section>
      <Modal
        open={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        title="Nuevo cliente"
        description="Registra un cliente y queda seleccionado para esta venta."
      >
        <form className="resource-form" onSubmit={submitNewClient}>
          <div className="form-grid two-cols">
            <FormField label="DPI / NIT">
              <input name="dpi_nit" value={newClient.dpi_nit} onChange={handleNewClientChange} required />
            </FormField>
            <FormField label="Email">
              <input name="email" type="email" value={newClient.email} onChange={handleNewClientChange} />
            </FormField>
            <FormField label="Nombre">
              <input name="nombre" value={newClient.nombre} onChange={handleNewClientChange} required />
            </FormField>
            <FormField label="Apellido">
              <input name="apellido" value={newClient.apellido} onChange={handleNewClientChange} required />
            </FormField>
            <FormField label="Telefono">
              <input name="telefono" value={newClient.telefono} onChange={handleNewClientChange} />
            </FormField>
            <FormField label="Direccion">
              <input name="direccion" value={newClient.direccion} onChange={handleNewClientChange} />
            </FormField>
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={creatingClient}>
              <Save size={16} />
              {creatingClient ? 'Guardando...' : 'Crear cliente'}
            </button>
            <button className="secondary-button" type="button" onClick={() => setNewClientOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
