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

  /*
  ========================================================
  CART ITEMS
  ========================================================

  Load the cart from localStorage only once when the
  provider is initially created.
  ========================================================
  */

  const [items, setItems] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          'astha_cart'
        );

      return saved
        ? JSON.parse(saved)
        : [];

    } catch {

      return [];

    }
  });


  /*
  ========================================================
  SAVE CART
  ========================================================

  The cart is persisted whenever the items actually change.
  ========================================================
  */

  useEffect(() => {

    try {

      localStorage.setItem(
        'astha_cart',
        JSON.stringify(items)
      );

    } catch (error) {

      console.error(
        'Failed to save cart:',
        error
      );

    }

  }, [items]);


  /*
  ========================================================
  ADD TO CART
  ========================================================
  */

  const addToCart = useCallback(
    (product, quantity = 1) => {

      if (!product?.id) {
        return;
      }

      setItems((prev) => {

        const existing =
          prev.find(
            (item) =>
              item.productId === product.id
          );


        /*
        ==================================================
        EXISTING PRODUCT
        ==================================================
        */

        if (existing) {

          return prev.map(
            (item) =>
              item.productId === product.id
                ? {
                    ...item,
                    quantity:
                      item.quantity +
                      quantity
                  }
                : item
          );
        }


        /*
        ==================================================
        NEW PRODUCT
        ==================================================
        */

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

    },
    []
  );


  /*
  ========================================================
  UPDATE QUANTITY
  ========================================================
  */

  const updateQuantity = useCallback(
    (productId, quantity) => {

      /*
      If quantity becomes zero or negative,
      remove the item from the cart.
      */

      if (quantity <= 0) {

        setItems(
          (prev) =>
            prev.filter(
              (item) =>
                item.productId !==
                productId
            )
        );

        return;
      }


      /*
      Update only the matching product.
      */

      setItems(
        (prev) =>
          prev.map(
            (item) =>
              item.productId ===
              productId
                ? {
                    ...item,
                    quantity
                  }
                : item
          )
      );

    },
    []
  );


  /*
  ========================================================
  REMOVE FROM CART
  ========================================================
  */

  const removeFromCart = useCallback(
    (productId) => {

      setItems(
        (prev) =>
          prev.filter(
            (item) =>
              item.productId !==
              productId
          )
      );

    },
    []
  );


  /*
  ========================================================
  CLEAR CART
  ========================================================
  */

  const clearCart = useCallback(() => {

    setItems([]);

  }, []);


  /*
  ========================================================
  TOTAL
  ========================================================
  */

  const total = useMemo(() => {

    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    );

  }, [items]);


  /*
  ========================================================
  COUNT
  ========================================================
  */

  const count = useMemo(() => {

    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    );

  }, [items]);


  /*
  ========================================================
  CONTEXT VALUE
  ========================================================

  Memoizing the context value prevents a brand-new object
  from being created on every CartProvider render.

  This helps reduce unnecessary renders in components that
  consume the cart context.
  ========================================================
  */

  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      total,
      count
    }),
    [
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      total,
      count
    ]
  );


  /*
  ========================================================
  PROVIDER
  ========================================================
  */

  return (

    <CartContext.Provider
      value={contextValue}
    >

      {children}

    </CartContext.Provider>

  );
}


/*
=========================================================
USE CART HOOK
=========================================================
*/

export function useCart() {

  return useContext(
    CartContext
  );

}