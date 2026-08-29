import { Router } from 'express';
import { nanoid } from 'nanoid';

import { getCollection } from '../db.js';

const router = Router();

const QUERY_TIMEOUT = 5000;

/* ============================================================
   GET REVIEWS FOR A PRODUCT

   Returns the list of reviews, the average rating and the
   total review count for a single product.
   ============================================================ */

router.get('/:productId', async (req, res) => {
  try {
    const reviewsCollection = getCollection('reviews');

    const reviews = await reviewsCollection
      .find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .maxTimeMS(QUERY_TIMEOUT)
      .toArray();

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          totalReviews
        : 0;

    return res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    });
  } catch (error) {
    console.error('GET REVIEWS ERROR:', error);
    return res.status(500).json({ error: 'Unable to load reviews.' });
  }
});

/* ============================================================
   ADD / UPDATE A REVIEW

   One review per user per product. If the same user submits
   again for the same product, their existing review is
   updated instead of a duplicate being created.
   ============================================================ */

router.post('/', async (req, res) => {
  try {
    const { productId, userId, userName, rating, comment } = req.body || {};

    if (!productId || !userId || !userName) {
      return res
        .status(400)
        .json({ error: 'Missing product or user information.' });
    }

    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res
        .status(400)
        .json({ error: 'Rating must be between 1 and 5 stars.' });
    }

    const trimmedComment =
      typeof comment === 'string' ? comment.trim().slice(0, 1000) : '';

    const reviewsCollection = getCollection('reviews');

    const existing = await reviewsCollection.findOne({
      productId,
      userId,
    });

    if (existing) {
      await reviewsCollection.updateOne(
        { productId, userId },
        {
          $set: {
            rating: numericRating,
            comment: trimmedComment,
            userName,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      const updated = await reviewsCollection.findOne({
        productId,
        userId,
      });

      return res.json({ review: updated, updated: true });
    }

    const review = {
      id: nanoid(10),
      productId,
      userId,
      userName,
      rating: numericRating,
      comment: trimmedComment,
      createdAt: new Date().toISOString(),
    };

    await reviewsCollection.insertOne(review);

    return res.status(201).json({ review, updated: false });
  } catch (error) {
    console.error('POST REVIEW ERROR:', error);
    return res.status(500).json({ error: 'Unable to save review.' });
  }
});

/* ============================================================
   DELETE OWN REVIEW
   ============================================================ */

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'Missing user information.' });
    }

    const reviewsCollection = getCollection('reviews');

    const result = await reviewsCollection.deleteOne({
      id: req.params.id,
      userId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: 'Review not found or not yours to delete.' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('DELETE REVIEW ERROR:', error);
    return res.status(500).json({ error: 'Unable to delete review.' });
  }
});

export default router;