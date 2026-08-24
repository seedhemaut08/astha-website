import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api';
import Loader from '../components/Loader.jsx';
import './Account.css';

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function Account() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmingOrder, setConfirmingOrder] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Used to refresh the cancellation timer on the page.
  const [, setCurrentTime] = useState(Date.now());

  /* ============================================================
     LOAD ORDERS

     FIXED: this previously called '/orders/my', which does not
     exist as a backend route. The request was silently falling
     through to GET /orders/:id with id="my", which always
     returned 404 "Order not found." The correct endpoint is
     the plain '/orders' collection route.
     ============================================================ */

  async function loadOrders() {
    try {
      setLoading(true);
      setError('');

      const { orders } = await api.get('/orders');

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
   * Refresh the cancellation state every minute so the
   * button automatically disables once the 24-hour window
   * expires, without requiring a page refresh.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /*
   * Auto-dismiss the toast after a few seconds.
   */
  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  function isCancellationExpired(order) {
    if (!order?.createdAt) return true;

    const createdAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(createdAt)) return true;

    return Date.now() - createdAt >= CANCELLATION_WINDOW_MS;
  }

  function getTimeRemaining(order) {
    const createdAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(createdAt)) return '';

    const remaining = CANCELLATION_WINDOW_MS - (Date.now() - createdAt);
    if (remaining <= 0) return '';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor(
      (remaining % (60 * 60 * 1000)) / (60 * 1000)
    );

    if (hours > 0) return `${hours}h ${minutes}m left to cancel`;
    return `${minutes}m left to cancel`;
  }

  /*
   * Cancellation now happens through a small inline
   * confirmation panel instead of a native browser confirm(),
   * and supports an optional reason.
   */
  function openCancelConfirm(orderId) {
    setError('');
    setCancelReason('');
    setConfirmingOrder(orderId);
  }

  function closeCancelConfirm() {
    setConfirmingOrder(null);
    setCancelReason('');
  }

  async function handleCancelOrder(orderId) {
    const order = orders.find(item => item.id === orderId);
    if (!order) return;

    if (order.status !== 'Placed') {
      setError('This order can no longer be cancelled.');
      return;
    }

    if (isCancellationExpired(order)) {
      setError(
        'This order can no longer be cancelled. Orders can only be cancelled within 24 hours of placing them.'
      );
      return;
    }

    try {
      setCancellingOrder(orderId);
      setError('');

      await api.post(`/orders/${orderId}/cancel`, {
        reason: cancelReason.trim() || undefined
      });

      setToast('Order cancelled. We\u2019ve let our team know.');
      closeCancelConfirm();

      await loadOrders();
    } catch (err) {
      setError(err.message || 'Unable to cancel this order.');
    } finally {
      setCancellingOrder(null);
    }
  }

  function getStatusClass(status) {
    if (!status) return '';
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  const firstName = user?.name?.split(' ')[0] || 'there';
  const initial = (user?.name || user?.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase();

  const activeOrders = orders.filter(
    o => o.status !== 'Cancelled' && o.status !== 'Delivered'
  ).length;

  const totalSpent = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="account-page">

      {toast && (
        <div className="account-toast" role="status">
          {toast}
        </div>
      )}

      {/* =====================================================
          ACCOUNT HEADER
      ====================================================== */}

      <div className="account-header">

        <div className="account-header__identity">

          <div className="account-avatar" aria-hidden="true">
            {initial}
          </div>

          <div>
            <span className="account-eyebrow">My Account</span>
            <h1>Namaste, {firstName}</h1>
            <p className="account-header__email">{user?.email}</p>
          </div>

        </div>

        <button
          type="button"
          className="account-logout"
          onClick={logout}
        >
          Logout
        </button>

      </div>

      {/* =====================================================
          SUMMARY STRIP
      ====================================================== */}

      {!loading && orders.length > 0 && (
        <div className="account-summary">

          <div className="account-summary__stat">
            <span className="account-summary__value">
              {orders.length}
            </span>
            <span className="account-summary__label">
              Total Orders
            </span>
          </div>

          <div className="account-summary__divider" />

          <div className="account-summary__stat">
            <span className="account-summary__value">
              {activeOrders}
            </span>
            <span className="account-summary__label">
              In Progress
            </span>
          </div>

          <div className="account-summary__divider" />

          <div className="account-summary__stat">
            <span className="account-summary__value">
              &#8377;{totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="account-summary__label">
              Lifetime Value
            </span>
          </div>

        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <div className="account-error" role="alert">
          {error}
        </div>
      )}

      {/* =====================================================
          ORDER HISTORY
      ====================================================== */}

      <div className="account-section-head">
        <h2>Order History</h2>
      </div>

      {loading ? (

        <Loader />

      ) : orders.length === 0 ? (

        <div className="account-empty">
          <div className="account-empty__mark">&#10022;</div>
          <h3>No orders yet</h3>
          <p>Your first Astha piece awaits.</p>
          <Link to="/shop" className="btn btn--primary">
            Browse the Collection
          </Link>
        </div>

      ) : (

        <div className="order-list">

          {orders.map(order => {

            const cancellationExpired = isCancellationExpired(order);
            const canCancel =
              order.status === 'Placed' && !cancellationExpired;
            const timeRemaining = canCancel
              ? getTimeRemaining(order)
              : '';
            const isConfirming = confirmingOrder === order.id;

            return (

              <div className="order-card" key={order.id}>

                {/* ORDER HEADER */}

                <div className="order-card__head">

                  <div className="order-card__id-block">
                    <span className="order-card__label">
                      Order
                    </span>
                    <strong>#{order.id}</strong>
                    <span className="order-card__date">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <span
                    className={`order-status order-status--${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                </div>

                {/* ORDER ITEMS */}

                <div className="order-card__items">

                  {order.items?.map((item, index) => (

                    <div
                      key={item.productId || index}
                      className="order-card__item"
                    >
                      <span className="order-card__item-name">
                        {item.name}
                        <span className="order-card__item-qty">
                          &times;{item.quantity}
                        </span>
                      </span>

                      <span className="order-card__item-price">
                        &#8377;
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>

                  ))}

                </div>

                {/* ORDER TOTAL */}

                <div className="order-card__total">
                  <span>Total</span>
                  <span>
                    &#8377;{Number(order.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* CANCEL FLOW */}

                {order.status === 'Placed' && !isConfirming && (

                  <div className="order-card__actions">

                    <button
                      type="button"
                      className="btn btn--danger-outline"
                      disabled={!canCancel}
                      onClick={() => openCancelConfirm(order.id)}
                    >
                      {cancellationExpired
                        ? 'Cancellation Window Closed'
                        : 'Cancel Order'}
                    </button>

                    {timeRemaining && (
                      <small className="order-card__hint">
                        {timeRemaining}
                      </small>
                    )}

                  </div>

                )}

                {isConfirming && (

                  <div className="order-card__confirm">

                    <p>
                      Cancel order #{order.id}? This can&rsquo;t be
                      undone.
                    </p>

                    <textarea
                      className="order-card__reason"
                      placeholder="Reason for cancelling (optional)"
                      rows={2}
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                    />

                    <div className="order-card__confirm-actions">

                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={closeCancelConfirm}
                        disabled={cancellingOrder === order.id}
                      >
                        Keep Order
                      </button>

                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id
                          ? 'Cancelling...'
                          : 'Yes, Cancel Order'}
                      </button>

                    </div>

                  </div>

                )}

                {/* CANCELLED MESSAGE */}

                {order.status === 'Cancelled' && (

                  <div className="order-card__cancelled">
                    <span>This order was cancelled.</span>
                    {order.cancelledAt && (
                      <small>
                        Cancelled on {formatDate(order.cancelledAt)}
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
