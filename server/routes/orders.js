import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getCollection } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();


/* ============================================================
   EMAIL CONFIGURATION
   ============================================================ */

const OWNER_EMAIL =
  'jha01amit@gmail.com';

const OFFICIAL_EMAIL =
  'info@aasthasilver.in';


const RESEND_API_KEY =
  String(
    process.env.RESEND_API_KEY || ''
  ).trim();


const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM ||
  `Astha Silver <${OFFICIAL_EMAIL}>`;


const EMAIL_TIMEOUT_MS =
  8000;


/* ============================================================
   SEND EMAIL USING RESEND
   ============================================================ */

async function sendEmail({
  to,
  subject,
  text,
  html
}) {

  if (!RESEND_API_KEY) {

    console.error(
      'EMAIL ERROR: RESEND_API_KEY is not configured.'
    );

    return false;
  }


  const controller =
    new AbortController();


  const timeout =
    setTimeout(() => {

      controller.abort();

    }, EMAIL_TIMEOUT_MS);


  try {

    const response =
      await fetch(
        'https://api.resend.com/emails',
        {

          method:
            'POST',

          headers: {

            Authorization:
              `Bearer ${RESEND_API_KEY}`,

            'Content-Type':
              'application/json'

          },

          body:
            JSON.stringify({

              from:
                EMAIL_FROM,

              to:
                Array.isArray(to)
                  ? to
                  : [to],

              subject,

              text,

              html

            }),

          signal:
            controller.signal

        }
      );


    const result =
      await response
        .json()
        .catch(() => ({}));


    if (!response.ok) {

      console.error(
        'EMAIL API ERROR:',
        response.status,
        result
      );

      return false;
    }


    console.log(
      'EMAIL SENT SUCCESSFULLY:',
      result
    );


    return true;


  } catch (error) {

    console.error(

      'EMAIL SEND ERROR:',

      error?.name === 'AbortError'
        ? 'Email API request timed out.'
        : error

    );


    return false;


  } finally {

    clearTimeout(
      timeout
    );

  }

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHtml(value) {

  return String(
    value ?? ''
  )

    .replace(
      /&/g,
      '&amp;'
    )

    .replace(
      /</g,
      '&lt;'
    )

    .replace(
      />/g,
      '&gt;'
    )

    .replace(
      /"/g,
      '&quot;'
    )

    .replace(
      /'/g,
      '&#039;'
    );

}


/* ============================================================
   CANCELLATION CONFIGURATION
   ============================================================ */

const CANCELLATION_WINDOW_MS =
  24 * 60 * 60 * 1000;


/* ============================================================
   CHECK WHETHER ORDER CAN BE CANCELLED
   ============================================================ */

function canCancelOrder(order) {

  if (!order) {

    return false;

  }


  if (
    order.status !==
    'Placed'
  ) {

    return false;

  }


  if (
    !order.createdAt
  ) {

    return false;

  }


  const createdAt =
    new Date(
      order.createdAt
    ).getTime();


  if (
    Number.isNaN(
      createdAt
    )
  ) {

    return false;

  }


  return (

    Date.now() -
    createdAt <
    CANCELLATION_WINDOW_MS

  );

}


/* ============================================================
   GET CANCELLATION DEADLINE
   ============================================================ */

function getCancellationDeadline(order) {

  if (
    !order?.createdAt
  ) {

    return null;

  }


  const createdAt =
    new Date(
      order.createdAt
    ).getTime();


  if (
    Number.isNaN(
      createdAt
    )
  ) {

    return null;

  }


  return new Date(

    createdAt +
    CANCELLATION_WINDOW_MS

  );

}


/* ============================================================
   SEND OWNER ORDER EMAIL
   ============================================================ */

async function sendOwnerOrderEmail(order) {

  try {

    const customer =
      order.customer || {};


    const shipping =
      order.shippingAddress || {};


    const items =
      Array.isArray(
        order.items
      )

        ? order.items

        : [];


    /* --------------------------------------------------------
       PRODUCT ROWS
       -------------------------------------------------------- */

    const itemRows =
      items

        .map(item => {

          const quantity =
            Number(
              item.quantity
            ) > 0

              ? Number(
                item.quantity
              )

              : 1;


          const price =
            Number(
              item.price || 0
            );


          const itemTotal =
            price *
            quantity;


          return `
          <tr>

            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              color:#222;
              font-size:14px;
            ">
              ${escapeHtml(
            item.name ||
            'Product'
          )}
            </td>


            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              text-align:center;
              color:#555;
              font-size:14px;
            ">
              ${quantity}
            </td>


            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              text-align:right;
              color:#222;
              font-size:14px;
            ">
              ₹${price.toLocaleString(
            'en-IN'
          )}
            </td>


            <td style="
              padding:14px 12px;
              border-bottom:1px solid #e8e8e8;
              text-align:right;
              color:#222;
              font-size:14px;
              font-weight:600;
            ">
              ₹${itemTotal.toLocaleString(
            'en-IN'
          )}
            </td>

          </tr>
        `;

        })

        .join('');


    /* --------------------------------------------------------
       EMAIL SUBJECT
       -------------------------------------------------------- */

    const subject =
      `New Order #${order.id} — ₹${Number(
        order.total || 0
      ).toLocaleString(
        'en-IN'
      )}`;


    /* --------------------------------------------------------
       PLAIN TEXT EMAIL
       -------------------------------------------------------- */

    const text = `
New Order Received - Astha Silver

Order ID:
${order.id}

Order Status:
${order.status || 'Placed'}

Payment Method:
${order.paymentMethod || 'COD'}

Order Date:
${new Date(
      order.createdAt
    ).toLocaleString(
      'en-IN'
    )}


CUSTOMER DETAILS

Name:
${customer.name || ''}

Email:
${customer.email || ''}

Phone:
${customer.phone || ''}

Alternate Phone:
${customer.alternatePhone || ''}


ORDER ITEMS

${items
        .map(item => {

          const quantity =
            Number(
              item.quantity
            ) > 0

              ? Number(
                item.quantity
              )

              : 1;


          const price =
            Number(
              item.price || 0
            );


          return `${item.name || 'Product'} × ${quantity} — ₹${(
            price *
            quantity
          ).toLocaleString(
            'en-IN'
          )}`;

        })
        .join('\n')}


TOTAL:

₹${Number(
          order.total || 0
        ).toLocaleString(
          'en-IN'
        )}


SHIPPING ADDRESS

${shipping.street || order.address || ''}

${shipping.city || ''}

${shipping.state || ''}

${shipping.zipCode || ''}

${shipping.country || ''}


DELIVERY INSTRUCTIONS

${order.deliveryInstructions || 'None'}
    `.trim();


    /* --------------------------------------------------------
       HTML EMAIL
       -------------------------------------------------------- */

    const html = `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    New Astha Silver Order
  </title>

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
      box-shadow:
        0 5px 25px
        rgba(0,0,0,0.08);
    ">


      <!-- HEADER -->

      <div style="
        background:#111111;
        padding:32px 30px;
        text-align:center;
      ">

        <div style="
          color:#d6b35a;
          font-size:30px;
          font-family:
            Georgia,
            'Times New Roman',
            serif;
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

      <div style="
        padding:30px;
      ">


        <!-- SUCCESS BOX -->

        <div style="
          background:#faf7ed;
          border-left:
            4px solid #c9a54d;
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
            A new order has been placed
            on your website.
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
              ${escapeHtml(
      order.id
    )}
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
              ${escapeHtml(
      order.status ||
      'Placed'
    )}
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
              ${escapeHtml(
      order.paymentMethod ||
      'COD'
    )}
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
              ${new Date(
      order.createdAt
    ).toLocaleString(
      'en-IN'
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
            ${escapeHtml(
      customer.name || ''
    )}
          </p>


          <p style="
            margin:0 0 8px;
            font-size:14px;
          ">
            <strong>Email:</strong>
            ${escapeHtml(
      customer.email || ''
    )}
          </p>


          <p style="
            margin:0 0 8px;
            font-size:14px;
          ">
            <strong>Phone:</strong>
            ${escapeHtml(
      customer.phone || ''
    )}
          </p>


          ${customer.alternatePhone
        ? `
                <p style="
                  margin:0;
                  font-size:14px;
                ">
                  <strong>
                    Alternate Phone:
                  </strong>

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
          display:flex;
          justify-content:space-between;
          align-items:center;
          background:#111111;
          color:#ffffff;
          padding:18px 20px;
          border-radius:8px;
          margin-bottom:30px;
        ">

          <span style="
            font-size:16px;
            font-weight:600;
          ">
            Order Total
          </span>


          <span style="
            color:#d6b35a;
            font-size:20px;
            font-weight:700;
          ">
            ₹${Number(
        order.total || 0
      ).toLocaleString(
        'en-IN'
      )}
          </span>

        </div>


        <!-- SHIPPING ADDRESS -->

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
          color:#444;
        ">

          <div>
            ${escapeHtml(
        shipping.street ||
        order.address ||
        ''
      )}
          </div>


          <div>
            ${escapeHtml(
        shipping.city ||
        ''
      )}
          </div>


          <div>
            ${escapeHtml(
        shipping.state ||
        ''
      )}
          </div>


          <div>
            ${escapeHtml(
        shipping.zipCode ||
        ''
      )}
          </div>


          <div>
            ${escapeHtml(
        shipping.country ||
        ''
      )}
          </div>

        </div>


        <!-- DELIVERY INSTRUCTIONS -->

        <h2 style="
          margin:0 0 16px;
          font-size:18px;
          color:#222;
        ">
          Delivery Instructions
        </h2>


        <div style="
          background:#f8f8f8;
          border-radius:10px;
          padding:18px;
          margin-bottom:30px;
          font-size:14px;
          color:#444;
          line-height:1.6;
        ">
          ${escapeHtml(
        order.deliveryInstructions ||
        'None'
      )}
        </div>


        <!-- FOOTER -->

        <div style="
          border-top:1px solid #eeeeee;
          padding-top:20px;
          color:#888888;
          font-size:12px;
          line-height:1.6;
          text-align:center;
        ">

          This email was automatically generated
          by the Astha Silver website.


          <br />


          ${escapeHtml(
        OFFICIAL_EMAIL
      )}

        </div>


      </div>

    </div>

  </div>


</body>

</html>
    `.trim();


    /* --------------------------------------------------------
       SEND OWNER EMAIL
       -------------------------------------------------------- */

    const sent =
      await sendEmail({

        to:
          OWNER_EMAIL,

        subject,

        text,

        html

      });


    if (!sent) {

      console.error(
        'OWNER ORDER EMAIL WAS NOT SENT:',
        order.id
      );

    }


    return sent;


  } catch (error) {

    console.error(
      'BUILD ORDER EMAIL ERROR:',
      error
    );


    return false;

  }

}


/* ============================================================
   CREATE ORDER
   ============================================================ */

router.post(
  '/',
  requireAuth,
  async (req, res) => {

    try {

      const {
        items,
        customer,
        shippingAddress,
        address,
        paymentMethod,
        deliveryInstructions,
        total,

        // Checkout.jsx se directly aane wali customer details
        fullName,
        email,
        phone,
        alternatePhone
      } = req.body;


      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        return res.status(400).json({

          error:
            'Your cart is empty.'

        });

      }


      const orderCollection =
        getCollection('orders');


      const orderId =
        `ASTHA-${nanoid(10).toUpperCase()}`;


      const normalizedItems =
        items.map(item => ({

          productId:
            item.productId ||
            item.id ||
            '',

          name:
            String(
              item.name ||
              'Product'
            ),

          price:
            Number(
              item.price || 0
            ),

          quantity:
            Number(
              item.quantity
            ) > 0

              ? Number(
                item.quantity
              )

              : 1,

          image:
            item.image ||
            item.imageUrl ||
            ''

        }));


      const calculatedTotal =
        normalizedItems.reduce(
          (
            sum,
            item
          ) => {

            return sum +
              (
                item.price *
                item.quantity
              );

          },
          0
        );


      const orderTotal =
        Number(
          total
        ) > 0

          ? Number(
            total
          )

          : calculatedTotal;


      const now =
        new Date();


      const order = {

        customer: {
          name:
            customer?.name ||
            fullName ||
            req.user.name ||
            '',

          email:
            customer?.email ||
            email ||
            req.user.email ||
            '',

          phone:
            customer?.phone ||
            phone ||
            req.user.phone ||
            '',

          alternatePhone:
            customer?.alternatePhone ||
            alternatePhone ||
            ''
        },

        items:
          normalizedItems,

        shippingAddress:
          shippingAddress || {

            street:
              address || '',

            city:
              '',

            state:
              '',

            zipCode:
              '',

            country:
              'India'

          },

        address:
          address ||
          shippingAddress?.street ||
          '',

        paymentMethod:
          paymentMethod ||
          'COD',

        deliveryInstructions:
          deliveryInstructions ||
          '',

        total:
          orderTotal,

        status:
          'Placed',

        createdAt:
          now,

        updatedAt:
          now

      };


      await orderCollection.insertOne(
        order
      );


      /*
       * Send owner notification after the
       * order has successfully been saved.
       *
       * Email failure must NOT make a valid
       * order disappear or become a failed
       * order response.
       */

      sendOwnerOrderEmail(
        order
      ).catch(error => {

        console.error(
          'ASYNC OWNER EMAIL ERROR:',
          error
        );

      });


      return res.status(201).json({

        success:
          true,

        message:
          'Order placed successfully.',

        order

      });


    } catch (error) {

      console.error(
        'CREATE ORDER ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to place your order. Please try again.'

      });

    }

  }
);
/* ============================================================
   GET CUSTOMER ORDERS
   ============================================================ */

router.get(
  '/',
  requireAuth,
  async (req, res) => {

    try {

      const orderCollection =
        getCollection('orders');


      const orders =
        await orderCollection
          .find({
            userId:
              req.user.id
          })
          .sort({
            createdAt:
              -1
          })
          .toArray();


      const normalizedOrders =
        orders.map(order => ({

          ...order,

          canCancel:
            canCancelOrder(
              order
            ),

          cancellationDeadline:
            getCancellationDeadline(
              order
            )

        }));


      return res.json({

        orders:
          normalizedOrders

      });


    } catch (error) {

      console.error(
        'GET CUSTOMER ORDERS ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to load your orders.'

      });

    }

  }
);


/* ============================================================
   GET SINGLE CUSTOMER ORDER
   ============================================================ */

router.get(
  '/:id',
  requireAuth,
  async (req, res) => {

    try {

      const orderCollection =
        getCollection('orders');


      const order =
        await orderCollection.findOne({

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
            canCancelOrder(
              order
            ),

          cancellationDeadline:
            getCancellationDeadline(
              order
            )

        }

      });


    } catch (error) {

      console.error(
        'GET SINGLE ORDER ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to load this order.'

      });

    }

  }
);


/* ============================================================
   CANCEL ORDER
   ============================================================ */

router.post(
  '/:id/cancel',
  requireAuth,
  async (req, res) => {

    try {

      const orderCollection =
        getCollection('orders');


      const order =
        await orderCollection.findOne({

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


      if (
        !canCancelOrder(
          order
        )
      ) {

        return res.status(400).json({

          error:
            'This order can no longer be cancelled.'

        });

      }


      const cancellationReason =
        String(
          req.body?.reason ||
          'Cancelled by customer'
        ).trim();


      const updatedAt =
        new Date();


      const result =
        await orderCollection.updateOne(

          {

            id:
              req.params.id,

            userId:
              req.user.id,

            status:
              'Placed'

          },

          {

            $set: {

              status:
                'Cancelled',

              cancellationReason,

              cancelledAt:
                updatedAt,

              updatedAt

            }

          }

        );


      if (
        result.matchedCount === 0
      ) {

        return res.status(400).json({

          error:
            'Unable to cancel this order.'

        });

      }


      const updatedOrder =
        await orderCollection.findOne({

          id:
            req.params.id,

          userId:
            req.user.id

        });


      return res.json({

        success:
          true,

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
          'Unable to cancel your order.'

      });

    }

  }
);


/* ============================================================
   ADMIN / OWNER — GET ALL ORDERS
   ============================================================

   This endpoint is intentionally protected.

   The current authentication middleware must provide
   the authenticated user information.

   Only users explicitly marked as admin/owner can access
   the complete order list.

   ============================================================ */

router.get(
  '/admin/all',
  requireAuth,
  async (req, res) => {

    try {

      const role =
        String(
          req.user?.role ||
          ''
        ).toLowerCase();


      const email =
        String(
          req.user?.email ||
          ''
        ).toLowerCase();


      const isOwner =
        email ===
        OWNER_EMAIL.toLowerCase();


      const isAdmin =
        role ===
        'admin';


      if (
        !isAdmin &&
        !isOwner
      ) {

        return res.status(403).json({

          error:
            'You are not authorized to view all orders.'

        });

      }


      const orderCollection =
        getCollection('orders');


      const orders =
        await orderCollection
          .find({})
          .sort({
            createdAt:
              -1
          })
          .toArray();


      return res.json({

        orders

      });


    } catch (error) {

      console.error(
        'GET ALL ORDERS ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to load orders.'

      });

    }

  }
);


/* ============================================================
   ADMIN / OWNER — UPDATE ORDER STATUS
   ============================================================ */

router.patch(
  '/admin/:id/status',
  requireAuth,
  async (req, res) => {

    try {

      const role =
        String(
          req.user?.role ||
          ''
        ).toLowerCase();


      const email =
        String(
          req.user?.email ||
          ''
        ).toLowerCase();


      const isOwner =
        email ===
        OWNER_EMAIL.toLowerCase();


      const isAdmin =
        role ===
        'admin';


      if (
        !isAdmin &&
        !isOwner
      ) {

        return res.status(403).json({

          error:
            'You are not authorized to update orders.'

        });

      }


      const {
        status
      } = req.body;


      const allowedStatuses = [

        'Placed',

        'Confirmed',

        'Processing',

        'Shipped',

        'Out for Delivery',

        'Delivered',

        'Cancelled'

      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          error:
            'Invalid order status.'

        });

      }


      const orderCollection =
        getCollection('orders');


      const updatedAt =
        new Date();


      const result =
        await orderCollection.updateOne(

          {
            id:
              req.params.id
          },

          {

            $set: {

              status,

              updatedAt

            }

          }

        );


      if (
        result.matchedCount === 0
      ) {

        return res.status(404).json({

          error:
            'Order not found.'

        });

      }


      const updatedOrder =
        await orderCollection.findOne({

          id:
            req.params.id

        });


      return res.json({

        success:
          true,

        message:
          'Order status updated successfully.',

        order:
          updatedOrder

      });


    } catch (error) {

      console.error(
        'UPDATE ORDER STATUS ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to update order status.'

      });

    }

  }
);


/* ============================================================
   ADMIN / OWNER — RESEND ORDER EMAIL
   ============================================================

   This endpoint allows the owner to manually resend the
   order notification email if an email provider temporarily
   failed during the original order placement.

   ============================================================ */

router.post(
  '/admin/:id/resend-email',
  requireAuth,
  async (req, res) => {

    try {

      const role =
        String(
          req.user?.role ||
          ''
        ).toLowerCase();


      const email =
        String(
          req.user?.email ||
          ''
        ).toLowerCase();


      const isOwner =
        email ===
        OWNER_EMAIL.toLowerCase();


      const isAdmin =
        role ===
        'admin';


      if (
        !isAdmin &&
        !isOwner
      ) {

        return res.status(403).json({

          error:
            'You are not authorized to resend order emails.'

        });

      }


      const orderCollection =
        getCollection('orders');


      const order =
        await orderCollection.findOne({

          id:
            req.params.id

        });


      if (!order) {

        return res.status(404).json({

          error:
            'Order not found.'

        });

      }


      const sent =
        await sendOwnerOrderEmail(
          order
        );


      if (!sent) {

        return res.status(502).json({

          error:
            'Unable to send the order email. Please check the Resend configuration.'

        });

      }


      return res.json({

        success:
          true,

        message:
          'Order email sent successfully.'

      });


    } catch (error) {

      console.error(
        'RESEND ORDER EMAIL ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to resend order email.'

      });

    }

  }
);


/* ============================================================
   EMAIL CONFIGURATION STATUS
   ============================================================

   This endpoint does not expose the API key.

   It only confirms whether the server has loaded the
   Resend configuration.

   ============================================================ */

router.get(
  '/admin/email-status',
  requireAuth,
  async (req, res) => {

    try {

      const role =
        String(
          req.user?.role ||
          ''
        ).toLowerCase();


      const email =
        String(
          req.user?.email ||
          ''
        ).toLowerCase();


      const isOwner =
        email ===
        OWNER_EMAIL.toLowerCase();


      const isAdmin =
        role ===
        'admin';


      if (
        !isAdmin &&
        !isOwner
      ) {

        return res.status(403).json({

          error:
            'You are not authorized to view email configuration.'

        });

      }


      return res.json({

        provider:
          'Resend',

        configured:
          Boolean(
            RESEND_API_KEY
          ),

        from:
          EMAIL_FROM,

        ownerEmail:
          OWNER_EMAIL

      });


    } catch (error) {

      console.error(
        'EMAIL STATUS ERROR:',
        error
      );


      return res.status(500).json({

        error:
          'Unable to check email configuration.'

      });

    }

  }
);


/* ============================================================
   ORDER EMAIL INFORMATION
   ============================================================

   Order emails are sent from:

   info@aasthasilver.in

   to:

   jha01amit@gmail.com

   The email contains:

   - Order ID
   - Order status
   - Payment method
   - Order date
   - Customer name
   - Customer email
   - Customer phone
   - Alternate phone
   - Ordered products
   - Quantity
   - Individual price
   - Individual item total
   - Complete order total
   - Shipping address
   - Delivery instructions

   ============================================================ */


/* ============================================================
   ORDER CREATION BEHAVIOUR
   ============================================================

   The order is inserted into the database first.

   The owner email is then sent asynchronously.

   This is intentional.

   A temporary email-provider/network problem should not
   cause a successful customer order to be rejected.

   ============================================================ */


/* ============================================================
   RESEND ERROR HANDLING
   ============================================================

   The email helper returns false when:

   - RESEND_API_KEY is missing
   - Resend returns a non-success HTTP status
   - The request times out
   - A network error occurs

   The order itself remains saved.

   ============================================================ */


/* ============================================================
   SECURITY
   ============================================================

   The Resend API key is never returned through an API
   response.

   It remains inside process.env.RESEND_API_KEY.

   ============================================================ */


/* ============================================================
   ROUTER EXPORT
   ============================================================ */

export default router;