import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';
import Loader from '../components/Loader.jsx';

export default function Account() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');

      const { orders } = await api.get('/orders/my');
      setOrders(orders || []);
    } catch (err) {
      setError(err.message || 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleCancelOrder(orderId) {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) return;

    try {
      setCancellingOrder(orderId);
      setError('');

      await api.post(`/orders/${orderId}/cancel`);

      // Refresh orders after successful cancellation
      await loadOrders();

    } catch (err) {
      setError(
        err.message ||
        'Unable to cancel this order.'
      );
    } finally {
      setCancellingOrder(null);
    }
  }

  function getStatusClass(status) {
    if (!status) return '';

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  return (
    <div className="account-page">

      {/* =====================================================
          ACCOUNT HEADER
      ====================================================== */}

      <div className="account-page__header">
        <div>
          <span className="eyebrow">
            My Account
          </span>

          <h1>
            Namaste, {user?.name?.split(' ')[0]}
          </h1>

          <p>
            {user?.email}
          </p>
        </div>

        <button
          className="btn btn--outline"
          onClick={logout}
        >
          Logout
        </button>
      </div>


      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="form-error account-error">
          {error}
        </div>
      )}


      {/* =====================================================
          ORDER HISTORY
      ====================================================== */}

      <h3 className="account-page__section-title">
        Order History
      </h3>


      {loading ? (

        <Loader />

      ) : orders.length === 0 ? (

        <p className="empty-state">
          No orders yet — your first Astha piece awaits.
        </p>

      ) : (

        <div className="order-list">

          {orders.map(order => (

            <div
              className="order-card"
              key={order.id}
            >

              {/* =================================================
                  ORDER HEADER
              ================================================== */}

              <div className="order-card__head">

                <div>
                  <strong>
                    Order #{order.id}
                  </strong>

                  <span>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }
                    )}
                  </span>
                </div>


                <span
                  className={`order-card__status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

              </div>


              {/* =================================================
                  ORDER ITEMS
              ================================================== */}

              <div className="order-card__items">

                {order.items?.map(item => (

                  <div
                    key={item.productId}
                    className="order-card__item"
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

              </div>


              {/* =================================================
                  ORDER TOTAL
              ================================================== */}

              <div className="order-card__total">

                <span>
                  Total
                </span>

                <span>
                  ₹
                  {Number(order.total || 0)
                    .toLocaleString('en-IN')}
                </span>

              </div>


              {/* =================================================
                  CANCEL ORDER
              ================================================== */}

              {order.status === 'Placed' && (

                <div className="order-card__actions">

                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={
                      cancellingOrder === order.id
                    }
                    onClick={() =>
                      handleCancelOrder(order.id)
                    }
                  >
                    {cancellingOrder === order.id
                      ? 'Cancelling...'
                      : 'Cancel Order'}
                  </button>

                </div>

              )}


              {/* =================================================
                  CANCELLED MESSAGE
              ================================================== */}

              {order.status === 'Cancelled' && (

                <div className="order-card__cancelled">

                  <span>
                    This order has been cancelled.
                  </span>

                  {order.cancelledAt && (
                    <small>
                      Cancelled on{' '}
                      {new Date(
                        order.cancelledAt
                      ).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }
                      )}
                    </small>
                  )}

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}