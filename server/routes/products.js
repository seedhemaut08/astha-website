import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  await db.read();
  const { category } = req.query;
  let products = db.data.products;
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ products });
});

router.get('/categories', async (req, res) => {
  await db.read();
  const categories = [...new Set(db.data.products.map(p => p.category))];
  res.json({ categories });
});

router.get('/:id', async (req, res) => {
  await db.read();
  const product = db.data.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json({ product });
});

export default router;
