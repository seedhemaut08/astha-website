import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import ProductMedallion from './ProductMedallion.jsx';

/*
=========================================================
PRODUCT CARD
=========================================================

Supports:

1. Individual product image
   product.image

2. Individual product video
   product.video

3. Category-based fallback
   ProductMedallion automatically uses the default
   image/video for the category when individual media
   is not provided.

4. Hover flip animation

5. Product video on hover

6. Add to Cart

7. Product detail navigation
=========================================================
*/

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  /*
  ========================================================
  ADD TO CART
  ========================================================
  */

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    addToCart(product);
  };


  /*
  ========================================================
  PRODUCT IMAGE CHECK
  ========================================================
  */

  const hasProductImage =
    product?.image &&
    typeof product.image === 'string' &&
    product.image.trim() !== '';


  /*
  ========================================================
  PRODUCT VIDEO CHECK
  ========================================================
  */

  const hasProductVideo =
    product?.video &&
    typeof product.video === 'string' &&
    product.video.trim() !== '';


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div className="product-card">

      {/* ==================================================
          PRODUCT MEDIA
      ================================================== */}

      <Link
        to={`/product/${product.id}`}
        className="product-card__media"
        aria-label={`View ${product.name}`}
      >

        {/*
        ====================================================
        IMPORTANT

        ProductMedallion is ALWAYS used.

        This is important because ProductMedallion handles:

        FRONT
        → Product image

        HOVER
        → Card flips

        BACK
        → Product video

        If product has no individual image/video,
        ProductMedallion automatically uses the category
        fallback media.
        ====================================================
        */}

        <ProductMedallion
          category={product.category}
          name={product.name}
          size="md"
          image={hasProductImage ? product.image : undefined}
          video={hasProductVideo ? product.video : undefined}
        />

      </Link>


      {/* ==================================================
          PRODUCT INFORMATION
      ================================================== */}

      <div className="product-card__body">


        {/* =================================================
            CATEGORY
        ================================================= */}

        <span className="product-card__category">
          {product.category}
        </span>


        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <Link
          to={`/product/${product.id}`}
          className="product-card__name"
        >
          {product.name}
        </Link>


        {/* =================================================
            PRODUCT META
        ================================================= */}

        <div className="product-card__meta">
          {product.height || '—'}
          {' · '}
          {product.weight || '—'}
        </div>


        {/* =================================================
            PRICE + CART
        ================================================= */}

        <div className="product-card__row">


          {/* =================================================
              PRICE
          ================================================= */}

          <span className="product-card__price">
            ₹
            {Number(product.price || 0).toLocaleString('en-IN')}
          </span>


          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleAddToCart}
            disabled={product.inStock === false}
          >
            {product.inStock === false
              ? 'Out of Stock'
              : 'Add to Cart'}
          </button>


        </div>

      </div>

    </div>
  );
}