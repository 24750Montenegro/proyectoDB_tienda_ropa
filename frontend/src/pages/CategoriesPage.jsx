import { Edit3, Save, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useState } from 'react'
import { DataTable } from '../components/DataTable.jsx'
import { FormField } from '../components/FormField.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { SearchInput } from '../components/SearchInput.jsx'
import { Section } from '../components/Section.jsx'
import { useApiResource } from '../hooks/useApiResource.js'
import { apiRequest } from '../services/api.js'

const emptyCategory = { nombre: '', descripcion: '' }

export function CategoriesPage() {
  const categories = useApiResource('/categorias')
  const [form, setForm] = useState(emptyCategory)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return categories.data
    return categories.data.filter((category) =>
      `${category.nombre} ${category.descripcion || ''}`.toLowerCase().includes(term),
    )
  }, [categories.data, search])

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function editCategory(category) {
    setEditingId(category.id_categoria)
    setForm({ nombre: category.nombre, descripcion: category.descripcion || '' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const method = editingId ? 'PUT' : 'POST'
      const path = editingId ? `/categorias/${editingId}` : '/categorias'
      await apiRequest(path, { method, body: form })
      setForm(emptyCategory)
      setEditingId(null)
      setMessage(editingId ? 'Categoria actualizada correctamente' : 'Categoria creada correctamente')
      categories.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteCategory(id) {
    setError('')
    setMessage('')
    try {
      await apiRequest(`/categorias/${id}`, { method: 'DELETE' })
      setMessage('Categoria eliminada correctamente')
      categories.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <PageHeader title="Categorias" description="CRUD completo para agrupar productos." />
      <Notice type="error">{error || categories.error}</Notice>
      <Notice type="success">{message}</Notice>
      <Section title={editingId ? 'Editar categoria' : 'Nueva categoria'}>
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-grid two-cols">
            <FormField label="Nombre">
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </FormField>
            <FormField label="Descripcion">
              <input name="descripcion" value={form.descripcion} onChange={handleChange} />
            </FormField>
          </div>
          <div className="form-actions">
            <button className="primary-button" type="submit">
              <Save size={16} />
              {editingId ? 'Guardar cambios' : 'Crear categoria'}
            </button>
            {editingId ? (
              <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(emptyCategory) }}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </Section>
      <Section title="Listado">
        <div className="filter-grid">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar categoria" />
        </div>
        <DataTable
          loading={categories.loading}
          rows={filteredCategories}
          columns={[
            { key: 'nombre', label: 'Categoria' },
            { key: 'descripcion', label: 'Descripcion' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="row-actions">
                  <button className="secondary-button compact-button" type="button" onClick={() => editCategory(row)}>
                    <Edit3 size={15} />
                    Editar
                  </button>
                  <button className="danger-button compact-button" type="button" onClick={() => deleteCategory(row.id_categoria)}>
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
