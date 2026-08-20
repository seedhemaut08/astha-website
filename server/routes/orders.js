import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getCollection } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* ============================================================
   PLACE ORDER
   ============================================================ */

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      items,
      fullName,
      email,
      phone,
      alternatePhone,
      address,
      shippingAddress,
      notes,
      deliveryInstructions,
      paymentMethod
    } = req.body;

    /* ==========================================================
       BASIC VALIDATION
       ========================================================== */

    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        error: 'Your cart is empty.'
      });
    }

    if (!address || !phone) {
      return res.status(400).json({
        error: 'Delivery address and phone are required.'
      });
    }

    const users = getCollection('users');
    const products = getCollection('products');
    const orders = getCollection('orders');

    /* ==========================================================
       GET USER DETAILS
       ========================================================== */

    const user = await users.findOne({
      id: req.user.id
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    /* ==========================================================
       CUSTOMER SNAPSHOT
       ========================================================== */

    const customer = {
      userId: req.user.id,

      name:
        fullName ||
        user.name ||
        '',

      email:
        email ||
        user.email ||
        '',

      phone:
        phone ||
        user.phone ||
        '',

      alternatePhone:
        alternatePhone || ''
    };

    /* ==========================================================
       SHIPPING ADDRESS SNAPSHOT
       ========================================================== */

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

    /* ==========================================================
       CALCULATE ORDER
       ========================================================== */

    let total = 0;

    const orderItems = [];

    for (const item of items) {

      const product = await products.findOne({
        id: item.productId
      });

      if (!product) {
        continue;
      }

      const qty =
        Number(item.quantity) > 0
          ? Number(item.quantity)
          : 1;

      /* ========================================================
         STOCK CHECK
         ======================================================== */

      if (
        product.stock !== undefined &&
        Number(product.stock) < qty
      ) {
        throw new Error(
          `${product.name} does not have enough stock.`
        );
      }

      /* ========================================================
         TOTAL
         ======================================================== */

      total +=
        Number(product.price) * qty;

      /* ========================================================
         REDUCE STOCK
         ======================================================== */

      if (product.stock !== undefined) {

        const newStock =
          Number(product.stock) - qty;

        await products.updateOne(
          {
            id: product.id
          },
          {
            $set: {
              stock: newStock,
              updatedAt: new Date()
            }
          }
        );
      }

      /* ========================================================
         ORDER ITEM SNAPSHOT
         ======================================================== */

      orderItems.push({
        productId: product.id,

        name: product.name,

        price:
          Number(product.price),

        quantity: qty,

        category:
          product.category || '',

        image:
          product.image ||
          product.imageUrl ||
          ''
      });
    }

    /* ==========================================================
       VALID PRODUCTS CHECK
       ========================================================== */

    if (!orderItems.length) {
      return res.status(400).json({
        error: 'No valid products found in cart.'
      });
    }

    /* ==========================================================
       CREATE ORDER
       ========================================================== */

    const now = new Date();

    const order = {

      id: nanoid(10),

      userId: req.user.id,

      customer: {
        ...customer
      },

      items: orderItems,

      total:
        Number(total.toFixed(2)),

      address,

      shippingAddress:
        finalShippingAddress,

      phone,

      alternatePhone:
        alternatePhone || '',

      deliveryInstructions:
        deliveryInstructions ||
        notes ||
        '',

      paymentMethod:
        paymentMethod ||
        'COD',

      status:
        'Placed',

      createdAt:
        now,

      updatedAt:
        now
    };

    /* ==========================================================
       SAVE ORDER
       ========================================================== */

    await orders.insertOne(order);

    /* ==========================================================
       RESPONSE
       ========================================================== */

    return res.status(201).json({
      message:
        'Order placed successfully.',

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


/* ============================================================
   GET MY ORDERS
   ============================================================ */

router.get('/my', requireAuth, async (req, res) => {

  try {

    const orders =
      getCollection('orders');

    const userOrders =
      await orders
        .find({
          userId: req.user.id
        })
        .sort({
          createdAt: -1
        })
        .toArray();

    return res.json({
      orders: userOrders
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


/* ============================================================
   CANCEL MY ORDER
   ============================================================ */

router.post('/:id/cancel', requireAuth, async (req, res) => {

  try {

    const orders =
      getCollection('orders');

    const products =
      getCollection('products');

    /* ========================================================
       FIND CUSTOMER'S OWN ORDER
       ======================================================== */

    const order =
      await orders.findOne({
        id: req.params.id,
        userId: req.user.id
      });

    if (!order) {

      return res.status(404).json({
        error:
          'Order not found.'
      });
    }

    /* ========================================================
       ONLY PLACED ORDERS CAN BE CANCELLED
       ======================================================== */

    if (order.status !== 'Placed') {

      return res.status(400).json({
        error:
          `This order cannot be cancelled because it is already ${order.status}.`
      });
    }

    /* ========================================================
       RESTORE STOCK
       ======================================================== */

    if (Array.isArray(order.items)) {

      for (const item of order.items) {

        if (!item.productId) {
          continue;
        }

        const product =
          await products.findOne({
            id: item.productId
          });

        if (
          product &&
          product.stock !== undefined
        ) {

          await products.updateOne(
            {
              id: item.productId
            },
            {
              $set: {
                stock:
                  Number(product.stock) +
                  Number(item.quantity || 1),

                updatedAt:
                  new Date()
              }
            }
          );
        }
      }
    }

    /* ========================================================
       UPDATE ORDER STATUS
       ======================================================== */

    const now =
      new Date();

    await orders.updateOne(
      {
        id: req.params.id,
        userId: req.user.id
      },
      {
        $set: {
          status:
            'Cancelled',

          cancelledAt:
            now,

          updatedAt:
            now
        }
      }
    );

    /* ========================================================
       GET UPDATED ORDER
       ======================================================== */

    const updatedOrder =
      await orders.findOne({
        id: req.params.id,
        userId: req.user.id
      });

    /* ========================================================
       RESPONSE
       ======================================================== */

    return res.json({
      message:
        'Order cancelled successfully.',

      order:
        updatedOrder
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


/* ============================================================
   GET SINGLE ORDER
   ============================================================ */

router.get('/:id', requireAuth, async (req, res) => {

  try {

    const orders =
      getCollection('orders');

    const order =
      await orders.findOne({
        id: req.params.id,
        userId: req.user.id
      });

    if (!order) {

      return res.status(404).json({
        error:
          'Order not found.'
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