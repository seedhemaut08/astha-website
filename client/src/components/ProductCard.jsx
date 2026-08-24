import {
  memo,
  useCallback,
} from 'react';

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

8. Render optimization
   React.memo prevents unnecessary re-renders when the
   product object has not changed.
=========================================================
*/


/*
=========================================================
PRODUCT CARD COMPONENT
=========================================================
*/

function ProductCardComponent({ product }) {

  /*
  ========================================================
  CART CONTEXT
  ========================================================
  */

  const { addToCart } = useCart();


  /*
  ========================================================
  SAFETY CHECK
  ========================================================

  Prevent the entire product grid from crashing if an
  unexpected empty/null product reaches the component.
  ========================================================
  */

  if (!product) {
    return null;
  }


  /*
  ========================================================
  ADD TO CART
  ========================================================
  */

  const handleAddToCart = useCallback(
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      addToCart(product);

    },
    [
      addToCart,
      product
    ]
  );


  /*
  ========================================================
  PRODUCT IMAGE CHECK
  ========================================================
  */

  const hasProductImage =
    typeof product.image === 'string' &&
    product.image.trim() !== '';


  /*
  ========================================================
  PRODUCT VIDEO CHECK
  ========================================================
  */

  const hasProductVideo =
    typeof product.video === 'string' &&
    product.video.trim() !== '';


  /*
  ========================================================
  PRODUCT ID
  ========================================================
  */

  const productId = product.id;


  /*
  ========================================================
  PRODUCT NAME
  ========================================================
  */

  const productName =
    product.name || 'Product';


  /*
  ========================================================
  PRODUCT CATEGORY
  ========================================================
  */

  const productCategory =
    product.category || 'Collection';


  /*
  ========================================================
  PRODUCT PRICE
  ========================================================
  */

  const productPrice =
    Number(product.price || 0);


  /*
  ========================================================
  PRODUCT STOCK
  ========================================================
  */

  const isOutOfStock =
    product.inStock === false;


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
        to={`/product/${productId}`}
        className="product-card__media"
        aria-label={`View ${productName}`}
      >


        {/* =================================================
            PRODUCT MEDALLION

            ProductMedallion handles:

            FRONT
            → Product image

            HOVER / CLICK
            → Card flips

            BACK
            → Product video

            IMPORTANT PERFORMANCE BEHAVIOR:

            ProductMedallion now loads the video only when
            the user interacts with the card.

            This prevents product/category videos from
            downloading unnecessarily during initial page
            load.
        ================================================== */}

        <ProductMedallion
          category={productCategory}
          name={productName}
          size="md"
          image={
            hasProductImage
              ? product.image
              : undefined
          }
          video={
            hasProductVideo
              ? product.video
              : undefined
          }
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
          {productCategory}
        </span>


        {/* =================================================
            PRODUCT NAME
        ================================================= */}

        <Link
          to={`/product/${productId}`}
          className="product-card__name"
        >
          {productName}
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
            {productPrice.toLocaleString('en-IN')}
          </span>


          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : 'Add to Cart'}
          </button>


        </div>


      </div>


    </div>
  );
}


/*
=========================================================
MEMOIZED PRODUCT CARD
=========================================================

React.memo prevents ProductCard from rendering again when
its parent renders but the product reference has not changed.

This is particularly useful in product grids where multiple
cards are displayed together.
=========================================================
*/

const ProductCard = memo(
  ProductCardComponent
);


/*
=========================================================
EXPORT
=========================================================
*/

export default ProductCard;