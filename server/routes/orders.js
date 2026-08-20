import { Router } from 'express';
import { nanoid } from 'nanoid';
import nodemailer from 'nodemailer';
import { getCollection } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* ============================================================
   EMAIL CONFIGURATION
   ============================================================ */

const OWNER_EMAIL = 'jha01amit@gmail.com';
const OFFICIAL_EMAIL = 'info@aasthasilver.in';

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || OFFICIAL_EMAIL,
    pass: process.env.SMTP_PASS
  }
});

/* ============================================================
   CONSTANTS
   ============================================================ */

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

/* ============================================================
   CHECK WHETHER ORDER CAN BE CANCELLED
   ============================================================ */

function canCancelOrder(order) {
  if (!order) return false;

  if (order.status !== 'Placed') {
    return false;
  }

  if (!order.createdAt) {
    return false;
  }

  const createdAt = new Date(order.createdAt).getTime();

  if (Number.isNaN(createdAt)) {
    return false;
  }

  const now = Date.now();

  return now - createdAt < CANCELLATION_WINDOW_MS;
}

function getCancellationDeadline(order) {
  if (!order?.createdAt) {
    return null;
  }

  const createdAt = new Date(order.createdAt).getTime();

  if (Number.isNaN(createdAt)) {
    return null;
  }

  return new Date(
    createdAt + CANCELLATION_WINDOW_MS
  );
}

/* ============================================================
   SEND OWNER ORDER EMAIL
   ============================================================ */

async function sendOwnerOrderEmail(order) {
  try {
    const customer = order.customer || {};
    const shipping = order.shippingAddress || {};

    const itemRows = (order.items || [])
      .map(
        item => `
          <tr>
            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              color:#222;
              font-size:14px;
            ">
              ${escapeHtml(item.name || 'Product')}
            </td>

            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              text-align:center;
              color:#555;
              font-size:14px;
            ">
              ${item.quantity || 1}
            </td>

            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              text-align:right;
              color:#222;
              font-size:14px;
            ">
              ₹${Number(item.price || 0).toLocaleString('en-IN')}
            </td>

            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              text-align:right;
              color:#222;
              font-size:14px;
              font-weight:600;
            ">
              ₹${(
                Number(item.price || 0) *
                Number(item.quantity || 1)
              ).toLocaleString('en-IN')}
            </td>
          </tr>
        `
      )
      .join('');

    const deliveryInstructions =
      order.deliveryInstructions || '';

    const subject =
      `New Order #${order.id} — ₹${Number(
        order.total || 0
      ).toLocaleString('en-IN')}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>New Astha Silver Order</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f5f5f5;
        font-family:Arial,Helvetica,sans-serif;
        color:#222;
      ">

        <div style="
          width:100%;
          padding:35px 15px;
          box-sizing:border-box;
        ">

          <div style="
            max-width:700px;
            margin:0 auto;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            box-shadow:0 5px 25px rgba(0,0,0,0.08);
          ">

            <!-- HEADER -->

            <div style="
              background:#111111;
              padding:32px 30px;
              text-align:center;
            ">

              <div style="
                color:#d6b35a;
                font-size:28px;
                font-family:Georgia,'Times New Roman',serif;
                letter-spacing:1px;
                margin-bottom:8px;
              ">
                Astha
              </div>

              <div style="
                color:#ffffff;
                font-size:12px;
                letter-spacing:3px;
                text-transform:uppercase;
              ">
                Silver Idols
              </div>

            </div>

            <!-- BODY -->

            <div style="padding:30px;">

              <div style="
                background:#faf7ed;
                border-left:4px solid #c9a54d;
                padding:18px 20px;
                border-radius:6px;
                margin-bottom:28px;
              ">

                <div style="
                  font-size:20px;
                  font-weight:700;
                  color:#222;
                  margin-bottom:6px;
                ">
                  🎉 New Order Received
                </div>

                <div style="
                  font-size:14px;
                  color:#666;
                ">
                  A new order has been placed on your website.
                </div>

              </div>

              <!-- ORDER INFORMATION -->

              <h2 style="
                margin:0 0 16px;
                font-size:18px;
                color:#222;
              ">
                Order Information
              </h2>

              <table style="
                width:100%;
                border-collapse:collapse;
                margin-bottom:30px;
              ">

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#777;
                    font-size:14px;
                  ">
                    Order ID
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    font-weight:700;
                    font-size:14px;
                  ">
                    ${escapeHtml(order.id)}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#777;
                    font-size:14px;
                  ">
                    Order Status
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    font-weight:700;
                    color:#198754;
                    font-size:14px;
                  ">
                    ${escapeHtml(order.status || 'Placed')}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#777;
                    font-size:14px;
                  ">
                    Payment Method
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    font-weight:600;
                    font-size:14px;
                  ">
                    ${escapeHtml(order.paymentMethod || 'COD')}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:8px 0;
                    color:#777;
                    font-size:14px;
                  ">
                    Order Date
                  </td>

                  <td style="
                    padding:8px 0;
                    text-align:right;
                    font-size:14px;
                  ">
                    ${new Date(order.createdAt).toLocaleString(
                      'en-IN',
                      {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }
                    )}
                  </td>
                </tr>

              </table>

              <!-- CUSTOMER -->

              <h2 style="
                margin:0 0 16px;
                font-size:18px;
                color:#222;
              ">
                Customer Details
              </h2>

              <div style="
                background:#f8f8f8;
                border-radius:10px;
                padding:18px;
                margin-bottom:30px;
              ">

                <p style="
                  margin:0 0 8px;
                  font-size:14px;
                ">
                  <strong>Name:</strong>
                  ${escapeHtml(customer.name || '')}
                </p>

                <p style="
                  margin:0 0 8px;
                  font-size:14px;
                ">
                  <strong>Email:</strong>
                  ${escapeHtml(customer.email || '')}
                </p>

                <p style="
                  margin:0 0 8px;
                  font-size:14px;
                ">
                  <strong>Phone:</strong>
                  ${escapeHtml(customer.phone || '')}
                </p>

                ${
                  customer.alternatePhone
                    ? `
                      <p style="
                        margin:0;
                        font-size:14px;
                      ">
                        <strong>Alternate Phone:</strong>
                        ${escapeHtml(
                          customer.alternatePhone
                        )}
                      </p>
                    `
                    : ''
                }

              </div>

              <!-- PRODUCTS -->

              <h2 style="
                margin:0 0 16px;
                font-size:18px;
                color:#222;
              ">
                Ordered Products
              </h2>

              <table style="
                width:100%;
                border-collapse:collapse;
                margin-bottom:18px;
              ">

                <thead>

                  <tr style="
                    background:#f5f5f5;
                  ">

                    <th style="
                      padding:12px;
                      text-align:left;
                      font-size:12px;
                      color:#666;
                      text-transform:uppercase;
                    ">
                      Product
                    </th>

                    <th style="
                      padding:12px;
                      text-align:center;
                      font-size:12px;
                      color:#666;
                      text-transform:uppercase;
                    ">
                      Qty
                    </th>

                    <th style="
                      padding:12px;
                      text-align:right;
                      font-size:12px;
                      color:#666;
                      text-transform:uppercase;
                    ">
                      Price
                    </th>

                    <th style="
                      padding:12px;
                      text-align:right;
                      font-size:12px;
                      color:#666;
                      text-transform:uppercase;
                    ">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>
                  ${itemRows}
                </tbody>

              </table>

              <!-- TOTAL -->

              <div style="
                background:#111111;
                color:#ffffff;
                border-radius:10px;
                padding:20px;
                margin-bottom:30px;
              ">

                <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                ">

                  <span style="
                    font-size:16px;
                    color:#dddddd;
                  ">
                    Order Total
                  </span>

                  <strong style="
                    font-size:24px;
                    color:#d6b35a;
                  ">
                    ₹${Number(
                      order.total || 0
                    ).toLocaleString('en-IN')}
                  </strong>

                </div>

              </div>

              <!-- SHIPPING -->

              <h2 style="
                margin:0 0 16px;
                font-size:18px;
                color:#222;
              ">
                Shipping Address
              </h2>

              <div style="
                background:#f8f8f8;
                border-radius:10px;
                padding:18px;
                margin-bottom:30px;
                line-height:1.7;
                font-size:14px;
              ">

                <div>
                  ${escapeHtml(
                    shipping.street ||
                    order.address ||
                    ''
                  )}
                </div>

                ${
                  shipping.city
                    ? `<div>${escapeHtml(
                        shipping.city
                      )}</div>`
                    : ''
                }

                ${
                  shipping.state
                    ? `<div>${escapeHtml(
                        shipping.state
                      )}</div>`
                    : ''
                }

                ${
                  shipping.zipCode
                    ? `<div>${escapeHtml(
                        shipping.zipCode
                      )}</div>`
                    : ''
                }

                ${
                  shipping.country
                    ? `<div>${escapeHtml(
                        shipping.country
                      )}</div>`
                    : ''
                }

              </div>

              ${
                deliveryInstructions
                  ? `
                    <h2 style="
                      margin:0 0 16px;
                      font-size:18px;
                      color:#222;
                    ">
                      Delivery Instructions
                    </h2>

                    <div style="
                      background:#fffaf0;
                      border-radius:10px;
                      padding:18px;
                      margin-bottom:30px;
                      font-size:14px;
                      line-height:1.6;
                    ">
                      ${escapeHtml(
                        deliveryInstructions
                      )}
                    </div>
                  `
                  : ''
              }

              <!-- FOOTER -->

              <div style="
                border-top:1px solid #eeeeee;
                padding-top:22px;
                text-align:center;
              ">

                <p style="
                  margin:0 0 6px;
                  font-size:13px;
                  color:#777;
                ">
                  Please process this order from your
                  Astha Silver dashboard.
                </p>

                <p style="
                  margin:0;
                  font-size:12px;
                  color:#999;
                ">
                  This is an automated order notification
                  from aasthasilver.in
                </p>

              </div>

            </div>

          </div>

        </div>

      </body>
      </html>
    `;

    const text = `
New Order Received — Astha Silver

Order ID: ${order.id}
Status: ${order.status || 'Placed'}
Payment: ${order.paymentMethod || 'COD'}
Order Date: ${new Date(
      order.createdAt
    ).toLocaleString('en-IN')}

CUSTOMER DETAILS
Name: ${customer.name || ''}
Email: ${customer.email || ''}
Phone: ${customer.phone || ''}
Alternate Phone: ${customer.alternatePhone || ''}

ORDER ITEMS
${(order.items || [])
  .map(
    item =>
      `${item.name} × ${item.quantity} — ₹${(
        Number(item.price || 0) *
        Number(item.quantity || 1)
      ).toLocaleString('en-IN')}`
  )
  .join('\n')}

TOTAL
₹${Number(order.total || 0).toLocaleString('en-IN')}

SHIPPING ADDRESS
${shipping.street || order.address || ''}
${shipping.city || ''}
${shipping.state || ''}
${shipping.zipCode || ''}
${shipping.country || ''}

DELIVERY INSTRUCTIONS
${deliveryInstructions || 'None'}
    `.trim();

    await mailTransporter.sendMail({
      from: `"Astha Silver" <${process.env.SMTP_USER || OFFICIAL_EMAIL}>`,
      to: OWNER_EMAIL,
      subject,
      text,
      html
    });

    console.log(
      `ORDER EMAIL SENT: ${order.id} -> ${OWNER_EMAIL}`
    );

  } catch (error) {
    /*
     * Email failure must NOT cancel the order.
     * The order is already saved in MongoDB.
     */
    console.error(
      'ORDER EMAIL ERROR:',
      error
    );
  }
}

/* ============================================================
   SEND OWNER CANCELLATION EMAIL
   ============================================================ */

async function sendOwnerCancellationEmail(order) {
  try {
    const customer = order.customer || {};
    const shipping = order.shippingAddress || {};

    const itemsHtml = (order.items || [])
      .map(
        item => `
          <tr>
            <td style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
              font-size:14px;
            ">
              ${escapeHtml(item.name || 'Product')}
            </td>

            <td style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
              text-align:center;
              font-size:14px;
            ">
              ${item.quantity || 1}
            </td>

            <td style="
              padding:12px;
              border-bottom:1px solid #eeeeee;
              text-align:right;
              font-size:14px;
            ">
              ₹${(
                Number(item.price || 0) *
                Number(item.quantity || 1)
              ).toLocaleString('en-IN')}
            </td>
          </tr>
        `
      )
      .join('');

    const subject =
      `Order Cancelled #${order.id} — Astha Silver`;

    const html = `
      <!DOCTYPE html>
      <html>

      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Order Cancelled</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f5f5f5;
        font-family:Arial,Helvetica,sans-serif;
        color:#222;
      ">

        <div style="
          padding:35px 15px;
        ">

          <div style="
            max-width:650px;
            margin:0 auto;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
          ">

            <div style="
              background:#111111;
              padding:30px;
              text-align:center;
            ">

              <div style="
                color:#d6b35a;
                font-family:Georgia,'Times New Roman',serif;
                font-size:28px;
              ">
                Astha
              </div>

              <div style="
                color:#ffffff;
                font-size:12px;
                letter-spacing:3px;
                margin-top:8px;
              ">
                SILVER IDOLS
              </div>

            </div>

            <div style="
              padding:30px;
            ">

              <div style="
                background:#fff4f4;
                border-left:4px solid #dc3545;
                padding:18px;
                border-radius:6px;
                margin-bottom:25px;
              ">

                <h2 style="
                  margin:0 0 6px;
                  font-size:20px;
                ">
                  Order Cancelled
                </h2>

                <p style="
                  margin:0;
                  color:#666;
                  font-size:14px;
                ">
                  A customer has cancelled an order
                  from the Astha Silver website.
                </p>

              </div>

              <h3>Order Information</h3>

              <p>
                <strong>Order ID:</strong>
                ${escapeHtml(order.id)}
              </p>

              <p>
                <strong>Status:</strong>
                Cancelled
              </p>

              <p>
                <strong>Order Date:</strong>
                ${new Date(
                  order.createdAt
                ).toLocaleString('en-IN')}
              </p>

              <p>
                <strong>Cancelled At:</strong>
                ${new Date(
                  order.cancelledAt || new Date()
                ).toLocaleString('en-IN')}
              </p>

              <hr style="
                border:none;
                border-top:1px solid #eeeeee;
                margin:25px 0;
              " />

              <h3>Customer Details</h3>

              <p>
                <strong>Name:</strong>
                ${escapeHtml(customer.name || '')}
              </p>

              <p>
                <strong>Email:</strong>
                ${escapeHtml(customer.email || '')}
              </p>

              <p>
                <strong>Phone:</strong>
                ${escapeHtml(customer.phone || '')}
              </p>

              ${
                customer.alternatePhone
                  ? `
                    <p>
                      <strong>Alternate Phone:</strong>
                      ${escapeHtml(
                        customer.alternatePhone
                      )}
                    </p>
                  `
                  : ''
              }

              <hr style="
                border:none;
                border-top:1px solid #eeeeee;
                margin:25px 0;
              " />

              <h3>Cancelled Products</h3>

              <table style="
                width:100%;
                border-collapse:collapse;
              ">

                <thead>
                  <tr style="
                    background:#f5f5f5;
                  ">

                    <th style="
                      padding:12px;
                      text-align:left;
                      font-size:12px;
                    ">
                      Product
                    </th>

                    <th style="
                      padding:12px;
                      text-align:center;
                      font-size:12px;
                    ">
                      Qty
                    </th>

                    <th style="
                      padding:12px;
                      text-align:right;
                      font-size:12px;
                    ">
                      Total
                    </th>

                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>

              </table>

              <div style="
                background:#111111;
                color:#ffffff;
                border-radius:10px;
                padding:18px;
                margin-top:25px;
              ">

                <div style="
                  display:flex;
                  justify-content:space-between;
                ">

                  <span>
                    Cancelled Order Total
                  </span>

                  <strong style="
                    color:#d6b35a;
                    font-size:20px;
                  ">
                    ₹${Number(
                      order.total || 0
                    ).toLocaleString('en-IN')}
                  </strong>

                </div>

              </div>

              <h3 style="
                margin-top:30px;
              ">
                Shipping Address
              </h3>

              <div style="
                background:#f8f8f8;
                padding:18px;
                border-radius:10px;
                line-height:1.7;
                font-size:14px;
              ">

                <div>
                  ${escapeHtml(
                    shipping.street ||
                    order.address ||
                    ''
                  )}
                </div>

                ${
                  shipping.city
                    ? `<div>${escapeHtml(
                        shipping.city
                      )}</div>`
                    : ''
                }

                ${
                  shipping.state
                    ? `<div>${escapeHtml(
                        shipping.state
                      )}</div>`
                    : ''
                }

                ${
                  shipping.zipCode
                    ? `<div>${escapeHtml(
                        shipping.zipCode
                      )}</div>`
                    : ''
                }

                ${
                  shipping.country
                    ? `<div>${escapeHtml(
                        shipping.country
                      )}</div>`
                    : ''
                }

              </div>

              <div style="
                margin-top:30px;
                padding-top:20px;
                border-top:1px solid #eeeeee;
                text-align:center;
                color:#888;
                font-size:12px;
              ">
                Automated cancellation notification from
                aasthasilver.in
              </div>

            </div>

          </div>

        </div>

      </body>
      </html>
    `;

    const text = `
Order Cancelled — Astha Silver

Order ID: ${order.id}

Customer:
Name: ${customer.name || ''}
Email: ${customer.email || ''}
Phone: ${customer.phone || ''}

Products:
${(order.items || [])
  .map(
    item =>
      `${item.name} × ${item.quantity} — ₹${(
        Number(item.price || 0) *
        Number(item.quantity || 1)
      ).toLocaleString('en-IN')}`
  )
  .join('\n')}

Total:
₹${Number(order.total || 0).toLocaleString('en-IN')}

Shipping Address:
${shipping.street || order.address || ''}
${shipping.city || ''}
${shipping.state || ''}
${shipping.zipCode || ''}
${shipping.country || ''}

Cancelled At:
${new Date(
      order.cancelledAt || new Date()
    ).toLocaleString('en-IN')}
    `.trim();

    await mailTransporter.sendMail({
      from: `"Astha Silver" <${process.env.SMTP_USER || OFFICIAL_EMAIL}>`,
      to: OWNER_EMAIL,
      subject,
      text,
      html
    });

    console.log(
      `CANCELLATION EMAIL SENT: ${order.id} -> ${OWNER_EMAIL}`
    );

  } catch (error) {
    /*
     * Cancellation must remain successful even if
     * the notification email fails.
     */
    console.error(
      'CANCELLATION EMAIL ERROR:',
      error
    );
  }
}

/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

    if (
      !items ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res.status(400).json({
        error: 'Your cart is empty.'
      });
    }

    if (!address || !phone) {
      return res.status(400).json({
        error:
          'Delivery address and phone are required.'
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
        error:
          'No valid products found in cart.'
      });
    }

    /* ==========================================================
       CREATE ORDER
       ========================================================== */

    const now = new Date();

    const order = {
      id: nanoid(10),

      userId:
        req.user.id,

      customer: {
        ...customer
      },

      items:
        orderItems,

      total:
        Number(
          total.toFixed(2)
        ),

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
       SEND OWNER EMAIL
       ========================================================== */

    await sendOwnerOrderEmail(order);

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

router.get(
  '/my',
  requireAuth,
  async (req, res) => {
    try {
      const orders =
        getCollection('orders');

      const userOrders =
        await orders
          .find({
            userId:
              req.user.id
          })
          .sort({
            createdAt: -1
          })
          .toArray();

      /*
       * Add cancellation information to each order.
       * This will also allow the frontend to know exactly
       * when the 24-hour cancellation window expires.
       */

      const ordersWithCancellation =
        userOrders.map(order => ({
          ...order,

          canCancel:
            canCancelOrder(order),

          cancellationDeadline:
            getCancellationDeadline(order)
        }));

      return res.json({
        orders:
          ordersWithCancellation
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
  }
);

/* ============================================================
   CANCEL MY ORDER
   ============================================================ */

router.post(
  '/:id/cancel',
  requireAuth,
  async (req, res) => {
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
         24 HOUR CANCELLATION POLICY
         ======================================================== */

      if (!canCancelOrder(order)) {
        const deadline =
          getCancellationDeadline(order);

        return res.status(400).json({
          error:
            'This order can only be cancelled within 24 hours of placement.',

          cancellationDeadline:
            deadline
              ? deadline.toISOString()
              : null
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
                    Number(
                      item.quantity || 1
                    ),

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
          id:
            req.params.id,

          userId:
            req.user.id
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
          id:
            req.params.id,

          userId:
            req.user.id
        });

      /* ========================================================
         SEND CANCELLATION EMAIL
         ======================================================== */

      await sendOwnerCancellationEmail(
        updatedOrder
      );

      /* ========================================================
         RESPONSE
         ======================================================== */

      return res.json({
        message:
          'Order cancelled successfully.',

        order: {
          ...updatedOrder,

          canCancel:
            false,

          cancellationDeadline:
            getCancellationDeadline(
              updatedOrder
            )
        }
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
  }
);

/* ============================================================
   GET SINGLE ORDER
   ============================================================ */

router.get(
  '/:id',
  requireAuth,
  async (req, res) => {
    try {
      const orders =
        getCollection('orders');

      const order =
        await orders.findOne({
          id:
            req.params.id,

          userId:
            req.user.id
        });

      if (!order) {
        return res.status(404).json({
          error:
            'Order not found.'
        });
      }

      return res.json({
        order: {
          ...order,

          canCancel:
            canCancelOrder(order),

          cancellationDeadline:
            getCancellationDeadline(order)
        }
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
  }
);

/* ============================================================
   EXPORT
   ============================================================ */

export default router;