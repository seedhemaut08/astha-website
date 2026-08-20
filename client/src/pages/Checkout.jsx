import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    /* ==========================================================
       VALIDATION
       ========================================================== */

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim() ||
      !form.country.trim()
    ) {
      setError('Please fill in all required delivery details.');
      return;
    }

    // Primary phone validation
    const phoneDigits = form.phone.replace(/\D/g, '');

    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    // Alternate phone is OPTIONAL.
    // If entered, validate it.
    if (form.alternatePhone.trim()) {
      const alternateDigits =
        form.alternatePhone.replace(/\D/g, '');

      if (alternateDigits.length < 10) {
        setError('Please enter a valid alternate phone number.');
        return;
      }
    }

    // Basic ZIP / Pincode validation
    if (form.pincode.trim().length < 4) {
      setError('Please enter a valid ZIP / Pincode.');
      return;
    }

    setSubmitting(true);

    try {
      /* ========================================================
         SHIPPING ADDRESS
         ======================================================== */

      const shippingAddress = {
        street: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.pincode.trim(),
        country: form.country.trim(),
      };

      /* ========================================================
         BACKEND ORDER
         ======================================================== */

      const { order } = await api.post('/orders', {
        items,

        // Legacy address string
        // Backend still supports this.
        address: [
          form.address.trim(),
          form.city.trim(),
          form.state.trim(),
          form.pincode.trim(),
          form.country.trim(),
        ].join(', '),

        // Proper shipping address snapshot
        shippingAddress,

        // Contact details
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim(),

        // These are optional notes for future use
        notes: form.deliveryInstructions.trim(),

        // Backend-compatible payment value
        paymentMethod: form.paymentMethod,

        // Delivery order
        deliveryType: 'delivery',
      });

      /* ========================================================
         SUCCESS
         ======================================================== */

      clearCart();

      navigate(`/order-success/${order.id || order._id}`);
    } catch (err) {
      console.error('CHECKOUT ERROR:', err);

      setError(
        err?.message ||
          'Unable to place your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
     EMPTY CART
     ============================================================ */

  if (items.length === 0) {
    return (
      <div className="page-pad empty-state">
        <h2>Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-page__layout">

        {/* ======================================================
           CHECKOUT FORM
           ====================================================== */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <h3>Contact Information</h3>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* FULL NAME */}

          <label>
            Full Name
            <input
              type="text"
              value={form.fullName}
              onChange={(e) =>
                update('fullName', e.target.value)
              }
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </label>

          {/* EMAIL */}

          <label>
            Email Address
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                update('email', e.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          {/* PHONE ROW */}

          <div className="form-row">

            <label>
              Phone Number
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  update('phone', e.target.value)
                }
                placeholder="Primary phone number"
                autoComplete="tel"
              />
            </label>

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

          <h3>Shipping Address</h3>

          <label>
            Street Address
            <textarea
              rows={3}
              value={form.address}
              onChange={(e) =>
                update('address', e.target.value)
              }
              placeholder="House / apartment number, street, landmark"
              autoComplete="street-address"
            />
          </label>

          {/* CITY + STATE */}

          <div className="form-row">

            <label>
              City
              <input
                type="text"
                value={form.city}
                onChange={(e) =>
                  update('city', e.target.value)
                }
                placeholder="City"
                autoComplete="address-level2"
              />
            </label>

            <label>
              State
              <input
                type="text"
                value={form.state}
                onChange={(e) =>
                  update('state', e.target.value)
                }
                placeholder="State"
                autoComplete="address-level1"
              />
            </label>

          </div>

          {/* ZIP + COUNTRY */}

          <div className="form-row">

            <label>
              ZIP / Pincode
              <input
                type="text"
                value={form.pincode}
                onChange={(e) =>
                  update('pincode', e.target.value)
                }
                placeholder="ZIP / Pincode"
                autoComplete="postal-code"
              />
            </label>

            <label>
              Country
              <input
                type="text"
                value={form.country}
                onChange={(e) =>
                  update('country', e.target.value)
                }
                placeholder="Country"
                autoComplete="country-name"
              />
            </label>

          </div>

          {/* DELIVERY INSTRUCTIONS */}

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
             ==================================================== */}

          <h3>Payment Method</h3>

          <div className="payment-options">

            {/* COD */}

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

            {/* UPI */}

            <label
              className={`payment-option ${
                form.paymentMethod === 'upi'
                  ? 'is-active'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={
                  form.paymentMethod === 'upi'
                }
                onChange={() =>
                  update(
                    'paymentMethod',
                    'upi'
                  )
                }
              />

              <span>
                UPI
              </span>
            </label>

            {/* CARD */}

            <label
              className={`payment-option ${
                form.paymentMethod === 'card'
                  ? 'is-active'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="card"
                checked={
                  form.paymentMethod === 'card'
                }
                onChange={() =>
                  update(
                    'paymentMethod',
                    'card'
                  )
                }
              />

              <span>
                Card
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
              : `Place Order — ₹${total.toLocaleString(
                  'en-IN'
                )}`}
          </button>

        </form>

        {/* ======================================================
           ORDER SUMMARY
           ====================================================== */}

        <div className="cart-summary">

          <h3>Order Summary</h3>

          {items.map((item) => (
            <div
              className="cart-summary__row"
              key={item.productId}
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                ₹
                {(
                  item.price *
                  item.quantity
                ).toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          <div className="cart-summary__total">
            <span>Total</span>

            <span>
              ₹
              {total.toLocaleString('en-IN')}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}