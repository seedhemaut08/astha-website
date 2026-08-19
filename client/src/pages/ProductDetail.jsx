import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';

/* ============================================================
   PRODUCT GALLERY
   ============================================================ */

const STATIC_PRODUCT_GALLERIES = {
  /* =========================
     GANESH JI
     ========================= */
  'Ganesh Ji': [
    '/images/devotion/Ganesh/ganesh.png',
    '/images/devotion/Ganesh/ganesh2.JPG',
    '/images/devotion/Ganesh/ganesh3.JPG',
    '/images/devotion/Ganesh/ganesh4.png'
  ],

  /* =========================
     KRISHNA LEELA CLOCK
     ========================= */
  'Krishnaleela Clock': [
    '/images/devotion/Krishna%20Leela%20Clock/clock.png',
    '/images/devotion/Krishna%20Leela%20Clock/clock2.JPG',
    '/images/devotion/Krishna%20Leela%20Clock/clock3.JPG',
    '/images/devotion/Krishna%20Leela%20Clock/clock4.JPG'
  ],

  /* =========================
     PEACOCK
     ========================= */
  Peacock: [
    '/images/devotion/Peacock/peacock.png',
    '/images/devotion/Peacock/peacock2.JPG',
    '/images/devotion/Peacock/peacock3.JPG',
    '/images/devotion/Peacock/peacock4.JPG'
  ],

  /* =========================
     LAKSHMI JI
     ========================= */
  'Kamal Aasan Lakshmi Murti': [
    '/images/devotion/lakshmi/lakshami.png',
    '/images/devotion/lakshmi/lakshmi2.JPG',
    '/images/devotion/lakshmi/lakshmi3.JPG',
    '/images/devotion/lakshmi/lakshmi4.JPG'
  ],

  /* =========================
     SHANKH
     ========================= */
  Shankh: [
    '/images/devotion/Shankh/Shankh.png',
    '/images/devotion/Shankh/shankh2.JPG',
    '/images/devotion/Shankh/shankh3.JPG',
    '/images/devotion/Shankh/shankh4.JPG'
  ],

  /* =========================
     CANDLE STAND
     ========================= */
  'Candle Stand': [
    '/images/devotion/Candle/candle.png',
    '/images/devotion/Candle/Candle%20Stand%20Closeup%20.png',
    '/images/devotion/Candle/candle2.JPG',
    '/images/devotion/Candle/candle3.JPG',
    '/images/devotion/Candle/candle4.JPG'
  ],

  /* =========================
     KAAMDHENU
     ========================= */
  Kaamdhenu: [
    '/images/devotion/kaamdhenu/cow.jpeg',
    '/images/devotion/kaamdhenu/cow2.JPG',
    '/images/devotion/kaamdhenu/cow3.JPG',
    '/images/devotion/kaamdhenu/cow4.JPG'
  ],

  /* =========================
     PHOTO FRAME
     ========================= */
  'Photo Frame': [
    '/images/devotion/frame/frame.png',
    '/images/devotion/frame/frame2.JPG',
    '/images/devotion/frame/frame3.JPG',
    '/images/devotion/frame/IMG_0834.JPG'
  ],

  /* ============================================================
     NEW PRODUCTS
     ============================================================ */

  /* =========================
     RAM MANDIR
     ========================= */
  'Ram Mandir': [
    '/images/devotion/Ram%20Mandir/ramM.png',
    '/images/devotion/Ram%20Mandir/ram2.JPG',
    '/images/devotion/Ram%20Mandir/ram3.JPG',
    '/images/devotion/Ram%20Mandir/ram4.JPG'
  ],

  /* =========================
     PEACOCK CANDLE
     ========================= */
  'Peacock Candle Stand': [
    '/images/devotion/peacockcan/peacockcan.JPG',
    '/images/devotion/peacockcan/peacockcan2.JPG',
    '/images/devotion/peacockcan/peacockcan3.JPG',
    '/images/devotion/peacockcan/peacockcan4.JPG'
  ],

  /* =========================
     MAHALAKSHMI
     ========================= */
  Mahalakshmi: [
    '/images/devotion/Mahalakshmi/mahal.JPG',
    '/images/devotion/Mahalakshmi/mahal2.JPG',
    '/images/devotion/Mahalakshmi/mahal3.JPG',
    '/images/devotion/Mahalakshmi/mahal4.JPG'
  ],

  /* =========================
     LAKSHMI GANESH PAIR
     ========================= */
  'Lakshmi Ganesh Pair': [
    '/images/devotion/lakshganesh.png',
    '/images/devotion/lakshganesh2.JPG',
    '/images/devotion/lakshganesh3.JPG',
    '/images/devotion/lakshganesh4.JPG'
  ]
};


/* ============================================================
   GET PRODUCT GALLERY
   ============================================================ */

function getProductGalleryImages(product) {
  if (!product) return [];

  const backendGallery = Array.isArray(product.galleryImages)
    ? product.galleryImages
    : Array.isArray(product.images)
      ? product.images
      : [];

  const cleanBackendGallery = backendGallery.filter(
    (image) =>
      typeof image === 'string' &&
      image.trim() !== ''
  );

  if (cleanBackendGallery.length > 0) {
    return cleanBackendGallery;
  }

  const productName = String(product.name || '').trim();

  if (STATIC_PRODUCT_GALLERIES[productName]) {
    return STATIC_PRODUCT_GALLERIES[productName];
  }

  const productCategory = String(product.category || '').trim();

  if (STATIC_PRODUCT_GALLERIES[productCategory]) {
    return STATIC_PRODUCT_GALLERIES[productCategory];
  }

  if (
    typeof product.image === 'string' &&
    product.image.trim() !== ''
  ) {
    return [product.image];
  }

  return [];
}


/* ============================================================
   PRODUCT PRICING
   MRP = ORIGINAL PRICE
   price = OFFER / SELLING PRICE
   ============================================================ */

const PRODUCT_PRICING = {
  'Ganesh Ji': {
    price: 3150,
    mrp: 4650,
    discount: '32.26%'
  },

  Shankh: {
    price: 7129,
    mrp: 7975,
    discount: '10.61%'
  },

  'Peacock Candle Stand': {
    price: 4600,
    mrp: 5260,
    discount: '12.55%'
  },

  'Ram Mandir': {
    price: 12000,
    mrp: 13200,
    discount: '9.09%'
  },

  'Lakshmi Ganesh Pair': {
    price: 20390,
    mrp: 22440,
    discount: '9.14%'
  },

  Swan: {
    price: 16400,
    mrp: 18040,
    discount: '9.09%'
  },

  Peacock: {
    price: 24499,
    mrp: 27280,
    discount: '10.20%'
  },

  'Candle Stand': {
    price: 11499,
    mrp: 12870,
    discount: '10.65%'
  },

  'Photo Frame': {
    price: 10300,
    mrp: 11180,
    discount: '7.87%'
  },

  Kaamdhenu: {
    price: 9189,
    mrp: 10285,
    discount: '10.66%'
  },

  'Krishnaleela Clock': {
    price: 24500,
    mrp: 26950,
    discount: '9.09%'
  },

  'Kamal Aasan Lakshmi Murti': {
    price: 20390,
    mrp: 22440,
    discount: '9.14%'
  },

  Mahalakshmi: {
    price: 11600,
    mrp: 12870,
    discount: '9.87%'
  }
};


/* ============================================================
   CART PRODUCT ID
   ============================================================ */

function getCartItemProductId(item) {
  return (
    item?.product?.id ??
    item?.product?._id ??
    item?.id ??
    item?._id
  );
}


/* ============================================================
   PRODUCT DETAIL
   ============================================================ */

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const {
    addToCart,
    removeFromCart,
    cartItems = []
  } = useCart();


  /* ==========================================================
     LOAD PRODUCT
     ========================================================== */

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setQty(1);
    setActiveImage(0);
    setAdded(false);

    api
      .get(`/products/${id}`)
      .then(({ product }) => {
        if (isMounted) {
          setProduct(product);
        }
      })
      .catch((error) => {
        console.error('Failed to load product:', error);

        if (isMounted) {
          setProduct(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);


  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <div className="page-pad">
        <Loader label="Fetching details..." />
      </div>
    );
  }


  /* ==========================================================
     PRODUCT NOT FOUND
     ========================================================== */

  if (!product) {
    return (
      <div className="page-pad empty-state">
        This idol could not be found.{' '}

        <Link to="/shop">
          Back to shop
        </Link>
      </div>
    );
  }


  /* ==========================================================
     PRODUCT ID
     ========================================================== */

  const productId = product.id ?? product._id;


  /* ==========================================================
     CART STATE
     ========================================================== */

  const isAddedToCart =
    added ||
    (
      Array.isArray(cartItems) &&
      cartItems.some(
        (item) =>
          String(getCartItemProductId(item)) ===
          String(productId)
      )
    );


  /* ==========================================================
     ADD TO CART
     ========================================================== */

  function handleAdd() {
    if (product.inStock === false || isAddedToCart) {
      return;
    }

    addToCart(product, qty);
    setAdded(true);
  }


  /* ==========================================================
     REMOVE FROM CART
     ========================================================== */

  function handleRemove() {
    if (typeof removeFromCart !== 'function') {
      console.error(
        'removeFromCart is missing from CartContext.jsx'
      );

      return;
    }

    removeFromCart(productId);
    setAdded(false);
    setQty(1);
  }


  /* ==========================================================
     CHECKOUT
     ========================================================== */

  function handleProceed() {
    navigate('/checkout');
  }


  /* ==========================================================
     PRODUCT GALLERY
     ========================================================== */

  const productImage =
    typeof product.image === 'string' &&
      product.image.trim() !== ''
      ? product.image
      : undefined;

  const galleryImages =
    getProductGalleryImages(product);

  const currentImage =
    galleryImages[activeImage] ||
    galleryImages[0] ||
    productImage;


  /* ==========================================================
     GALLERY CONTROLS
     ========================================================== */

  function showPreviousImage() {
    if (galleryImages.length <= 1) {
      return;
    }

    setActiveImage((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1
    );
  }


  function showNextImage() {
    if (galleryImages.length <= 1) {
      return;
    }

    setActiveImage((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1
    );
  }


  function selectImage(index) {
    setActiveImage(index);
  }


  /* ==========================================================
     PRICING
     ========================================================== */

  const pricing =
    PRODUCT_PRICING[product.name] ||
    PRODUCT_PRICING[product.category] || {
      price: Number(product.price || 0),
      mrp: Number(product.price || 0),
      discount: '0%'
    };

  const formattedSellingPrice =
    Number(pricing.price).toLocaleString('en-IN');

  const formattedMrp =
    Number(pricing.mrp).toLocaleString('en-IN');


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="product-detail">

      {/* ======================================================
          LEFT — IMAGE GALLERY
          ====================================================== */}

      <div className="product-detail__media">

        {galleryImages.length > 0 && (

          <div className="product-detail__gallery">

            {/* MAIN IMAGE */}

            <div className="product-detail__main-image">

              <img
                src={currentImage}
                alt={`${product.name} view ${activeImage + 1}`}
                className="product-detail__main-image-img"
                draggable="false"
                onError={(event) => {
                  event.currentTarget.style.opacity = '0.35';
                }}
              />


              {/* ARROWS */}

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="product-detail__gallery-arrow product-detail__gallery-arrow--prev"
                    onClick={showPreviousImage}
                    aria-label="Previous product image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="product-detail__gallery-arrow product-detail__gallery-arrow--next"
                    onClick={showNextImage}
                    aria-label="Next product image"
                  >
                    ›
                  </button>
                </>
              )}

            </div>


            {/* THUMBNAILS */}

            {galleryImages.length > 1 && (

              <div className="product-detail__gallery-thumbs">

                {galleryImages.map(
                  (image, index) => (

                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`product-detail__gallery-thumb ${
                        activeImage === index
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() =>
                        selectImage(index)
                      }
                      aria-label={`View product image ${index + 1}`}
                      aria-current={
                        activeImage === index
                          ? 'true'
                          : undefined
                      }
                    >

                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        draggable="false"
                        onError={(event) => {
                          event.currentTarget.style.opacity = '0.35';
                        }}
                      />

                    </button>

                  )
                )}

              </div>

            )}

          </div>

        )}

      </div>


      {/* ======================================================
          RIGHT — PRODUCT INFORMATION
          ====================================================== */}

      <div className="product-detail__info">


        {/* CATEGORY */}

        <span className="eyebrow">
          {product.category}
        </span>


        {/* NAME */}

        <h1>
          {product.name}
        </h1>


        {/* ====================================================
            PRICING
            MRP → OFFER PRICE → DISCOUNT
        ==================================================== */}

        <div className="product-detail__pricing">

          <div className="product-detail__price-row">

            {/* ORIGINAL MRP */}

            {pricing.mrp > pricing.price && (
              <span className="product-detail__mrp">
                ₹{formattedMrp}
              </span>
            )}


            {/* OFFER PRICE */}

            <span className="product-detail__price">
              ₹{formattedSellingPrice}
            </span>


            {/* DISCOUNT */}

            {pricing.discount !== '0%' && (
              <span className="product-detail__discount">
                {pricing.discount} OFF
              </span>
            )}

          </div>


          {/* TAX */}

          <div className="product-detail__tax">
            Inclusive of all taxes
          </div>

        </div>


        {/* DESCRIPTION */}

        <p className="product-detail__desc">
          {product.description}
        </p>


        {/* ====================================================
            PRODUCT SPECS
        ==================================================== */}

        <dl className="product-detail__specs">

          {/* HEIGHT */}

          <div>
            <dt>
              Height
            </dt>

            <dd>
              {product.height || '—'}
            </dd>
          </div>


          {/* WEIGHT */}

          {product.weight && (
            <div>
              <dt>
                Weight
              </dt>

              <dd>
                {product.weight}
              </dd>
            </div>
          )}


          {/* AVAILABILITY */}

          <div>
            <dt>
              Availability
            </dt>

            <dd>
              {product.inStock
                ? 'In Stock'
                : 'Made to Order'}
            </dd>
          </div>

        </dl>


        {/* ====================================================
            CART ACTIONS
        ==================================================== */}

        <div className="product-detail__actions">


          {/* QUANTITY */}

          <div className="qty-stepper">

            <button
              type="button"
              onClick={() =>
                setQty((q) => Math.max(1, q - 1))
              }
              aria-label="Decrease quantity"
              disabled={isAddedToCart}
            >
              −
            </button>

            <span>
              {qty}
            </span>

            <button
              type="button"
              onClick={() =>
                setQty((q) => q + 1)
              }
              aria-label="Increase quantity"
              disabled={isAddedToCart}
            >
              +
            </button>

          </div>


          {/* NOT IN CART */}

          {!isAddedToCart ? (

            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAdd}
              disabled={product.inStock === false}
            >
              {product.inStock === false
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>

          ) : (

            <>

              {/* ADDED TO CART */}

              <button
                type="button"
                className="btn btn--primary product-detail__added-btn"
                disabled
              >
                Added to Cart ✓
              </button>


              {/* REMOVE FROM CART */}

              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleRemove}
              >
                Remove
              </button>


              {/* PROCEED TO CHECKOUT */}

              <button
                type="button"
                className="btn btn--checkout"
                onClick={handleProceed}
              >
                Proceed to Checkout →
              </button>

            </>

          )}

        </div>


        {/* NOTE */}

        <p className="product-detail__note">
          Every Astha idol is hand-finished — slight
          variations in detailing are a mark of the craft,
          not a flaw.
        </p>

      </div>

    </div>
  );
}