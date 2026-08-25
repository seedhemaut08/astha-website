import { useEffect, useState, useCallback } from 'react';
import { useCart } from '../context/CartContext.jsx';
import Confetti from './Confetti.jsx';

function getTimeLeft(expiry) {
  const diff = expiry.getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

export default function CouponBox() {
  const {
    couponApplied,
    applyCoupon,
    removeCoupon,
    COUPON_CODE,
    COUPON_DISCOUNT_PERCENT,
    COUPON_EXPIRY,
    isCouponWindowOpen
  } = useCart();

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(COUPON_EXPIRY));
  const [burstId, setBurstId] = useState(0);
  const [showYay, setShowYay] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(COUPON_EXPIRY));
    }, 1000);

    return () => clearInterval(interval);
  }, [COUPON_EXPIRY]);

  const handleApply = useCallback(() => {
    const result = applyCoupon();

    if (result.success) {
      setBurstId((id) => id + 1);
      setShowYay(true);
      setTimeout(() => setShowYay(false), 2200);
    }
  }, [applyCoupon]);

  // offer window closed and never applied — hide entirely
  if (!isCouponWindowOpen() && !couponApplied) {
    return null;
  }

  return (
    <div className="coupon-box">
      <Confetti trigger={burstId > 0 ? burstId : null} />

      {showYay && <div className="coupon-box__yay">yayyyyy! 🎉</div>}

      <div className="coupon-box__header">
        <span className="coupon-box__title">Raksha Bandhan Special</span>
        <span className="coupon-box__badge">{COUPON_DISCOUNT_PERCENT}% OFF</span>
      </div>

      <p className="coupon-box__line">
        A little something from our family to yours this Rakhi — every idol,
        {' '}{COUPON_DISCOUNT_PERCENT}% off with code <strong>{COUPON_CODE}</strong>.
      </p>

      {!couponApplied ? (
        <button
          type="button"
          className="btn btn--primary coupon-box__apply"
          onClick={handleApply}
        >
          Apply Coupon — {COUPON_CODE}
        </button>
      ) : (
        <div className="coupon-box__applied">
          <span>✓ {COUPON_CODE} applied — {COUPON_DISCOUNT_PERCENT}% off added</span>
          <button
            type="button"
            className="coupon-box__remove"
            onClick={removeCoupon}
          >
            Remove
          </button>
        </div>
      )}

      {timeLeft && (
        <div className="coupon-box__timer">
          <span>Offer ends in</span>
          <div className="coupon-box__timer-units">
            <div><strong>{timeLeft.days}</strong><small>d</small></div>
            <div><strong>{String(timeLeft.hours).padStart(2, '0')}</strong><small>h</small></div>
            <div><strong>{String(timeLeft.minutes).padStart(2, '0')}</strong><small>m</small></div>
            <div><strong>{String(timeLeft.seconds).padStart(2, '0')}</strong><small>s</small></div>
          </div>
        </div>
      )}
    </div>
  );
}