import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../services/api.js'

export function useApiResource(path, options = {}) {
  const [data, setData] = useState(options.initialData ?? [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiRequest(path)
      setData(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    // Retrasar apenas la carga si no hay token inmediatamente disponible globalmente
    // Solo relevante para recargas rápidas, porque el estado y el localStorage se re-sincronizan.
    if (!options.deferLoad) {
      load()
    }
  }, [load, options.deferLoad])

  return { data, setData, loading, error, reload: load }
}
