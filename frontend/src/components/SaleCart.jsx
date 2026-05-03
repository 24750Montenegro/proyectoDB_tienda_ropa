import { Trash2 } from 'lucide-react'
import { EmptyState } from './EmptyState.jsx'

export function SaleCart({ items, total, onRemove }) {
  if (!items.length) {
    return <EmptyState text="Selecciona productos para armar la venta" />
  }

  return (
    <div className="sale-cart">
      <div className="sale-cart-list">
        {items.map((item) => (
          <div className="sale-cart-row" key={item.id_producto}>
            <div>
              <strong>{item.nombre}</strong>
              <span>
                {item.cantidad} x Q{Number(item.precio_venta).toFixed(2)}
              </span>
            </div>
            <div className="sale-cart-amount">
              <span>Q{item.subtotal.toFixed(2)}</span>
              <button className="icon-button danger-icon" type="button" onClick={() => onRemove(item.id_producto)} aria-label="Quitar producto">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="sale-cart-total">
        <span>Total estimado</span>
        <strong>Q{total.toFixed(2)}</strong>
      </div>
    </div>
  )
}
