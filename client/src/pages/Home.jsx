import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import SectionDivider from '../components/SectionDivider.jsx';
import Loader from '../components/Loader.jsx';

const CATEGORIES = [
  { name: 'Ganesh Ji', tag: 'ग', blurb: 'Beginnings, blessed.' },
  { name: 'Lakshmi Ji', tag: 'ल', blurb: 'Prosperity, at home.' },
  { name: 'Hanuman Ji', tag: 'ह', blurb: 'Strength, standing guard.' },
  { name: 'Shiv Ji', tag: 'श', blurb: 'Stillness, in silver.' }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(({ products }) => setProducts(products.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">Handcrafted in India</span>
          <h1 className="hero__title">
            Faith, cast in <em>pure silver</em>.
          </h1>
          <p className="hero__subtitle">
            Astha crafts heirloom silver idols — Ganesh, Lakshmi, Hanuman and Shiv — for the home
            mandir, for gifting, for the moments that ask for something sacred.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn--primary">Explore the Collection</Link>
            <Link to="/about" className="btn btn--outline">Our Craft</Link>
          </div>
        </motion.div>
        <div className="hero__medallion" aria-hidden="true">
          <span>ॐ</span>
        </div>
      </section>

      <section className="section categories">
        <SectionDivider />
        <h2 className="section__title">Shop by Devotion</h2>
        <p className="section__subtitle">Every idol is chosen for a reason. Which is yours?</p>
        <div className="categories__grid">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.name} to={`/shop/${encodeURIComponent(cat.name)}`} className="category-tile" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="category-tile__symbol">{cat.tag}</span>
              <span className="category-tile__name">{cat.name}</span>
              <span className="category-tile__blurb">{cat.blurb}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section featured">
        <SectionDivider />
        <h2 className="section__title">The Featured Edit</h2>
        <p className="section__subtitle">A few pieces our patrons return for, again and again.</p>
        {loading ? (
          <Loader label="Curating the collection..." />
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div className="featured__cta">
          <Link to="/shop" className="btn btn--outline">View Full Collection</Link>
        </div>
      </section>

      <section className="section craft-banner">
        <div className="craft-banner__inner">
          <span className="eyebrow">The Astha Promise</span>
          <h2>Every idol, hand-finished. Every order, personal.</h2>
          <p>
            From the first sketch to the final polish, each Astha murti passes through the hands
            of artisans who have spent decades perfecting the craft. No two pieces are rushed.
          </p>
          <div className="craft-banner__stats">
            <div><strong>25+</strong><span>Years of Craft</span></div>
            <div><strong>100%</strong><span>Hand-Finished</span></div>
            <div><strong>1000+</strong><span>Homes Blessed</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
