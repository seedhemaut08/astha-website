import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import ProductMedallion from './ProductMedallion.jsx';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__media">
        <ProductMedallion category={product.category} name={product.name} size="md" />
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <Link to={`/product/${product.id}`} className="product-card__name">{product.name}</Link>
        <div className="product-card__meta">{product.height} · {product.weight}</div>
        <div className="product-card__row">
          <span className="product-card__price">₹{product.price.toLocaleString('en-IN')}</span>
          <button className="btn btn--ghost btn--sm" onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
