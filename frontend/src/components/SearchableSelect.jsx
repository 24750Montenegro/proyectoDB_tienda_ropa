import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce.js'

export function SearchableSelect({ value, options, onChange, placeholder = 'Seleccionar' }) {
  const selected = options.find((option) => String(option.value) === String(value))
  const [query, setQuery] = useState(selected?.label || '')
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    setQuery(selected?.label || '')
  }, [selected?.label])

  const filteredOptions = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }, [debouncedQuery, options])

  function selectOption(option) {
    onChange(String(option.value))
    setQuery(option.label)
    setOpen(false)
  }

  function clearSelection() {
    onChange('')
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="searchable-select">
      <div className="searchable-select-control">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
        />
        <ChevronDown size={16} />
      </div>
      {open ? (
        <div className="searchable-select-menu">
          <button type="button" onMouseDown={clearSelection}>
            Todas
          </button>
          {filteredOptions.map((option) => (
            <button type="button" key={option.value} onMouseDown={() => selectOption(option)}>
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
