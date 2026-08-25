import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';


/*
=========================================================
COUPON CONFIG — RAKSHA BANDHAN OFFER
=========================================================
*/

const COUPON_CODE = 'RAKHI10';
const COUPON_DISCOUNT_PERCENT = 10;

// Offer valid till end of day, 28 Aug 2026, IST
const COUPON_EXPIRY = new Date('2026-08-28T23:59:59+05:30');

function isCouponWindowOpen() {
  return Date.now() <= COUPON_EXPIRY.getTime();
}


/*
=========================================================
CART CONTEXT
=========================================================
*/

const CartContext = createContext(null);


/*
=========================================================
CART PROVIDER
=========================================================
*/

export function CartProvider({ children }) {

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('astha_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });


  /*
  ========================================================
  COUPON STATE
  ========================================================
  */

  const [couponApplied, setCouponApplied] = useState(() => {
    try {
      const saved = localStorage.getItem('astha_coupon');
      return saved === 'true' && isCouponWindowOpen();
    } catch {
      return false;
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem('astha_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [items]);


  useEffect(() => {
    try {
      localStorage.setItem('astha_coupon', couponApplied ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save coupon state:', error);
    }
  }, [couponApplied]);


  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.id) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);

      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity
        }
      ];
    });
  }, []);


  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, []);


  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);


  const clearCart = useCallback(() => {
    setItems([]);
  }, []);


  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [items]);


  const count = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);


  /*
  ========================================================
  COUPON ACTIONS
  ========================================================
  */

  const isCouponActive = couponApplied && isCouponWindowOpen();

  const applyCoupon = useCallback(() => {
    if (!isCouponWindowOpen()) {
      return { success: false, reason: 'expired' };
    }

    setCouponApplied(true);
    return { success: true };
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponApplied(false);
  }, []);

  const getDiscountedPrice = useCallback(
    (price) => {
      const p = Number(price || 0);
      return isCouponActive
        ? Math.round(p * (1 - COUPON_DISCOUNT_PERCENT / 100))
        : p;
    },
    [isCouponActive]
  );

  const discountedTotal = useMemo(() => {
    return isCouponActive
      ? Math.round(total * (1 - COUPON_DISCOUNT_PERCENT / 100))
      : total;
  }, [total, isCouponActive]);

  const couponSavings = total - discountedTotal;


  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      total,
      count,

      // coupon
      couponApplied: isCouponActive,
      applyCoupon,
      removeCoupon,
      getDiscountedPrice,
      discountedTotal,
      couponSavings,
      COUPON_CODE,
      COUPON_DISCOUNT_PERCENT,
      COUPON_EXPIRY,
      isCouponWindowOpen
    }),
    [
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      total,
      count,
      isCouponActive,
      applyCoupon,
      removeCoupon,
      getDiscountedPrice,
      discountedTotal,
      couponSavings
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  return useContext(CartContext);
}