import { Router } from 'express';
import { db } from '../db.js';


const router = Router();


/* ============================================================
   GET ALL PRODUCTS / FILTER BY CATEGORY
   ============================================================ */

router.get('/', async (req, res) => {
  await db.read();

  const category = req.query.category?.trim();

  let products = Array.isArray(db.data.products)
    ? db.data.products
    : [];


  /* ==========================================================
     CATEGORY FILTER
     ========================================================== */

  if (category) {
    products = products.filter((product) => {
      const productCategory = String(product.category || '').trim();

      return (
        productCategory.toLowerCase() ===
        category.toLowerCase()
      );
    });
  }


  res.json({
    products
  });
});


/* ============================================================
   GET PRODUCT CATEGORIES
   ============================================================ */

router.get('/categories', async (req, res) => {
  await db.read();

  const products = Array.isArray(db.data.products)
    ? db.data.products
    : [];


  const categories = [
    ...new Set(
      products
        .map((product) => String(product.category || '').trim())
        .filter(Boolean)
    )
  ];


  res.json({
    categories
  });
});


/* ============================================================
   GET SINGLE PRODUCT
   ============================================================ */

router.get('/:id', async (req, res) => {
  await db.read();

  const product = db.data.products.find(
    (product) => product.id === req.params.id
  );


  if (!product) {
    return res.status(404).json({
      error: 'Product not found.'
    });
  }


  res.json({
    product
  });
});


export default router;