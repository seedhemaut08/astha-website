import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import nodemailer from 'nodemailer';

import { getCollection } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/* ============================================================
   EMAIL CONFIGURATION
   ============================================================ */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || 'true') === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/* ============================================================
   OTP HELPERS
   ============================================================ */

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function sendOtpEmail({
  email,
  otp,
  type = 'signup'
}) {
  let subject;
  let heading;
  let intro;

  if (type === 'signup') {
    subject = 'Verify your email — Astha Silver';
    heading = 'Welcome to Astha Silver';
    intro =
      'Thank you for creating an account with Astha Silver. Please use the verification code below to complete your registration.';
  } else {
    subject = 'Password reset OTP — Astha Silver';
    heading = 'Password Reset Request';
    intro =
      'We received a request to reset your Astha Silver account password. Use the verification code below to continue.';
  }

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      'Astha Silver <info@aasthasilver.in>',

    to: email,

    subject,

    text: `${heading}\n\n${intro}\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, you can safely ignore this email.\n\nAstha Silver\nhttps://aasthasilver.in`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${subject}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#080808;
  font-family:Arial, Helvetica, sans-serif;
  color:#f5f5f5;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background:#080808; padding:40px 15px;"
  >

    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:600px;
            background:#111111;
            border:1px solid #292929;
            border-radius:16px;
            overflow:hidden;
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              align="center"
              style="
                padding:32px 25px 20px;
                border-bottom:1px solid #292929;
              "
            >

              <div
                style="
                  font-size:28px;
                  color:#d7ad4f;
                  font-family:Georgia, serif;
                  letter-spacing:1px;
                "
              >
                आस्था
              </div>

              <div
                style="
                  margin-top:6px;
                  color:#a7a7a7;
                  font-size:11px;
                  letter-spacing:3px;
                "
              >
                ASTHA SILVER
              </div>

            </td>
          </tr>

          <!-- CONTENT -->

          <tr>
            <td style="padding:40px 35px;">

              <div
                style="
                  color:#d7ad4f;
                  font-size:12px;
                  font-weight:bold;
                  letter-spacing:3px;
                  text-transform:uppercase;
                  margin-bottom:15px;
                "
              >
                ${type === 'signup' ? 'Email Verification' : 'Security Verification'}
              </div>

              <h1
                style="
                  margin:0 0 18px;
                  color:#ffffff;
                  font-family:Georgia, serif;
                  font-size:30px;
                  font-weight:normal;
                "
              >
                ${heading}
              </h1>

              <p
                style="
                  margin:0 0 30px;
                  color:#b8b8b8;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                ${intro}
              </p>

              <!-- OTP BOX -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background:#181818;
                  border:1px solid #3a3a3a;
                  border-radius:12px;
                "
              >

                <tr>
                  <td align="center" style="padding:28px 20px;">

                    <div
                      style="
                        color:#8f8f8f;
                        font-size:12px;
                        letter-spacing:2px;
                        text-transform:uppercase;
                        margin-bottom:12px;
                      "
                    >
                      Your verification code
                    </div>

                    <div
                      style="
                        color:#e3bc61;
                        font-size:38px;
                        font-weight:bold;
                        letter-spacing:10px;
                      "
                    >
                      ${otp}
                    </div>

                  </td>
                </tr>

              </table>

              <p
                style="
                  margin:25px 0 0;
                  color:#888888;
                  font-size:13px;
                  line-height:1.6;
                  text-align:center;
                "
              >
                This verification code expires in
                <strong style="color:#d7ad4f;">
                  10 minutes
                </strong>.
              </p>

              <div
                style="
                  margin-top:30px;
                  padding:18px;
                  background:#151515;
                  border-left:3px solid #d7ad4f;
                  color:#858585;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                If you did not request this verification code,
                you can safely ignore this email. Your account
                remains secure.
              </div>

            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td
              align="center"
              style="
                padding:25px;
                border-top:1px solid #292929;
                color:#777777;
                font-size:12px;
                line-height:1.7;
              "
            >

              <div style="color:#d7ad4f; margin-bottom:5px;">
                Astha Silver
              </div>

              Crafted with care, made to be cherished.

              <br />

              <a
                href="https://aasthasilver.in"
                style="
                  color:#999999;
                  text-decoration:none;
                "
              >
                aasthasilver.in
              </a>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
`
  });
}

/* ============================================================
   REGISTER
   ============================================================

   FIRST REQUEST:
   POST /register
   {
     name,
     email,
     password,
     phone
   }

   → OTP sent

   SECOND REQUEST:
   POST /register
   {
     name,
     email,
     password,
     phone,
     otp
   }

   → Account created
   ============================================================ */

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      otp
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.'
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const users = getCollection('users');
    const otpCollection = getCollection('otpVerifications');

    /* --------------------------------------------------------
       CHECK EXISTING USER
       -------------------------------------------------------- */

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

    /* --------------------------------------------------------
       OTP VERIFICATION
       -------------------------------------------------------- */

    if (otp) {
      const verification = await otpCollection.findOne({
        email: normalizedEmail,
        purpose: 'signup'
      });

      if (!verification) {
        return res.status(400).json({
          error: 'OTP not found or expired. Please request a new OTP.'
        });
      }

      if (
        verification.expiresAt &&
        new Date(verification.expiresAt) < new Date()
      ) {
        await otpCollection.deleteOne({
          _id: verification._id
        });

        return res.status(400).json({
          error: 'OTP has expired. Please request a new OTP.'
        });
      }

      const validOtp = await bcrypt.compare(
        String(otp),
        verification.otpHash
      );

      if (!validOtp) {
        return res.status(400).json({
          error: 'Invalid OTP. Please check the code and try again.'
        });
      }

      const hashedPassword = await bcrypt.hash(
        String(password),
        10
      );

      const user = {
        id: nanoid(10),
        name: String(name).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : '',
        password: hashedPassword,
        createdAt: new Date()
      };

      await users.insertOne(user);

      await otpCollection.deleteOne({
        _id: verification._id
      });

      const token = signToken(user);

      return res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        }
      });
    }

    /* --------------------------------------------------------
       GENERATE SIGNUP OTP
       -------------------------------------------------------- */

    const existingOtp = await otpCollection.findOne({
      email: normalizedEmail,
      purpose: 'signup'
    });

    if (
      existingOtp &&
      existingOtp.lastSentAt &&
      Date.now() -
        new Date(existingOtp.lastSentAt).getTime() <
        60 * 1000
    ) {
      return res.status(429).json({
        error:
          'Please wait 60 seconds before requesting another OTP.'
      });
    }

    const generatedOtp = generateOtp();

    const otpHash = await bcrypt.hash(
      generatedOtp,
      10
    );

    await otpCollection.deleteMany({
      email: normalizedEmail,
      purpose: 'signup'
    });

    await otpCollection.insertOne({
      email: normalizedEmail,
      purpose: 'signup',
      otpHash,
      expiresAt: getOtpExpiry(),
      lastSentAt: new Date(),
      createdAt: new Date()
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp: generatedOtp,
      type: 'signup'
    });

    return res.status(200).json({
      requiresOtp: true,
      message:
        'A verification code has been sent to your email address.',
      email: normalizedEmail
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);

    return res.status(500).json({
      error: 'Unable to process registration.'
    });
  }
});


/* ============================================================
   RESEND SIGNUP OTP
   ============================================================ */

router.post('/register/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required.'
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const users = getCollection('users');
    const otpCollection = getCollection('otpVerifications');

    const existingUser = await users.findOne({
      email: {
        $regex: `^${escapeRegex(normalizedEmail)}$`,
        $options: 'i'
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    const previousOtp = await otpCollection.findOne({
      email: normalizedEmail,
      purpose: 'signup'
    });

    if (
      previousOtp &&
      previousOtp.lastSentAt &&
      Date.now() -
        new Date(previousOtp.lastSentAt).getTime() <
        60 * 1000
    ) {
      return res.status(429).json({
        error:
          'Please wait 60 seconds before requesting another OTP.'
      });
    }

    const generatedOtp = generateOtp();

    const otpHash = await bcrypt.hash(
      generatedOtp,
      10
    );

    await otpCollection.deleteMany({
      email: normalizedEmail,
      purpose: 'signup'
    });

    await otpCollection.insertOne({
      email: normalizedEmail,
      purpose: 'signup',
      otpHash,
      expiresAt: getOtpExpiry(),
      lastSentAt: new Date(),
      createdAt: new Date()
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp: generatedOtp,
      type: 'signup'
    });

    return res.json({
      message: 'A new verification code has been sent.'
    });

  } catch (error) {
    console.error('RESEND SIGNUP OTP ERROR:', error);

    return res.status(500).json({
      error: 'Unable to resend verification code.'
    });
  }
});


/* ============================================================
   LOGIN
   ============================================================ */

router.post('/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const users = getCollection('users');

    const normalizedEmail =
      normalizeEmail(email);

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

    const storedPassword =
      user.password ||
      user.passwordHash;

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
   FORGOT PASSWORD — SEND OTP
   ============================================================ */

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required.'
      });
    }

    const normalizedEmail =
      normalizeEmail(email);

    const users = getCollection('users');
    const otpCollection =
      getCollection('otpVerifications');

    const user = await users.findOne({
      email: {
        $regex: `^${escapeRegex(normalizedEmail)}$`,
        $options: 'i'
      }
    });

    /*
     * Do not reveal whether an email exists.
     */

    if (!user) {
      return res.json({
        message:
          'If an account exists with this email, a verification code has been sent.'
      });
    }

    const previousOtp = await otpCollection.findOne({
      email: normalizedEmail,
      purpose: 'password-reset'
    });

    if (
      previousOtp &&
      previousOtp.lastSentAt &&
      Date.now() -
        new Date(previousOtp.lastSentAt).getTime() <
        60 * 1000
    ) {
      return res.status(429).json({
        error:
          'Please wait 60 seconds before requesting another OTP.'
      });
    }

    const generatedOtp = generateOtp();

    const otpHash = await bcrypt.hash(
      generatedOtp,
      10
    );

    await otpCollection.deleteMany({
      email: normalizedEmail,
      purpose: 'password-reset'
    });

    await otpCollection.insertOne({
      email: normalizedEmail,
      purpose: 'password-reset',
      otpHash,
      expiresAt: getOtpExpiry(),
      lastSentAt: new Date(),
      createdAt: new Date()
    });

    await sendOtpEmail({
      email: normalizedEmail,
      otp: generatedOtp,
      type: 'password-reset'
    });

    return res.json({
      requiresOtp: true,
      message:
        'If an account exists with this email, a verification code has been sent.',
      email: normalizedEmail
    });

  } catch (error) {
    console.error(
      'FORGOT PASSWORD ERROR:',
      error
    );

    return res.status(500).json({
      error:
        'Unable to process password reset request.'
    });
  }
});


/* ============================================================
   FORGOT PASSWORD — VERIFY OTP
   ============================================================ */

router.post(
  '/forgot-password/verify-otp',
  async (req, res) => {
    try {
      const {
        email,
        otp
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          error: 'Email and OTP are required.'
        });
      }

      const normalizedEmail =
        normalizeEmail(email);

      const otpCollection =
        getCollection('otpVerifications');

      const verification =
        await otpCollection.findOne({
          email: normalizedEmail,
          purpose: 'password-reset'
        });

      if (!verification) {
        return res.status(400).json({
          error:
            'OTP not found or expired. Please request a new OTP.'
        });
      }

      if (
        verification.expiresAt &&
        new Date(verification.expiresAt) < new Date()
      ) {
        await otpCollection.deleteOne({
          _id: verification._id
        });

        return res.status(400).json({
          error:
            'OTP has expired. Please request a new OTP.'
        });
      }

      const validOtp =
        await bcrypt.compare(
          String(otp),
          verification.otpHash
        );

      if (!validOtp) {
        return res.status(400).json({
          error:
            'Invalid OTP. Please check the code and try again.'
        });
      }

      const resetToken = nanoid(40);

      await otpCollection.updateOne(
        {
          _id: verification._id
        },
        {
          $set: {
            verified: true,
            resetToken,
            verifiedAt: new Date(),
            resetTokenExpiresAt:
              new Date(
                Date.now() + 15 * 60 * 1000
              )
          }
        }
      );

      return res.json({
        verified: true,
        resetToken,
        message:
          'OTP verified successfully. You can now reset your password.'
      });

    } catch (error) {
      console.error(
        'VERIFY RESET OTP ERROR:',
        error
      );

      return res.status(500).json({
        error:
          'Unable to verify OTP.'
      });
    }
  }
);


/* ============================================================
   RESET PASSWORD
   ============================================================ */

router.post(
  '/reset-password',
  async (req, res) => {
    try {
      const {
        email,
        resetToken,
        newPassword
      } = req.body;

      if (
        !email ||
        !resetToken ||
        !newPassword
      ) {
        return res.status(400).json({
          error:
            'Email, reset token and new password are required.'
        });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({
          error:
            'Password must be at least 6 characters.'
        });
      }

      const normalizedEmail =
        normalizeEmail(email);

      const otpCollection =
        getCollection('otpVerifications');

      const users =
        getCollection('users');

      const verification =
        await otpCollection.findOne({
          email: normalizedEmail,
          purpose: 'password-reset',
          resetToken,
          verified: true
        });

      if (!verification) {
        return res.status(400).json({
          error:
            'Invalid or expired password reset session.'
        });
      }

      if (
        !verification.resetTokenExpiresAt ||
        new Date(
          verification.resetTokenExpiresAt
        ) < new Date()
      ) {
        await otpCollection.deleteOne({
          _id: verification._id
        });

        return res.status(400).json({
          error:
            'Password reset session has expired. Please start again.'
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          String(newPassword),
          10
        );

      const result =
        await users.updateOne(
          {
            email: {
              $regex:
                `^${escapeRegex(normalizedEmail)}$`,
              $options: 'i'
            }
          },
          {
            $set: {
              password: hashedPassword,
              updatedAt: new Date()
            }
          }
        );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      await otpCollection.deleteOne({
        _id: verification._id
      });

      return res.json({
        success: true,
        message:
          'Password reset successfully. You can now sign in with your new password.'
      });

    } catch (error) {
      console.error(
        'RESET PASSWORD ERROR:',
        error
      );

      return res.status(500).json({
        error:
          'Unable to reset password.'
      });
    }
  }
);


/* ============================================================
   CURRENT USER
   ============================================================ */

router.get(
  '/me',
  requireAuth,
  async (req, res) => {
    try {
      const users =
        getCollection('users');

      const user =
        await users.findOne({
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
      console.error(
        'GET ME ERROR:',
        error
      );

      return res.status(500).json({
        error:
          'Unable to load your account.'
      });
    }
  }
);


export default router;