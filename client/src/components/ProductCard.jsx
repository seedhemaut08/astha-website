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
2. Individual product video
3. Category-based fallback media
4. Hover flip animation
5. Product video on hover
6. Add to Cart
7. Product detail navigation
8. React.memo render optimization
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
  ADD TO CART
  ========================================================
  */

  const handleAddToCart = useCallback(
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      if (!product) {
        return;
      }

      addToCart(product);

    },
    [
      addToCart,
      product,
    ]
  );


  /*
  ========================================================
  SAFETY CHECK
  ========================================================
  */

  if (!product) {
    return null;
  }


  /*
  ========================================================
  PRODUCT VALUES
  ========================================================
  */

  const productId =
    product.id;


  const productName =
    product.name || 'Product';


  const productCategory =
    product.category || 'Collection';


  const productPrice =
    Number(product.price || 0);


  const isOutOfStock =
    product.inStock === false;


  /*
  ========================================================
  PRODUCT IMAGE
  ========================================================
  */

  const hasProductImage =
    typeof product.image === 'string' &&
    product.image.trim() !== '';


  /*
  ========================================================
  PRODUCT VIDEO
  ========================================================
  */

  const hasProductVideo =
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
        to={`/product/${productId}`}
        className="product-card__media"
        aria-label={`View ${productName}`}
      >

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
            {
              isOutOfStock
                ? 'Out of Stock'
                : 'Add to Cart'
            }
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