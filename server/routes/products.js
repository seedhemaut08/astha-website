import { Router } from 'express';

import { getCollection } from '../db.js';

const router = Router();


/* ============================================================
   DATABASE QUERY TIME LIMIT
   ============================================================

   A database query should never be allowed to hang forever.

   If MongoDB cannot complete the query within this time,
   the route will fail quickly and return a proper error
   instead of keeping the browser waiting indefinitely.
   ============================================================ */

const QUERY_TIMEOUT = 5000;


/* ============================================================
   GET ALL PRODUCTS / FILTER BY CATEGORY
   ============================================================ */

router.get('/', async (req, res) => {

  try {

    const productsCollection =
      getCollection('products');


    /* ========================================================
       CATEGORY FILTER
       ======================================================== */

    const category =
      typeof req.query.category === 'string'
        ? req.query.category.trim()
        : '';


    const filter = category
      ? {
          category: {
            $regex: `^${escapeRegex(category)}$`,
            $options: 'i',
          },
        }
      : {};


    /* ========================================================
       FETCH PRODUCTS

       maxTimeMS prevents an indefinitely hanging MongoDB
       query.

       sort keeps the existing newest-first behavior.
       ======================================================== */

    const products =
      await productsCollection
        .find(filter)
        .sort({
          createdAt: -1,
        })
        .maxTimeMS(QUERY_TIMEOUT)
        .toArray();


    /* ========================================================
       RESPONSE
       ======================================================== */

    return res.json({
      products,
    });

  } catch (error) {

    console.error(
      'GET PRODUCTS ERROR:',
      error
    );


    return res.status(500).json({
      error:
        'Unable to load products.',
    });

  }

});


/* ============================================================
   GET PRODUCT CATEGORIES
   ============================================================ */

router.get(
  '/categories',
  async (req, res) => {

    try {

      const productsCollection =
        getCollection('products');


      const categories =
        await productsCollection
          .distinct('category')
          .then((result) => result);


      return res.json({

        categories:
          categories
            .map(
              (category) =>
                String(
                  category || ''
                ).trim()
            )
            .filter(Boolean)
            .sort(),

      });

    } catch (error) {

      console.error(
        'GET CATEGORIES ERROR:',
        error
      );


      return res.status(500).json({
        error:
          'Unable to load categories.',
      });

    }

  }
);


/* ============================================================
   GET SINGLE PRODUCT
   ============================================================ */

router.get(
  '/:id',
  async (req, res) => {

    try {

      const productsCollection =
        getCollection('products');


      const product =
        await productsCollection
          .findOne(
            {
              id: req.params.id,
            },
            {
              maxTimeMS:
                QUERY_TIMEOUT,
            }
          );


      if (!product) {

        return res.status(404).json({
          error:
            'Product not found.',
        });

      }


      return res.json({
        product,
      });

    } catch (error) {

      console.error(
        'GET PRODUCT ERROR:',
        error
      );


      return res.status(500).json({
        error:
          'Unable to load product.',
      });

    }

  }
);


/* ============================================================
   ESCAPE REGEX
   ============================================================

   Prevents special regex characters in a category name
   from changing the MongoDB regex query.
   ============================================================ */

function escapeRegex(value) {

  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

}


/* ============================================================
   EXPORT
   ============================================================ */

export default router;