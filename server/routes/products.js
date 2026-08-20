import { Router } from 'express';
import { getCollection } from '../db.js';

const router = Router();

/* ============================================================
   GET ALL PRODUCTS / FILTER BY CATEGORY
   ============================================================ */

router.get('/', async (req, res) => {
  try {
    const productsCollection = getCollection('products');

    const category = req.query.category?.trim();

    const filter = category
      ? {
          category: {
            $regex: `^${escapeRegex(category)}$`,
            $options: 'i'
          }
        }
      : {};

    const products = await productsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      products
    });

  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);

    res.status(500).json({
      error: 'Unable to load products.'
    });
  }
});


/* ============================================================
   GET PRODUCT CATEGORIES
   ============================================================ */

router.get('/categories', async (req, res) => {
  try {
    const productsCollection = getCollection('products');

    const categories = await productsCollection.distinct('category');

    res.json({
      categories: categories
        .map(category => String(category || '').trim())
        .filter(Boolean)
        .sort()
    });

  } catch (error) {
    console.error('GET CATEGORIES ERROR:', error);

    res.status(500).json({
      error: 'Unable to load categories.'
    });
  }
});


/* ============================================================
   GET SINGLE PRODUCT
   ============================================================ */

router.get('/:id', async (req, res) => {
  try {
    const productsCollection = getCollection('products');

    const product = await productsCollection.findOne({
      id: req.params.id
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found.'
      });
    }

    res.json({
      product
    });

  } catch (error) {
    console.error('GET PRODUCT ERROR:', error);

    res.status(500).json({
      error: 'Unable to load product.'
    });
  }
});


/* ============================================================
   ESCAPE REGEX
   ============================================================ */

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


export default router;