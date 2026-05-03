import { Save } from 'lucide-react'
import { FormField } from './FormField.jsx'

const genderOptions = ['M', 'F', 'UNISEX', 'NINO', 'NINA']

export function ProductForm({ form, categories, submitting, onChange, onSubmit, submitLabel }) {
  return (
    <form className="resource-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <FormField label="Nombre">
          <input name="nombre" value={form.nombre} onChange={onChange} required />
        </FormField>
        <FormField label="Categoria">
          <select name="id_categoria" value={form.id_categoria} onChange={onChange} required>
            <option value="">Seleccionar</option>
            {categories.map((category) => (
              <option key={category.id_categoria} value={category.id_categoria}>
                {category.nombre}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Marca">
          <input name="marca" value={form.marca} onChange={onChange} />
        </FormField>
        <FormField label="Genero">
          <select name="genero" value={form.genero} onChange={onChange}>
            {genderOptions.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Talla">
          <input name="talla" value={form.talla} onChange={onChange} />
        </FormField>
        <FormField label="Color">
          <input name="color" value={form.color} onChange={onChange} />
        </FormField>
        <FormField label="Precio venta">
          <input name="precio_venta" type="number" min="0" step="0.01" value={form.precio_venta} onChange={onChange} required />
        </FormField>
        <FormField label="Precio costo">
          <input name="precio_costo" type="number" min="0" step="0.01" value={form.precio_costo} onChange={onChange} required />
        </FormField>
        <FormField label="Stock actual">
          <input name="stock_actual" type="number" min="0" value={form.stock_actual} onChange={onChange} />
        </FormField>
        <FormField label="Stock minimo">
          <input name="stock_minimo" type="number" min="0" value={form.stock_minimo} onChange={onChange} />
        </FormField>
      </div>
      <FormField label="Descripcion">
        <textarea name="descripcion" rows="3" value={form.descripcion} onChange={onChange} />
      </FormField>
      <button className="primary-button" type="submit" disabled={submitting}>
        <Save size={16} />
        {submitting ? 'Guardando' : submitLabel}
      </button>
    </form>
  )
}
