import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Notice } from '../components/Notice.jsx'
import { ThemeToggle } from '../components/ThemeToggle.jsx'
import { useAuth } from '../hooks/useAuth.js'

export function LoginPage() {
  const [form, setForm] = useState({ nombre_usuario: '', password: '' })
  const { login, status, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await login(form)
    navigate(location.state?.from?.pathname || '/', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <span>WearGT</span>
          <ThemeToggle />
        </div>
        <div className="login-copy">
          <p className="eyebrow">Inventario y ventas</p>
          <h1>Control operativo para tienda de ropa</h1>
          <p>Gestiona productos, categorias, ventas y reportes SQL desde una interfaz protegida.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <Notice type="error">{error}</Notice>
          <label>
            <span>Usuario</span>
            <input name="nombre_usuario" value={form.nombre_usuario} onChange={handleChange} autoComplete="username" placeholder="admin" required />
          </label>
          <label>
            <span>Contrasena</span>
            <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" placeholder="admin123" required />
          </label>
          <button className="primary-button" type="submit" disabled={status === 'loading'}>
            <LogIn size={17} />
            {status === 'loading' ? 'Entrando' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
