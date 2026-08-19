import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ============================================================
// PLACE ORDER
// ============================================================

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      items,

      // Customer information
      fullName,
      email,
      phone,
      alternatePhone,

      // Address
      address,
      shippingAddress,

      // Delivery
      notes,
      deliveryInstructions,

      // Payment
      paymentMethod
    } = req.body;

    // ==========================================================
    // BASIC VALIDATION
    // ==========================================================

    if (!items || !items.length) {
      return res.status(400).json({
        error: 'Your cart is empty.'
      });
    }

    if (!address || !phone) {
      return res.status(400).json({
        error: 'Delivery address and phone are required.'
      });
    }

    // ==========================================================
    // READ DATABASE
    // ==========================================================

    await db.read();

    // ==========================================================
    // GET USER DETAILS
    // ==========================================================

    const user = db.data.users?.find(
      user => user.id === req.user.id
    );

    // ==========================================================
    // CUSTOMER SNAPSHOT
    // ==========================================================

    const customer = {
      userId: req.user.id,

      name:
        fullName ||
        user?.name ||
        '',

      email:
        email ||
        user?.email ||
        '',

      phone:
        phone ||
        user?.phone ||
        '',

      alternatePhone:
        alternatePhone || ''
    };

    // ==========================================================
    // SHIPPING ADDRESS SNAPSHOT
    // ==========================================================

    const finalShippingAddress = {
      street:
        shippingAddress?.street ||
        address ||
        '',

      city:
        shippingAddress?.city ||
        '',

      state:
        shippingAddress?.state ||
        '',

      zipCode:
        shippingAddress?.zipCode ||
        '',

      country:
        shippingAddress?.country ||
        ''
    };

    // ==========================================================
    // CALCULATE ORDER TOTAL
    // ==========================================================

    let total = 0;

    const orderItems = items
      .map(item => {

        const product = db.data.products.find(
          product => product.id === item.productId
        );

        if (!product) {
          return null;
        }

        // ======================================================
        // QUANTITY
        // ======================================================

        const qty =
          Number(item.quantity) > 0
            ? Number(item.quantity)
            : 1;

        // ======================================================
        // STOCK CHECK
        // ======================================================

        if (
          product.stock !== undefined &&
          Number(product.stock) < qty
        ) {
          throw new Error(
            `${product.name} does not have enough stock.`
          );
        }

        // ======================================================
        // TOTAL
        // ======================================================

        total +=
          Number(product.price) * qty;

        // ======================================================
        // REDUCE STOCK
        // ======================================================

        if (product.stock !== undefined) {
          product.stock =
            Number(product.stock) - qty;
        }

        // ======================================================
        // ORDER ITEM
        // ======================================================

        return {
          productId: product.id,

          name: product.name,

          price: Number(product.price),

          quantity: qty,

          category: product.category || '',

          image:
            product.image ||
            product.imageUrl ||
            ''
        };
      })
      .filter(Boolean);

    // ==========================================================
    // VALID PRODUCTS CHECK
    // ==========================================================

    if (!orderItems.length) {
      return res.status(400).json({
        error: 'No valid products found in cart.'
      });
    }

    // ==========================================================
    // CREATE ORDER
    // ==========================================================

    const order = {

      // Unique order ID
      id: nanoid(10),

      // ========================================================
      // CUSTOMER
      // ========================================================

      userId: req.user.id,

      customer: {
        ...customer
      },

      // ========================================================
      // PRODUCTS
      // ========================================================

      items: orderItems,

      // ========================================================
      // PRICE
      // ========================================================

      total: Number(total.toFixed(2)),

      // ========================================================
      // ADDRESS
      // ========================================================

      address,

      shippingAddress: finalShippingAddress,

      // ========================================================
      // CONTACT
      // ========================================================

      phone: phone,

      alternatePhone:
        alternatePhone || '',

      // ========================================================
      // DELIVERY NOTES
      // ========================================================

      deliveryInstructions:
        deliveryInstructions ||
        notes ||
        '',

      // ========================================================
      // PAYMENT
      // ========================================================

      paymentMethod:
        paymentMethod || 'COD',

      // ========================================================
      // ORDER STATUS
      // ========================================================

      status: 'Placed',

      // ========================================================
      // TIMESTAMPS
      // ========================================================

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };

    // ==========================================================
    // SAVE ORDER
    // ==========================================================

    db.data.orders.push(order);

    // ==========================================================
    // SAVE DATABASE
    // ==========================================================

    await db.write();

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.status(201).json({
      message: 'Order placed successfully.',
      order
    });

  } catch (error) {

    console.error(
      'PLACE ORDER ERROR:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Unable to place order.'
    });
  }
});


// ============================================================
// GET MY ORDERS
// ============================================================

router.get('/my', requireAuth, async (req, res) => {
  try {

    await db.read();

    const orders =
      db.data.orders
        .filter(
          order =>
            order.userId === req.user.id
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

    return res.json({
      orders
    });

  } catch (error) {

    console.error(
      'GET MY ORDERS ERROR:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Unable to fetch orders.'
    });
  }
});


// ============================================================
// CANCEL MY ORDER
// ============================================================

router.post('/:id/cancel', requireAuth, async (req, res) => {
  try {

    await db.read();

    // ==========================================================
    // FIND CUSTOMER'S OWN ORDER
    // ==========================================================

    const order = db.data.orders.find(
      order =>
        order.id === req.params.id &&
        order.userId === req.user.id
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.'
      });
    }

    // ==========================================================
    // ONLY PLACED ORDERS CAN BE CANCELLED
    // ==========================================================

    if (order.status !== 'Placed') {
      return res.status(400).json({
        error:
          `This order cannot be cancelled because it is already ${order.status}.`
      });
    }

    // ==========================================================
    // RESTORE STOCK
    // ==========================================================

    if (Array.isArray(order.items)) {

      order.items.forEach(item => {

        const product = db.data.products.find(
          product =>
            product.id === item.productId
        );

        if (
          product &&
          product.stock !== undefined
        ) {
          product.stock =
            Number(product.stock) +
            Number(item.quantity || 1);
        }
      });
    }

    // ==========================================================
    // UPDATE ORDER STATUS
    // ==========================================================

    order.status = 'Cancelled';

    order.cancelledAt =
      new Date().toISOString();

    order.updatedAt =
      new Date().toISOString();

    // ==========================================================
    // SAVE DATABASE
    // ==========================================================

    await db.write();

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.json({
      message: 'Order cancelled successfully.',
      order
    });

  } catch (error) {

    console.error(
      'CANCEL ORDER ERROR:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Unable to cancel order.'
    });
  }
});


// ============================================================
// GET SINGLE ORDER
// ============================================================

router.get('/:id', requireAuth, async (req, res) => {
  try {

    await db.read();

    const order =
      db.data.orders.find(
        order =>
          order.id === req.params.id &&
          order.userId === req.user.id
      );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.'
      });
    }

    return res.json({
      order
    });

  } catch (error) {

    console.error(
      'GET ORDER ERROR:',
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        'Unable to fetch order.'
    });
  }
});


export default router;