import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

/* ============================================================
   SHOP CATEGORIES
   ============================================================ */

const SHOP_CATEGORIES = [
  'Ganesh Ji',
  'Lakshmi Ji',
  'Krishnaleela Clock',
  'Peacock',
  'Krishna Ji'
];


export default function Shop() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  /* ============================================================
     LOAD PRODUCTS
     ============================================================ */

  useEffect(() => {
    setLoading(true);

    const path = category
      ? `/products?category=${encodeURIComponent(category)}`
      : '/products';

    api
      .get(path)
      .then(({ products }) => {
        setProducts(products);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [category]);


  return (
    <div className="shop-page">

      {/* ======================================================
          SHOP HEADER
      ====================================================== */}

      <div className="shop-page__header">

        <span className="eyebrow">
          The Collection
        </span>

        <h1>
          {category ? category : 'All Idols'}
        </h1>

      </div>


      {/* ======================================================
          CATEGORY FILTERS
      ====================================================== */}

      <div className="shop-page__filters">

        {/* ALL */}
        <Link
          to="/shop"
          className={`chip ${!category ? 'is-active' : ''}`}
        >
          All
        </Link>


        {/* CUSTOM CATEGORIES */}
        {SHOP_CATEGORIES.map((c) => (

          <Link
            key={c}
            to={`/shop/${encodeURIComponent(c)}`}
            className={`chip ${
              category === c ? 'is-active' : ''
            }`}
          >
            {c}
          </Link>

        ))}

      </div>


      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      {loading ? (

        <Loader label="Bringing out the collection..." />

      ) : products.length === 0 ? (

        <p className="empty-state">
          No idols found in this category yet.
        </p>

      ) : (

        <div className="product-grid">

          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
            />
          ))}

        </div>

      )}

    </div>
  );
}