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
    address: '',
    city: '',
    pincode: '',
    phone: user?.phone || '',
    paymentMethod: 'Cash on Delivery'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.address || !form.city || !form.pincode || !form.phone) {
      setError('Please fill in all delivery details.');
      return;
    }
    setSubmitting(true);
    try {
      const fullAddress = `${form.address}, ${form.city} - ${form.pincode}`;
      const { order } = await api.post('/orders', {
        items,
        address: fullAddress,
        phone: form.phone,
        paymentMethod: form.paymentMethod
      });
      clearCart();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="page-pad empty-state"><h2>Your cart is empty</h2></div>;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-page__layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Delivery Details</h3>
          {error && <div className="form-error">{error}</div>}

          <label>
            Address
            <textarea
              rows={3}
              value={form.address}
              onChange={e => update('address', e.target.value)}
              placeholder="House no., street, landmark"
            />
          </label>

          <div className="form-row">
            <label>
              City
              <input type="text" value={form.city} onChange={e => update('city', e.target.value)} />
            </label>
            <label>
              Pincode
              <input type="text" value={form.pincode} onChange={e => update('pincode', e.target.value)} />
            </label>
          </div>

          <label>
            Phone Number
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </label>

          <h3>Payment Method</h3>
          <div className="payment-options">
            {['Cash on Delivery', 'UPI', 'Card on Delivery'].map(method => (
              <label key={method} className={`payment-option ${form.paymentMethod === method ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === method}
                  onChange={() => update('paymentMethod', method)}
                />
                {method}
              </label>
            ))}
          </div>

          <button className="btn btn--primary btn--full" type="submit" disabled={submitting}>
            {submitting ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
          </button>
        </form>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {items.map(item => (
            <div className="cart-summary__row" key={item.productId}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="cart-summary__total">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
