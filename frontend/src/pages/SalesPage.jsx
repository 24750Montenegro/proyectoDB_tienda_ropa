import { Eye, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { DataTable } from '../components/DataTable.jsx'
import { FormField } from '../components/FormField.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { ProductSaleCard } from '../components/ProductSaleCard.jsx'
import { SaleCart } from '../components/SaleCart.jsx'
import { Section } from '../components/Section.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { apiRequest } from '../services/api.js'

const paymentMethods = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR']

export function SalesPage() {
  const { user } = useAuth()
  const sales = useApiResource('/ventas')
  const products = useApiResource('/productos')
  const [form, setForm] = useState({ id_cliente: 1, metodo_pago: 'EFECTIVO' })
  const [cart, setCart] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
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
    if (!cartItems.length) {
      setError('Selecciona al menos un producto')
      return
    }
    try {
      const payload = {
        id_cliente: Number(form.id_cliente),
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
      <Section title="Registrar venta" description="El empleado se toma del usuario autenticado.">
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-grid two-cols">
            <FormField label="ID cliente">
              <input name="id_cliente" type="number" min="1" value={form.id_cliente} onChange={handleChange} required />
            </FormField>
            <FormField label="Metodo de pago">
              <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="sales-workspace">
            <div className="product-card-grid">
              {products.data.map((product) => (
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
            <aside className="cart-panel">
              <SaleCart items={cartItems} total={total} onRemove={removeProduct} />
              <button className="primary-button full-width-button" type="submit" disabled={!cartItems.length}>
                <ReceiptText size={16} />
                Generar venta
              </button>
            </aside>
          </div>
        </form>
      </Section>
      <Section title="Historial">
        <DataTable
          loading={sales.loading}
          rows={sales.data}
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
    </>
  )
}
