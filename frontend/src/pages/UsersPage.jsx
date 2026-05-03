import { Save } from 'lucide-react'
import { useState } from 'react'
import { FormField } from '../components/FormField.jsx'
import { Notice } from '../components/Notice.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Section } from '../components/Section.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { apiRequest } from '../services/api.js'

export function UsersPage() {
  const { isAdmin } = useAuth()
  const [form, setForm] = useState({ nombre_usuario: '', password: '', rol: 'VENDEDOR', id_empleado: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await apiRequest('/usuarios', {
        method: 'POST',
        body: {
          ...form,
          id_empleado: form.id_empleado ? Number(form.id_empleado) : null,
        },
      })
      setForm({ nombre_usuario: '', password: '', rol: 'VENDEDOR', id_empleado: '' })
      setMessage('Usuario creado correctamente')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <PageHeader title="Usuarios" description="Alta de usuarios protegida por rol ADMIN." />
      {!isAdmin ? <Notice type="error">Solo un usuario ADMIN puede crear nuevas cuentas.</Notice> : null}
      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>
      <Section title="Nuevo usuario">
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-grid two-cols">
            <FormField label="Usuario">
              <input name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange} required disabled={!isAdmin} />
            </FormField>
            <FormField label="Contrasena">
              <input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} required disabled={!isAdmin} />
            </FormField>
            <FormField label="Rol">
              <select name="rol" value={form.rol} onChange={handleChange} disabled={!isAdmin}>
                <option value="VENDEDOR">VENDEDOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </FormField>
            <FormField label="ID empleado">
              <input name="id_empleado" type="number" min="1" value={form.id_empleado} onChange={handleChange} disabled={!isAdmin} />
            </FormField>
          </div>
          <button className="primary-button" type="submit" disabled={!isAdmin}>
            <Save size={16} />
            Crear usuario
          </button>
        </form>
      </Section>
    </>
  )
}
