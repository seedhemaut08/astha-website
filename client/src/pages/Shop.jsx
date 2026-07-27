import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

export default function Shop() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories').then(({ categories }) => setCategories(categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const path = category ? `/products?category=${encodeURIComponent(category)}` : '/products';
    api.get(path)
      .then(({ products }) => setProducts(products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="shop-page">
      <div className="shop-page__header">
        <span className="eyebrow">The Collection</span>
        <h1>{category ? category : 'All Idols'}</h1>
      </div>

      <div className="shop-page__filters">
        <Link to="/shop" className={`chip ${!category ? 'is-active' : ''}`}>All</Link>
        {categories.map(c => (
          <Link key={c} to={`/shop/${encodeURIComponent(c)}`} className={`chip ${category === c ? 'is-active' : ''}`}>
            {c}
          </Link>
        ))}
      </div>

      {loading ? (
        <Loader label="Bringing out the collection..." />
      ) : products.length === 0 ? (
        <p className="empty-state">No idols found in this category yet.</p>
      ) : (
        <div className="product-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
