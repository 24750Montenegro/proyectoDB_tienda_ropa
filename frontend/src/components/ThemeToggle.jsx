import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Cambiar modo de color">
      {isDark ? <Moon size={17} /> : <Sun size={17} />}
      <span>{isDark ? 'Oscuro' : 'Claro'}</span>
    </button>
  )
}
