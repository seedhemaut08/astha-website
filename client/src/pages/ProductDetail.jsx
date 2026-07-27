import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext.jsx';
import ProductMedallion from '../components/ProductMedallion.jsx';
import Loader from '../components/Loader.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    api.get(`/products/${id}`)
      .then(({ product }) => setProduct(product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-pad"><Loader label="Fetching details..." /></div>;
  if (!product) return <div className="page-pad empty-state">This idol could not be found. <Link to="/shop">Back to shop</Link></div>;

  function handleAdd() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="product-detail">
      <div className="product-detail__media">
        <ProductMedallion category={product.category} name={product.name} size="lg" />
      </div>
      <div className="product-detail__info">
        <span className="eyebrow">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="product-detail__price">₹{product.price.toLocaleString('en-IN')}</p>
        <p className="product-detail__desc">{product.description}</p>

        <dl className="product-detail__specs">
          <div><dt>Height</dt><dd>{product.height}</dd></div>
          <div><dt>Weight</dt><dd>{product.weight}</dd></div>
          <div><dt>Availability</dt><dd>{product.inStock ? 'In Stock' : 'Made to Order'}</dd></div>
        </dl>

        <div className="product-detail__actions">
          <div className="qty-stepper">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">+</button>
          </div>
          <button className="btn btn--primary" onClick={handleAdd}>
            {added ? 'Added to Cart ✓' : 'Add to Cart'}
          </button>
        </div>

        <p className="product-detail__note">
          Every Astha idol is hand-finished — slight variations in detailing are a mark of the craft, not a flaw.
        </p>
      </div>
    </div>
  );
}
