import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import Loader from '../components/Loader.jsx';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ order }) => setOrder(order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-pad"><Loader /></div>;
  if (!order) return <div className="page-pad empty-state">Order not found. <Link to="/account">View your orders</Link></div>;

  return (
    <div className="page-pad order-success">
      <CheckCircle2 size={56} strokeWidth={1.2} className="order-success__icon" />
      <h1>Order Confirmed</h1>
      <p>Thank you — your Astha idol is being prepared with care. Order ID: <strong>{order.id}</strong></p>
      <div className="cart-summary" style={{ maxWidth: 480, margin: '2rem auto' }}>
        {order.items.map(item => (
          <div className="cart-summary__row" key={item.productId}>
            <span>{item.name} × {item.quantity}</span>
            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div className="cart-summary__total">
          <span>Total</span>
          <span>₹{order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
      <Link to="/shop" className="btn btn--primary">Continue Shopping</Link>
    </div>
  );
}
