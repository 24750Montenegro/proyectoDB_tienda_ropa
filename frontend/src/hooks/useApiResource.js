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
    load()
  }, [load])

  return { data, setData, loading, error, reload: load }
}
