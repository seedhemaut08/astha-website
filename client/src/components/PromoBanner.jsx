import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

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

export default function PromoBanner() {
  const { COUPON_CODE, COUPON_EXPIRY, isCouponWindowOpen } = useCart();

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(COUPON_EXPIRY));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(COUPON_EXPIRY));
    }, 1000);

    return () => clearInterval(interval);
  }, [COUPON_EXPIRY]);

  if (!isCouponWindowOpen() || !timeLeft) return null;

  return (
    <div className="promo-banner" role="status" aria-label="Raksha Bandhan offer">

      <div className="promo-banner__inner">

        <span className="promo-banner__text">
          ✨ Raksha Bandhan Special — extra 10% OFF · Code <strong>{COUPON_CODE}</strong>
        </span>

        <div className="promo-banner__timer" aria-label="Offer time remaining">
          <span className="promo-banner__timer-unit">
            {String(timeLeft.days).padStart(2, '0')}<small>d</small>
          </span>
          <span className="promo-banner__timer-sep">:</span>
          <span className="promo-banner__timer-unit">
            {String(timeLeft.hours).padStart(2, '0')}<small>h</small>
          </span>
          <span className="promo-banner__timer-sep">:</span>
          <span className="promo-banner__timer-unit">
            {String(timeLeft.minutes).padStart(2, '0')}<small>m</small>
          </span>
          <span className="promo-banner__timer-sep">:</span>
          <span className="promo-banner__timer-unit promo-banner__timer-unit--seconds">
            {String(timeLeft.seconds).padStart(2, '0')}<small>s</small>
          </span>
        </div>

      </div>

    </div>
  );
}