import { Minus, Plus } from 'lucide-react'

export function ProductSaleCard({ product, quantity, onIncrease, onDecrease, onSetQuantity }) {
  const stock = Number(product.stock_actual || 0)
  const price = Number(product.precio_venta || 0)

  return (
    <article className={`product-sale-card ${quantity > 0 ? 'selected' : ''}`}>
      {product.imagen_url ? (
        <img className="product-sale-image" src={product.imagen_url} alt={product.nombre} />
      ) : null}
      <div>
        <h3>{product.nombre}</h3>
        <p>{product.categoria}</p>
      </div>
      <div className="product-sale-meta">
        <span>Q{price.toFixed(2)}</span>
        <span>Stock {stock}</span>
      </div>
      <div className="quantity-control">
        <button className="icon-button" type="button" onClick={onDecrease} disabled={quantity <= 0} aria-label="Restar unidad">
          <Minus size={16} />
        </button>
        <input
          type="number"
          min="0"
          max={stock}
          value={quantity}
          onChange={(event) => onSetQuantity(Number(event.target.value || 0))}
          aria-label={`Cantidad para ${product.nombre}`}
        />
        <button className="icon-button" type="button" onClick={onIncrease} disabled={quantity >= stock} aria-label="Agregar unidad">
          <Plus size={16} />
        </button>
      </div>
    </article>
  )
}
