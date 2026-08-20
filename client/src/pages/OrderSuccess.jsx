import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import Loader from '../components/Loader.jsx';

export default function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ order }) => setOrder(order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /*
   * One-time confetti animation.
   * It appears when the Order Confirmed page opens
   * and automatically disappears after a few seconds.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="page-pad">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-pad empty-state">
        Order not found.{' '}
        <Link to="/account">View your orders</Link>
      </div>
    );
  }

  /*
   * Create one-time confetti pieces.
   */
  const confettiPieces = showConfetti
    ? Array.from({ length: 70 }, (_, index) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.35;
        const duration = 2.2 + Math.random() * 1.2;
        const rotation = Math.random() * 360;
        const size = 6 + Math.random() * 6;

        return (
          <span
            key={index}
            className="order-confetti-piece"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size * 1.6}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `rotate(${rotation}deg)`
            }}
          />
        );
      })
    : null;

  return (
    <div className="page-pad order-success">

      {/* ONE-TIME CONFETTI */}
      {showConfetti && (
        <div
          className="order-confetti"
          aria-hidden="true"
        >
          {confettiPieces}
        </div>
      )}

      <CheckCircle2
        size={56}
        strokeWidth={1.2}
        className="order-success__icon"
      />

      <h1>Order Confirmed</h1>

      <p>
        Thank you — your Astha idol is being prepared with care.
        Order ID: <strong>{order.id}</strong>
      </p>

      <div
        className="cart-summary"
        style={{
          maxWidth: 480,
          margin: '2rem auto'
        }}
      >
        {order.items.map((item) => (
          <div
            className="cart-summary__row"
            key={item.productId}
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              ₹
              {(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}

        <div className="cart-summary__total">
          <span>Total</span>

          <span>
            ₹{order.total.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <Link
        to="/shop"
        className="btn btn--primary"
      >
        Continue Shopping
      </Link>

    </div>
  );
}