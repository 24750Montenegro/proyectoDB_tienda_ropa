import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { ProductForm } from '../components/ProductForm.jsx'
import { Section } from '../components/Section.jsx'
import { useApiResource } from '../hooks/useApiResource.js'
import { apiRequest } from '../services/api.js'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const categories = useApiResource('/categorias')
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      setError('')
      try {
        const product = await apiRequest(`/productos/${id}`)
        setForm({
          ...product,
          precio_venta: product.precio_venta ?? '',
          precio_costo: product.precio_costo ?? '',
          descripcion: product.descripcion ?? '',
          talla: product.talla ?? '',
          color: product.color ?? '',
          marca: product.marca ?? '',
          imagen_url: product.imagen_url ?? '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await apiRequest(`/productos/${id}`, {
        method: 'PUT',
        body: {
          ...form,
          id_categoria: Number(form.id_categoria),
          precio_venta: Number(form.precio_venta),
          precio_costo: Number(form.precio_costo),
          stock_actual: Number(form.stock_actual),
          stock_minimo: Number(form.stock_minimo),
        },
      })
      setMessage('Producto actualizado correctamente')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Detalle de producto"
        description="Edicion por ruta dinamica usando parametros de URL."
        actions={<Link className="secondary-button compact-button" to="/productos"><ArrowLeft size={16} />Volver</Link>}
      />
      <Notice type="error">{error || categories.error}</Notice>
      <Notice type="success">{message}</Notice>
      <Section title={loading ? 'Cargando producto' : form?.nombre || 'Producto'} actions={<button className="secondary-button compact-button" type="button" onClick={() => navigate('/productos')}>Cancelar</button>}>
        {form ? (
          <ProductForm
            form={form}
            categories={categories.data}
            submitting={submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
          />
        ) : null}
      </Section>
    </>
  )
}
