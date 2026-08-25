import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';

export default function Checkout() {
  const {
    items,
    total,
    clearCart,
    couponApplied,
    applyCoupon,
    removeCoupon,
    getDiscountedPrice,
    discountedTotal,
    couponSavings,
    COUPON_CODE,
    COUPON_EXPIRY,
    isCouponWindowOpen,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ============================================================
     FORM STATE

     NOTE: paymentMethod is locked to 'COD'. UPI and Card are
     shown in the UI but disabled — there is no real payment
     gateway integration yet (no redirect, no QR, no actual
     charge), so allowing those options would let a customer
     "place" an order while believing they paid, when in fact
     nothing was ever charged. Only Cash on Delivery is
     selectable until a real payment gateway (Razorpay/Stripe/
     etc.) is integrated.
     ============================================================ */

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    alternatePhone: '',

    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',

    deliveryInstructions: '',

    paymentMethod: 'COD',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ============================================================
     COUPON UI STATE
     ============================================================ */

  const [couponTimeLeft, setCouponTimeLeft] = useState(() =>
    getTimeLeft(COUPON_EXPIRY)
  );
  const [showYay, setShowYay] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCouponTimeLeft(getTimeLeft(COUPON_EXPIRY));
    }, 1000);

    return () => clearInterval(interval);
  }, [COUPON_EXPIRY]);

  function getTimeLeft(expiry) {
    const diff = expiry.getTime() - Date.now();
    if (diff <= 0) return null;

    const totalSeconds = Math.floor(diff / 1000);

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }

  /* ============================================================
     UPDATE FORM
     ============================================================ */

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    /*
     * Clear the previous error while the user is correcting
     * the form.
     */
    if (error) {
      setError('');
    }
  }

  /* ============================================================
     CONFETTI BURST (order placed)
     ============================================================ */

  function fireConfetti() {
    try {
      /*
       * Main center burst
       */
      confetti({
        particleCount: 180,
        spread: 90,
        startVelocity: 45,
        origin: {
          x: 0.5,
          y: 0.55,
        },
      });

      /*
       * Left burst
       */
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          angle: 60,
          startVelocity: 45,
          origin: {
            x: 0,
            y: 0.65,
          },
        });
      }, 120);

      /*
       * Right burst
       */
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          angle: 120,
          startVelocity: 45,
          origin: {
            x: 1,
            y: 0.65,
          },
        });
      }, 220);

      /*
       * Final center burst
       */
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          startVelocity: 35,
          origin: {
            x: 0.5,
            y: 0.45,
          },
        });
      }, 350);
    } catch (confettiError) {
      /*
       * Confetti must never break order placement.
       */
      console.error('CONFETTI ERROR:', confettiError);
    }
  }

  /* ============================================================
     CONFETTI BURST (coupon applied) — smaller, celebratory
     ============================================================ */

  function fireCouponConfetti() {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 40,
        colors: ['#d4af37', '#f4e4b8', '#b8860b', '#fff5e0', '#e8c674'],
        origin: {
          x: 0.5,
          y: 0.4,
        },
      });

      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          startVelocity: 30,
          colors: ['#d4af37', '#f4e4b8', '#b8860b'],
          origin: {
            x: 0.3,
            y: 0.5,
          },
        });
      }, 150);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          startVelocity: 30,
          colors: ['#d4af37', '#f4e4b8', '#b8860b'],
          origin: {
            x: 0.7,
            y: 0.5,
          },
        });
      }, 150);
    } catch (confettiError) {
      console.error('COUPON CONFETTI ERROR:', confettiError);
    }
  }

  /* ============================================================
     HANDLE APPLY COUPON
     ============================================================ */

  function handleApplyCoupon() {
    const result = applyCoupon();

    if (result.success) {
      fireCouponConfetti();
      setShowYay(true);
      setTimeout(() => setShowYay(false), 2200);
    }
  }

  /* ============================================================
     HANDLE ORDER SUBMIT
     ============================================================ */

  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setError('');

    /* ==========================================================
       NORMALIZED VALUES
       ========================================================== */

    const fullName = String(form.fullName || '').trim();
    const email = String(form.email || '').trim();
    const phone = String(form.phone || '').trim();
    const alternatePhone = String(
      form.alternatePhone || ''
    ).trim();

    const address = String(
      form.address || ''
    ).trim();

    const city = String(
      form.city || ''
    ).trim();

    const state = String(
      form.state || ''
    ).trim();

    const pincode = String(
      form.pincode || ''
    ).trim();

    const country = String(
      form.country || ''
    ).trim();

    const deliveryInstructions = String(
      form.deliveryInstructions || ''
    ).trim();

    /* ==========================================================
       PAYMENT METHOD

       HARD-LOCKED to 'COD'. Even if the form state were ever
       tampered with (devtools, stale state, etc.), the request
       we actually send to the server always says COD until a
       real payment gateway exists. This is a safety net on top
       of the disabled UI below.
       ========================================================== */

    const paymentMethod = 'COD';

    /* ==========================================================
       REQUIRED FIELD VALIDATION
       ========================================================== */

    if (!fullName) {
      setError('Please enter your full name.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    if (!address) {
      setError('Please enter your complete delivery address.');
      return;
    }

    if (!city) {
      setError('Please enter your city.');
      return;
    }

    if (!state) {
      setError('Please enter your state.');
      return;
    }

    if (!pincode) {
      setError('Please enter your ZIP / Pincode.');
      return;
    }

    if (!country) {
      setError('Please enter your country.');
      return;
    }

    /* ==========================================================
       EMAIL VALIDATION
       ========================================================== */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError(
        'Please enter a valid email address.'
      );
      return;
    }

    /* ==========================================================
       PHONE VALIDATION
       ========================================================== */

    const phoneDigits =
      phone.replace(/\D/g, '');

    if (phoneDigits.length < 10) {
      setError(
        'Please enter a valid 10-digit phone number.'
      );
      return;
    }

    /* ==========================================================
       ALTERNATE PHONE VALIDATION
       ========================================================== */

    if (alternatePhone) {
      const alternateDigits =
        alternatePhone.replace(/\D/g, '');

      if (alternateDigits.length < 10) {
        setError(
          'Please enter a valid alternate phone number.'
        );
        return;
      }
    }

    /* ==========================================================
       PINCODE VALIDATION
       ========================================================== */

    const pincodeDigits =
      pincode.replace(/\D/g, '');

    if (pincodeDigits.length < 4) {
      setError(
        'Please enter a valid ZIP / Pincode.'
      );
      return;
    }

    /* ==========================================================
       CART VALIDATION
       ========================================================== */

    if (!Array.isArray(items) || items.length === 0) {
      setError(
        'Your cart is empty.'
      );
      return;
    }

    /* ==========================================================
       SUBMITTING
       ========================================================== */

    setSubmitting(true);

    try {
      /* ========================================================
         SHIPPING ADDRESS OBJECT
         ======================================================== */

      const shippingAddress = {
        street: address,
        city,
        state,
        zipCode: pincode,
        country,
      };

      /* ========================================================
         DELIVERY ADDRESS OBJECT

         Some older backend validation may expect the name
         "deliveryAddress", so we intentionally send this too.
         ======================================================== */

      const deliveryAddress = {
        street: address,
        city,
        state,
        zipCode: pincode,
        country,
      };

      /* ========================================================
         LEGACY ADDRESS STRING
         ======================================================== */

      const addressString = [
        address,
        city,
        state,
        pincode,
        country,
      ]
        .filter(Boolean)
        .join(', ');

      /* ========================================================
         CUSTOMER OBJECT
         ======================================================== */

      const customer = {
        name: fullName,
        email,
        phone,
        alternatePhone,
      };

      /* ========================================================
         ORDER PAYLOAD

         IMPORTANT:

         We send both:

         1. customer.phone
         2. top-level phone

         And both:

         1. shippingAddress
         2. deliveryAddress

         This keeps the checkout compatible with the current
         orders route as well as older validation logic.

         COUPON:

         We send the coupon code + discount + final total
         so the backend/order record reflects what the
         customer actually paid.
         ======================================================== */

      const orderPayload = {
        /* ------------------------------------------------------
           USER
           ------------------------------------------------------ */

        userId:
          user?.id ||
          user?._id ||
          undefined,

        /* ------------------------------------------------------
           CUSTOMER - CURRENT FORMAT
           ------------------------------------------------------ */

        customer,

        /* ------------------------------------------------------
           CUSTOMER - LEGACY / TOP LEVEL FORMAT
           ------------------------------------------------------ */

        fullName,
        email,
        phone,
        alternatePhone,

        /* ------------------------------------------------------
           ITEMS
           ------------------------------------------------------ */

        items,

        /* ------------------------------------------------------
           SHIPPING ADDRESS - CURRENT FORMAT
           ------------------------------------------------------ */

        shippingAddress,

        /* ------------------------------------------------------
           DELIVERY ADDRESS - COMPATIBILITY FORMAT
           ------------------------------------------------------ */

        deliveryAddress,

        /* ------------------------------------------------------
           LEGACY ADDRESS STRING
           ------------------------------------------------------ */

        address: addressString,

        /* ------------------------------------------------------
           PAYMENT — always COD (see paymentMethod above)
           ------------------------------------------------------ */

        paymentMethod,

        /* ------------------------------------------------------
           DELIVERY INSTRUCTIONS
           ------------------------------------------------------ */

        deliveryInstructions,

        /* ------------------------------------------------------
           DELIVERY TYPE
           ------------------------------------------------------ */

        deliveryType: 'delivery',

        /* ------------------------------------------------------
           COUPON
           ------------------------------------------------------ */

        couponCode: couponApplied ? COUPON_CODE : null,
        couponDiscount: couponApplied ? Number(couponSavings) : 0,

        /* ------------------------------------------------------
           TOTAL — discounted total if coupon is applied
           ------------------------------------------------------ */

        total: Number(couponApplied ? discountedTotal : total),
      };

      console.log(
        'CHECKOUT ORDER PAYLOAD:',
        orderPayload
      );

      /* ========================================================
         CREATE ORDER
         ======================================================== */

      const response = await api.post(
        '/orders',
        orderPayload
      );

      console.log(
        'CHECKOUT ORDER RESPONSE:',
        response
      );

      /* ========================================================
         EXTRACT ORDER

         api.post may return:

         {
           order: {...}
         }

         or in some API wrappers:

         {
           data: {
             order: {...}
           }
         }

         Handle both safely.
         ======================================================== */

      const order =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        null;

      /* ========================================================
         VERIFY ORDER
         ======================================================== */

      if (!order) {
        throw new Error(
          'Order was not created. Please try again.'
        );
      }

      const orderId =
        order.id ||
        order._id;

      if (!orderId) {
        throw new Error(
          'Order was created but no order ID was returned.'
        );
      }

      /* ========================================================
         CLEAR CART
         ======================================================== */

      clearCart();

      /* ========================================================
         🎉 CONFETTI
         ======================================================== */

      fireConfetti();

      /* ========================================================
         SUCCESS PAGE

         Small delay so the user gets to see the confetti.
         ======================================================== */

      setTimeout(() => {
        navigate(
          `/order-success/${orderId}`
        );
      }, 700);

    } catch (err) {
      console.error(
        'CHECKOUT ERROR:',
        err
      );

      /* ========================================================
         ERROR MESSAGE EXTRACTION
         ======================================================== */

      const serverMessage =
        err?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.data?.error ||
        err?.data?.message;

      setError(
        serverMessage ||
        'Unable to place your order. Please try again.'
      );

    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     EMPTY CART
     ============================================================ */

  if (!items || items.length === 0) {
    return (
      <div className="page-pad empty-state">
        <h2>
          Your cart is empty
        </h2>
      </div>
    );
  }

  /* ============================================================
     FINAL AMOUNT TO SHOW (button + total)
     ============================================================ */

  const payableTotal = couponApplied ? discountedTotal : total;

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <div className="checkout-page">

      <h1>
        Checkout
      </h1>

      <div className="checkout-page__layout">

        {/* ======================================================
           CHECKOUT FORM
           ====================================================== */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >

          <h3>
            Contact Information
          </h3>

          {/* ====================================================
             ERROR
             ==================================================== */}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* ====================================================
             FULL NAME
             ==================================================== */}

          <label>
            Full Name

            <input
              type="text"
              value={form.fullName}
              onChange={(e) =>
                update(
                  'fullName',
                  e.target.value
                )
              }
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </label>

          {/* ====================================================
             EMAIL
             ==================================================== */}

          <label>
            Email Address

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                update(
                  'email',
                  e.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          {/* ====================================================
             PHONE ROW
             ==================================================== */}

          <div className="form-row">

            {/* PRIMARY PHONE */}

            <label>
              Phone Number

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  update(
                    'phone',
                    e.target.value
                  )
                }
                placeholder="Primary phone number"
                autoComplete="tel"
                required
              />
            </label>

            {/* ALTERNATE PHONE */}

            <label>
              Alternate Phone

              <span
                style={{
                  fontSize: '0.72rem',
                  opacity: 0.65,
                  marginLeft: '4px',
                }}
              >
                Optional
              </span>

              <input
                type="tel"
                value={form.alternatePhone}
                onChange={(e) =>
                  update(
                    'alternatePhone',
                    e.target.value
                  )
                }
                placeholder="Alternate number"
                autoComplete="tel"
              />
            </label>

          </div>

          {/* ====================================================
             SHIPPING ADDRESS
             ==================================================== */}

          <h3>
            Shipping Address
          </h3>

          {/* STREET ADDRESS */}

          <label>
            Street Address

            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                update(
                  'address',
                  e.target.value
                )
              }
              placeholder="House / apartment number, street, landmark"
              autoComplete="street-address"
              required
            />
          </label>

          {/* ====================================================
             CITY + STATE
             ==================================================== */}

          <div className="form-row">

            <label>
              City

              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  update(
                    'city',
                    e.target.value
                  )
                }
                placeholder="City"
                autoComplete="address-level2"
                required
              />
            </label>

            <label>
              State

              <input
                type="text"
                value={form.state}
                onChange={(e) =>
                  update(
                    'state',
                    e.target.value
                  )
                }
                placeholder="State"
                autoComplete="address-level1"
                required
              />
            </label>

          </div>

          {/* ====================================================
             ZIP + COUNTRY
             ==================================================== */}

          <div className="form-row">

            <label>
              ZIP / Pincode

              <input
                type="text"
                value={form.pincode}
                onChange={(e) =>
                  update(
                    'pincode',
                    e.target.value
                  )
                }
                placeholder="ZIP / Pincode"
                autoComplete="postal-code"
                required
              />
            </label>

            <label>
              Country

              <input
                type="text"
                value={form.country}
                onChange={(e) =>
                  update(
                    'country',
                    e.target.value
                  )
                }
                placeholder="Country"
                autoComplete="country-name"
                required
              />
            </label>

          </div>

          {/* ====================================================
             DELIVERY INSTRUCTIONS
             ==================================================== */}

          <label>
            Delivery Instructions

            <textarea
              rows={3}
              value={form.deliveryInstructions}
              onChange={(e) =>
                update(
                  'deliveryInstructions',
                  e.target.value
                )
              }
              placeholder="Gate code, delivery notes, landmark, etc. (optional)"
            />
          </label>

          {/* ====================================================
             PAYMENT

             UPI and Card are shown but DISABLED (greyed out,
             not clickable) because there is no real payment
             gateway wired up yet — no redirect, no QR, no actual
             charge happens. Only Cash on Delivery works.

             When a real gateway (e.g. Razorpay) is integrated,
             remove the `disabled` prop and the
             `payment-option--disabled` class from those two
             options.
             ==================================================== */}

          <h3>
            Payment Method
          </h3>

          <div className="payment-options">

            {/* ==================================================
               COD — the only selectable option right now
               ================================================== */}

            <label
              className={`payment-option ${
                form.paymentMethod === 'COD'
                  ? 'is-active'
                  : ''
              }`}
            >

              <input
                type="radio"
                name="payment"
                value="COD"
                checked={
                  form.paymentMethod === 'COD'
                }
                onChange={() =>
                  update(
                    'paymentMethod',
                    'COD'
                  )
                }
              />

              <span>
                Cash on Delivery
              </span>

            </label>

            {/* ==================================================
               UPI — DISABLED
               ================================================== */}

            <label
              className="payment-option payment-option--disabled"
              aria-disabled="true"
              title="UPI payments are coming soon. Please select Cash on Delivery."
            >

              <input
                type="radio"
                name="payment"
                value="upi"
                checked={false}
                disabled
                readOnly
              />

              <span>
                UPI
                <span className="payment-option__badge">
                  Coming Soon
                </span>
              </span>

            </label>

            {/* ==================================================
               CARD — DISABLED
               ================================================== */}

            <label
              className="payment-option payment-option--disabled"
              aria-disabled="true"
              title="Card payments are coming soon. Please select Cash on Delivery."
            >

              <input
                type="radio"
                name="payment"
                value="card"
                checked={false}
                disabled
                readOnly
              />

              <span>
                Card
                <span className="payment-option__badge">
                  Coming Soon
                </span>
              </span>

            </label>

          </div>

          {/* ====================================================
             PLACE ORDER
             ==================================================== */}

          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? 'Placing Order...'
              : `Place Order — ₹${Number(
                  payableTotal || 0
                ).toLocaleString('en-IN')}`}
          </button>

        </form>

        {/* ======================================================
           ORDER SUMMARY
           ====================================================== */}

        <div className="cart-summary">

          <h3>
            Order Summary
          </h3>

          {items.map((item) => {
            const lineOriginal =
              Number(item.price || 0) *
              Number(item.quantity || 1);

            const lineDiscounted = couponApplied
              ? getDiscountedPrice(item.price) *
                Number(item.quantity || 1)
              : lineOriginal;

            return (
              <div
                className="cart-summary__row"
                key={
                  item.productId ||
                  item.id ||
                  item._id
                }
              >

                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>
                  {couponApplied ? (
                    <>
                      <span className="cart-summary__strike">
                        ₹{lineOriginal.toLocaleString('en-IN')}
                      </span>{' '}
                      ₹{lineDiscounted.toLocaleString('en-IN')}
                    </>
                  ) : (
                    <>₹{lineOriginal.toLocaleString('en-IN')}</>
                  )}
                </span>

              </div>
            );
          })}

          {/* ====================================================
             RAKSHABANDHAN COUPON
             ==================================================== */}

          {isCouponWindowOpen() && (

            <div className="checkout-coupon">

              {showYay && (
                <div className="checkout-coupon__yay">
                  yayyyyy! 🎉
                </div>
              )}

              <div className="checkout-coupon__header">
                <span className="checkout-coupon__title">
                  Raksha Bandhan Special
                </span>
                <span className="checkout-coupon__badge">
                  10% OFF
                </span>
              </div>

              <p className="checkout-coupon__line">
                A little something from our family to yours this
                Rakhi — every idol, 10% off with code{' '}
                <strong>{COUPON_CODE}</strong>.
              </p>

              {!couponApplied ? (

                <button
                  type="button"
                  className="btn btn--primary checkout-coupon__apply"
                  onClick={handleApplyCoupon}
                >
                  Apply Coupon — {COUPON_CODE}
                </button>

              ) : (

                <div className="checkout-coupon__applied">
                  <span>
                    ✓ {COUPON_CODE} applied — 10% off added
                  </span>

                  <button
                    type="button"
                    className="checkout-coupon__remove"
                    onClick={removeCoupon}
                  >
                    Remove
                  </button>
                </div>

              )}

              {couponTimeLeft && (
                <div className="checkout-coupon__timer">
                  <span>Offer ends in</span>
                  <div className="checkout-coupon__timer-units">
                    <div><strong>{couponTimeLeft.days}</strong><small>d</small></div>
                    <div><strong>{String(couponTimeLeft.hours).padStart(2, '0')}</strong><small>h</small></div>
                    <div><strong>{String(couponTimeLeft.minutes).padStart(2, '0')}</strong><small>m</small></div>
                    <div><strong>{String(couponTimeLeft.seconds).padStart(2, '0')}</strong><small>s</small></div>
                  </div>
                </div>
              )}

            </div>

          )}

          {/* ====================================================
             SUBTOTAL / DISCOUNT / TOTAL
             ==================================================== */}

          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>₹{Number(total || 0).toLocaleString('en-IN')}</span>
          </div>

          {couponApplied && (
            <div className="cart-summary__row cart-summary__row--discount">
              <span>{COUPON_CODE} discount</span>
              <span>−₹{Number(couponSavings || 0).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="cart-summary__total">

            <span>
              Total
            </span>

            <span>
              ₹
              {Number(
                payableTotal || 0
              ).toLocaleString('en-IN')}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}