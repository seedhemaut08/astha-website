import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';
import Loader from '../components/Loader.jsx';

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function Account() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [error, setError] = useState('');

  // Used to refresh the cancellation timer on the page.
  const [, setCurrentTime] = useState(Date.now());

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');

      const { orders } = await api.get('/orders/my');

      setOrders(orders || []);
    } catch (err) {
      setError(
        err.message ||
        'Unable to load your orders.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  /*
   * Refresh the cancellation state every minute.
   *
   * This means if the user keeps the Account page open
   * while the 24-hour window expires, the button will
   * automatically become inactive without refreshing
   * the page.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Check whether the 24-hour cancellation window
   * has expired for an order.
   */
  function isCancellationExpired(order) {
    if (!order?.createdAt) {
      return true;
    }

    const createdAt = new Date(
      order.createdAt
    ).getTime();

    if (!Number.isFinite(createdAt)) {
      return true;
    }

    return (
      Date.now() - createdAt >=
      CANCELLATION_WINDOW_MS
    );
  }

  /*
   * Cancel order.
   *
   * Frontend checks the 24-hour rule first.
   * Backend also checks it separately for security.
   */
  async function handleCancelOrder(orderId) {
    const order = orders.find(
      item => item.id === orderId
    );

    if (!order) {
      return;
    }

    if (
      order.status !== 'Placed'
    ) {
      setError(
        'This order can no longer be cancelled.'
      );
      return;
    }

    if (isCancellationExpired(order)) {
      setError(
        'This order can no longer be cancelled. Orders can only be cancelled within 24 hours of placing them.'
      );
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      setError('');

      await api.post(
        `/orders/${orderId}/cancel`
      );

      // Refresh order history after cancellation.
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
    if (!status) {
      return '';
    }

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

          {orders.map(order => {

            const cancellationExpired =
              isCancellationExpired(order);

            const canCancel =
              order.status === 'Placed' &&
              !cancellationExpired;

            return (

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
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
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
                        cancellingOrder === order.id ||
                        !canCancel
                      }
                      onClick={() =>
                        handleCancelOrder(order.id)
                      }
                    >

                      {cancellingOrder === order.id
                        ? 'Cancelling...'
                        : cancellationExpired
                          ? 'Cancellation Expired'
                          : 'Cancel Order'}

                    </button>


                    {/* =================================================
                        24-HOUR CANCELLATION POLICY
                    ================================================== */}

                    {cancellationExpired ? (

                      <small
                        style={{
                          display: 'block',
                          marginTop: '8px',
                          opacity: 0.65
                        }}
                      >
                        Cancellation window expired.
                        Orders can only be cancelled
                        within 24 hours of placing them.
                      </small>

                    ) : (

                      <small
                        style={{
                          display: 'block',
                          marginTop: '8px',
                          opacity: 0.65
                        }}
                      >
                        Orders can be cancelled within
                        24 hours of placing them.
                      </small>

                    )}

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

            );
          })}

        </div>

      )}

    </div>
  );
}