import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleCheckout() {
    navigate(user ? '/checkout' : '/login', { state: { from: { pathname: '/checkout' } } });
  }

  if (items.length === 0) {
    return (
      <div className="page-pad empty-state">
        <h2>Your cart is empty</h2>
        <p>Let devotion guide your next piece.</p>
        <Link to="/shop" className="btn btn--primary">Browse the Collection</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-page__layout">
        <div className="cart-list">
          {items.map(item => (
            <div className="cart-item" key={item.productId}>
              <div className="cart-item__info">
                <span className="cart-item__category">{item.category}</span>
                <Link to={`/product/${item.productId}`} className="cart-item__name">{item.name}</Link>
                <span className="cart-item__price">₹{item.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item__subtotal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
              <button className="cart-item__remove" onClick={() => removeFromCart(item.productId)} aria-label="Remove item">
                <Trash2 size={17} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <div className="cart-summary__row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="cart-summary__total">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button className="btn btn--primary btn--full" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
