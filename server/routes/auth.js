import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getCollection } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/* ============================================================
   REGISTER
   ============================================================ */

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.'
      });
    }

    const users = getCollection('users');

    const normalizedEmail = String(email).trim().toLowerCase();

    // Case-insensitive email check
    const existing = await users.findOne({
      email: {
        $regex: `^${escapeRegex(normalizedEmail)}$`,
        $options: 'i'
      }
    });

    if (existing) {
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: nanoid(10),
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      password: hashedPassword,
      createdAt: new Date()
    };

    await users.insertOne(user);

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);

    return res.status(500).json({
      error: 'Unable to create account.'
    });
  }
});


/* ============================================================
   LOGIN
   ============================================================ */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const users = getCollection('users');

    const normalizedEmail =
      String(email).trim().toLowerCase();

    /*
     * Case-insensitive search.
     * This also makes login work if an older migrated
     * account has slightly different email casing.
     */
    const user = await users.findOne({
      email: {
        $regex: `^${escapeRegex(normalizedEmail)}$`,
        $options: 'i'
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    /*
     * Existing migrated accounts use `password`.
     * passwordHash is also supported in case an older
     * account was saved with that field name.
     */
    const storedPassword =
      user.password || user.passwordHash;

    if (!storedPassword) {
      console.error(
        'LOGIN ERROR: User has no password hash:',
        user.email
      );

      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const valid = await bcrypt.compare(
      String(password),
      storedPassword
    );

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      error: 'Unable to sign in.'
    });
  }
});


/* ============================================================
   CURRENT USER
   ============================================================ */

router.get('/me', requireAuth, async (req, res) => {
  try {
    const users = getCollection('users');

    const user = await users.findOne({
      id: req.user.id
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found.'
      });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }
    });

  } catch (error) {
    console.error('GET ME ERROR:', error);

    return res.status(500).json({
      error: 'Unable to load your account.'
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