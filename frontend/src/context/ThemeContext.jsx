import { useEffect, useMemo, useReducer } from 'react'
import { ThemeContext } from './themeContext.js'

function getInitialTheme() {
  const saved = localStorage.getItem('weargt_theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function themeReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return state === 'dark' ? 'light' : 'dark'
    case 'SET':
      return action.payload
    default:
      return state
  }
}

export function ThemeProvider({ children }) {
  const [theme, dispatch] = useReducer(themeReducer, getInitialTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('weargt_theme', theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => dispatch({ type: 'TOGGLE' }),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
