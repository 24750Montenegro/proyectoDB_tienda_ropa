import { Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { DataTable } from '../components/DataTable.jsx'
import { FormField } from '../components/FormField.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Section } from '../components/Section.jsx'
import { useApiResource } from '../hooks/useApiResource.js'
import { apiRequest } from '../services/api.js'

const paymentMethods = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR']

export function SalesPage() {
  const sales = useApiResource('/ventas')
  const products = useApiResource('/productos')
  const [form, setForm] = useState({ id_cliente: 1, id_empleado: 1, metodo_pago: 'EFECTIVO' })
  const [items, setItems] = useState([{ id_producto: '', cantidad: 1 }])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updateItem(index, key, value) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)))
  }

  function addItem() {
    setItems((current) => [...current, { id_producto: '', cantidad: 1 }])
  }

  function removeItem(index) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const payload = {
        id_cliente: Number(form.id_cliente),
        id_empleado: Number(form.id_empleado),
        metodo_pago: form.metodo_pago,
        items: items.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
        })),
      }
      const sale = await apiRequest('/ventas', { method: 'POST', body: payload })
      setMessage(`Venta registrada con codigo ${sale.id_venta}`)
      setItems([{ id_producto: '', cantidad: 1 }])
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
      <Section title="Registrar venta" description="Usa clientes y empleados seed por ID para mantener el flujo simple.">
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-grid three-cols">
            <FormField label="ID cliente">
              <input name="id_cliente" type="number" min="1" value={form.id_cliente} onChange={handleChange} required />
            </FormField>
            <FormField label="ID empleado">
              <input name="id_empleado" type="number" min="1" value={form.id_empleado} onChange={handleChange} required />
            </FormField>
            <FormField label="Metodo de pago">
              <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="items-stack">
            {items.map((item, index) => (
              <div className="sale-item-row" key={`${index}-${item.id_producto}`}>
                <FormField label="Producto">
                  <select value={item.id_producto} onChange={(event) => updateItem(index, 'id_producto', event.target.value)} required>
                    <option value="">Seleccionar producto</option>
                    {products.data.map((product) => (
                      <option key={product.id_producto} value={product.id_producto}>
                        {product.nombre} - stock {product.stock_actual}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Cantidad">
                  <input type="number" min="1" value={item.cantidad} onChange={(event) => updateItem(index, 'cantidad', event.target.value)} required />
                </FormField>
                <button className="icon-button danger-icon" type="button" onClick={() => removeItem(index)} aria-label="Quitar producto">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={addItem}>
              <Plus size={16} />
              Agregar producto
            </button>
            <button className="primary-button" type="submit">Registrar venta</button>
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
            { key: 'detail', label: 'Detalle', render: (row) => <Link className="secondary-button compact-button" to={`/ventas/${row.id_venta}`}>Ver</Link> },
          ]}
        />
      </Section>
    </>
  )
}
