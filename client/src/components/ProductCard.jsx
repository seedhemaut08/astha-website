import {
  memo,
  useCallback,
} from 'react';

import { Link } from 'react-router-dom';

import { useCart } from '../context/CartContext.jsx';

import ProductMedallion from './ProductMedallion.jsx';


function ProductCardComponent({ product }) {

  const {
    addToCart,
    couponApplied,
    getDiscountedPrice,
  } = useCart();


  const handleAddToCart = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!product) {
        return;
      }

      addToCart(product);
    },
    [addToCart, product]
  );


  if (!product) {
    return null;
  }


  const productId = product.id;
  const productName = product.name || 'Product';
  const productCategory = product.category || 'Collection';
  const productPrice = Number(product.price || 0);
  const discountedPrice = getDiscountedPrice(productPrice);
  const isOutOfStock = product.inStock === false;

  const hasProductImage =
    typeof product.image === 'string' &&
    product.image.trim() !== '';

  const hasProductVideo =
    typeof product.video === 'string' &&
    product.video.trim() !== '';


  return (
    <div className="product-card">

      <Link
        to={`/product/${productId}`}
        className="product-card__media"
        aria-label={`View ${productName}`}
      >

        <ProductMedallion
          category={productCategory}
          name={productName}
          size="md"
          image={hasProductImage ? product.image : undefined}
          video={hasProductVideo ? product.video : undefined}
        />

        {couponApplied && (
          <span className="product-card__coupon-ribbon">
            10% OFF
          </span>
        )}

      </Link>


      <div className="product-card__body">

        <span className="product-card__category">
          {productCategory}
        </span>

        <Link
          to={`/product/${productId}`}
          className="product-card__name"
        >
          {productName}
        </Link>

        <div className="product-card__meta">
          {product.height || '—'}
          {' · '}
          {product.weight || '—'}
        </div>

        <div className="product-card__row">

          <span className="product-card__price">
            {couponApplied ? (
              <>
                <span className="product-card__price--strike">
                  ₹{productPrice.toLocaleString('en-IN')}
                </span>
                <span className="product-card__price--offer">
                  ₹{discountedPrice.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <>₹{productPrice.toLocaleString('en-IN')}</>
            )}
          </span>

          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

        </div>

      </div>

    </div>
  );
}


const ProductCard = memo(ProductCardComponent);

export default ProductCard;