import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { api } from '../api';
import ProductCard from '../components/ProductCard.jsx';
import ProductMedallion from '../components/ProductMedallion.jsx';
import SectionDivider from '../components/SectionDivider.jsx';
import Loader from '../components/Loader.jsx';


/* ============================================================
   DEVOTION CATEGORIES
   ============================================================ */

const CATEGORIES = [
  {
    name: 'Ganesh Ji',
    tag: 'ग',
    blurb: 'Beginnings, blessed.',
    image: '/images/devotion/ganesh.webp',
    video: '/images/devotion/ganeshr.mp4'
  },
  {
    name: 'Lakshmi Ji',
    tag: 'ल',
    blurb: 'Prosperity, at home.',
    image: '/images/devotion/lakshmi.png',
    video: '/images/devotion/lakshmir.mp4'
  },
  {
    name: 'Krishnaleela Clock',
    tag: 'क',
    blurb: 'Divine time, eternal stories.',
    image: '/images/devotion/ghadi.png',
    video: '/images/devotion/clockr.mp4'
  },
  {
    name: 'Peacock',
    tag: 'म',
    blurb: 'Stillness, in silver.',
    image: '/images/devotion/mor.png',
    video: '/images/devotion/morr.mp4'
  }
];


/* ============================================================
   FEATURED CATEGORY ORDER
   ============================================================

   We deliberately keep only ONE product from each category
   inside the Featured Edit.

   This prevents:

   Cow & Calf
   Candle Stand
   Shankh
   Swan
   Photo Frame

   from appearing as duplicate products in Featured Edit.
   ============================================================ */

const FEATURED_CATEGORY_ORDER = [
  'Kaamdhenu',
  'Candle Stand',
  'Shankh',
  'Swan',
  'Photo Frame'
];


/* ============================================================
   NORMALIZE CATEGORY
   ============================================================ */

const normalizeCategory = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase();
};


/* ============================================================
   GET FEATURED PRODUCTS
   ============================================================

   Rules:

   1. Only one product from each category.
   2. Category order is controlled by
      FEATURED_CATEGORY_ORDER.
   3. If a category has no product, it is skipped.
   4. Duplicate product IDs are never added.
   ============================================================ */

const getFeaturedProducts = (allProducts) => {
  if (!Array.isArray(allProducts)) {
    return [];
  }

  const selectedProducts = [];
  const usedProductIds = new Set();

  FEATURED_CATEGORY_ORDER.forEach((categoryName) => {
    const targetCategory = normalizeCategory(categoryName);

    const matchingProduct = allProducts.find((product) => {
      if (!product || !product.id) {
        return false;
      }

      if (usedProductIds.has(product.id)) {
        return false;
      }

      return normalizeCategory(product.category) === targetCategory;
    });

    if (matchingProduct) {
      selectedProducts.push(matchingProduct);
      usedProductIds.add(matchingProduct.id);
    }
  });

  return selectedProducts;
};


/* ============================================================
   HOME PAGE
   ============================================================ */

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  /* ==========================================================
     LOAD FEATURED PRODUCTS
     ========================================================== */

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await api.get('/products');

        const allProducts = Array.isArray(response?.products)
          ? response.products
          : [];

        /*
         * ------------------------------------------------------
         * FEATURED EDIT
         * ------------------------------------------------------
         *
         * We DO NOT simply display the first four products.
         *
         * Instead:
         *
         * Cow & Calf      → one product
         * Candle Stand    → one product
         * Shankh          → one product
         * Swan            → one product
         * Photo Frame     → one product
         *
         * Therefore the same category cannot fill multiple
         * Featured Edit cards.
         */

        const featuredProducts = getFeaturedProducts(allProducts);

        if (isMounted) {
          setProducts(featuredProducts);
        }
      } catch (error) {
        console.error('Failed to load featured products:', error);

        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);


  /* ==========================================================
     RETURN
     ========================================================== */

  return (
    <div className="home-page">


      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="hero">


        {/* ===================================================
            FULL HERO IMAGE

            Image:
            public/images/HP SILVER.png
        ==================================================== */}

        <img
          src="/images/HP%20SILVER.png"
          alt="Astha Silver handcrafted collection"
          className="hero__image"
        />


        {/* ===================================================
            DARK OVERLAY

            Keeps the left side dark so text is clearly visible.
        ==================================================== */}

        <div
          className="hero__overlay"
          aria-hidden="true"
        />


        {/* ===================================================
            CINEMATIC GRADIENT
        ==================================================== */}

        <div
          className="hero__gradient"
          aria-hidden="true"
        />


        {/* ===================================================
            HERO CONTENT
        ==================================================== */}

        <motion.div
          className="hero__content"

          initial={{
            opacity: 0,
            y: 24
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1]
          }}
        >


          {/* =================================================
              WELCOME TEXT
          ================================================== */}

          <span className="eyebrow">
            Welcome to
          </span>


          {/* =================================================
              ASTHA BRAND NAME
          ================================================== */}

          <h1 className="hero__title">
            Aastha
          </h1>


          {/* =================================================
              DECORATIVE LINE
          ================================================== */}

          <div
            className="hero__brand-divider"
            aria-hidden="true"
          >
            <span></span>
            <span></span>
          </div>


          {/* =================================================
              HERO DESCRIPTION
          ================================================== */}

          <p className="hero__subtitle">

            <strong className="hero__subtitle--bold">
              Timeless designs. Meaningful creations.
            </strong>

            <br />

            <span className="hero-para">
              Discover our exclusive collection of silver plated idols,
              home decor and giftware — crafted to elevate your sacred
              moments and spaces.
            </span>

          </p>


          {/* =================================================
              HERO BUTTONS

              Silver theme — NO GOLD
          ================================================== */}

          <div className="hero__actions">


            {/* =================================================
                PRIMARY BUTTON
            ================================================== */}

            <Link
              to="/shop"
              className="btn btn--silver"
            >
              Explore the Collection
            </Link>


            {/* =================================================
                SECONDARY BUTTON
            ================================================== */}

            <Link
              to="/about"
              className="btn btn--silver-outline"
            >
              Our Craft
            </Link>


          </div>


        </motion.div>


      </section>


      {/* =====================================================
          CATEGORIES / SHOP BY DEVOTION
      ====================================================== */}

      <section className="section categories">


        <SectionDivider />


        <h2 className="section__title">
          Shop by Devotion
        </h2>


        <p className="section__subtitle">
          Every idol is chosen for a reason. Which is yours?
        </p>


        <div className="categories__grid">


          {CATEGORIES.map((cat, i) => (

            <Link
              key={cat.name}
              to={`/shop/${encodeURIComponent(cat.name)}`}
              className="category-tile"

              style={{
                animationDelay: `${i * 0.08}s`
              }}
            >


              {/* =================================================
                  3D DEVOTION FLIP CARD

                  Desktop:
                  Hover = flip to video

                  Mobile:
                  Button = flip to video
              ================================================== */}

              <ProductMedallion
                category={cat.name}
                name={cat.name}
                size="md"
                image={cat.image}
                video={cat.video}
              />


            </Link>

          ))}


        </div>


      </section>


      {/* =====================================================
          FEATURED PRODUCTS SECTION
      ====================================================== */}

      <section className="section featured">


        <SectionDivider />


        <h2 className="section__title">
          The Featured Edit
        </h2>


        <p className="section__subtitle">
          A few pieces our patrons return for, again and again.
        </p>


        {/* ===================================================
            PRODUCT LOADING
        ==================================================== */}

        {loading ? (

          <Loader
            label="Curating the collection..."
          />

        ) : products.length === 0 ? (

          <p className="empty-state">
            No featured products available yet.
          </p>

        ) : (

          <div className="product-grid">


            {products.map((product) => (

              <ProductCard
                key={product.id}
                product={product}
              />

            ))}


          </div>

        )}


        {/* ===================================================
            VIEW FULL COLLECTION
        ==================================================== */}

        <div className="featured__cta">


          <Link
            to="/shop"
            className="btn btn--silver-outline"
          >
            View Full Collection
          </Link>


        </div>


      </section>


      {/* =====================================================
          CRAFT BANNER SECTION
      ====================================================== */}

      <section className="section craft-banner">


        <div className="craft-banner__inner">


          {/* Small Heading */}

          <span className="eyebrow">
            The Astha Promise
          </span>


          {/* Main Heading */}

          <h2>
            Every idol, hand-finished.
            Every order, personal.
          </h2>


          {/* Description */}

          <p>
            From the first sketch to the final polish,
            each Astha murti passes through the hands
            of artisans who have spent decades perfecting
            the craft. No two pieces are rushed.
          </p>


          {/* =================================================
              CRAFT STATS
          ================================================== */}

          <div className="craft-banner__stats">


            {/* Years */}

            <div>
              <strong>25+</strong>
              <span>Years of Craft</span>
            </div>


            {/* Hand Finished */}

            <div>
              <strong>100%</strong>
              <span>Hand-Finished</span>
            </div>


            {/* Homes */}

            <div>
              <strong>1000+</strong>
              <span>Homes Blessed</span>
            </div>


          </div>


        </div>


      </section>


    </div>
  );
}