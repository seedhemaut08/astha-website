import { Router } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const { items, address, phone, paymentMethod } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Your cart is empty.' });
  }
  if (!address || !phone) {
    return res.status(400).json({ error: 'Delivery address and phone are required.' });
  }

  await db.read();

  let total = 0;
  const orderItems = items.map(item => {
    const product = db.data.products.find(p => p.id === item.productId);
    if (!product) return null;
    const qty = item.quantity || 1;
    total += product.price * qty;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      category: product.category
    };
  }).filter(Boolean);

  if (!orderItems.length) {
    return res.status(400).json({ error: 'No valid products found in cart.' });
  }

  const order = {
    id: nanoid(10),
    userId: req.user.id,
    items: orderItems,
    total,
    address,
    phone,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    status: 'Placed',
    createdAt: new Date().toISOString()
  };

  db.data.orders.push(order);
  await db.write();

  res.status(201).json({ order });
});

router.get('/my', requireAuth, async (req, res) => {
  await db.read();
  const orders = db.data.orders
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders });
});

router.get('/:id', requireAuth, async (req, res) => {
  await db.read();
  const order = db.data.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
});

export default router;
