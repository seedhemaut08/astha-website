import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';
import Loader from '../components/Loader.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ orders }) => setOrders(orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="account-page">
      <div className="account-page__header">
        <div>
          <span className="eyebrow">My Account</span>
          <h1>Namaste, {user?.name?.split(' ')[0]}</h1>
          <p>{user?.email}</p>
        </div>
        <button className="btn btn--outline" onClick={logout}>Logout</button>
      </div>

      <h3 className="account-page__section-title">Order History</h3>
      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <p className="empty-state">No orders yet — your first Astha piece awaits.</p>
      ) : (
        <div className="order-list">
          {orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-card__head">
                <div>
                  <strong>Order #{order.id}</strong>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <span className="order-card__status">{order.status}</span>
              </div>
              <div className="order-card__items">
                {order.items.map(item => (
                  <div key={item.productId} className="order-card__item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="order-card__total">
                <span>Total</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
