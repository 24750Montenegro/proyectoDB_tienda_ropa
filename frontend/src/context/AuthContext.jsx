import { useEffect, useMemo, useReducer } from 'react'
import { AuthContext } from './authContext.js'
import { apiRequest, setAuthToken } from '../services/api.js'

const initialState = {
  token: localStorage.getItem('weargt_token'),
  user: JSON.parse(localStorage.getItem('weargt_user') || 'null'),
  status: 'idle',
  error: '',
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, status: 'loading', error: '' }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        status: 'authenticated',
        token: action.payload.token,
        user: action.payload.usuario,
        error: '',
      }
    case 'LOGIN_ERROR':
      return { ...state, status: 'idle', error: action.payload }
    case 'LOGOUT':
      return { ...initialState, token: null, user: null, status: 'idle', error: '' }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    setAuthToken(state.token)
    if (state.token) {
      localStorage.setItem('weargt_token', state.token)
      localStorage.setItem('weargt_user', JSON.stringify(state.user))
      return
    }
    localStorage.removeItem('weargt_token')
    localStorage.removeItem('weargt_user')
  }, [state.token, state.user])

  async function login(credentials) {
    dispatch({ type: 'LOGIN_START' })
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: credentials,
        skipAuth: true,
      })
      dispatch({ type: 'LOGIN_SUCCESS', payload: data })
      return data
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      throw error
    }
  }

  function logout() {
    dispatch({ type: 'LOGOUT' })
  }

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      isAdmin: state.user?.rol === 'ADMIN',
      login,
      logout,
    }),
    [state],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
