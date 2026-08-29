/*
=========================================================
ASTHA SILVER API SERVER
=========================================================

Main Express server entry point.

IMPORTANT:

The HTTP server starts immediately.

MongoDB initialization runs after the server has started
so the entire website/API does not remain unavailable while
MongoDB is connecting.

This means:

1. Express starts immediately.
2. Health endpoint becomes available immediately.
3. MongoDB connects in the background.
4. API routes return a fast 503 response if the database
   is not ready yet instead of hanging indefinitely.

dotenv/config is loaded before importing route modules.

This is required because some route modules, especially
the authentication route, create services such as the
Nodemailer transporter during module initialization.
=========================================================
*/


/*
=========================================================
LOAD ENVIRONMENT VARIABLES FIRST
=========================================================
*/

import 'dotenv/config';


/*
=========================================================
IMPORTS
=========================================================
*/

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import {
  initDb,
  getCollection,
} from './db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';


/*
=========================================================
APP INITIALIZATION
=========================================================
*/

const app = express();


/*
=========================================================
PORT
=========================================================
*/

const PORT =
  Number(process.env.PORT) || 5000;


/*
=========================================================
DATABASE STATE
=========================================================
*/

let databaseReady = false;


/*
=========================================================
CORS
=========================================================
*/

app.use(
  cors()
);


/*
=========================================================
JSON BODY PARSER
=========================================================
*/

app.use(
  express.json({
    limit: '1mb',
  })
);


/*
=========================================================
REQUEST LOGGER
=========================================================
*/

app.use(
  morgan('dev')
);


/*
=========================================================
HEALTH CHECK
=========================================================

This endpoint intentionally does NOT require MongoDB.

It should respond immediately as long as Express itself
is running.

The database status is included separately so deployment
platforms and monitoring systems can see whether MongoDB
is ready.
=========================================================
*/

app.get(
  '/api/health',
  (req, res) => {

    res.status(
      databaseReady
        ? 200
        : 503
    ).json({

      status:
        databaseReady
          ? 'ok'
          : 'starting',

      brand:
        'Astha',

      database:
        databaseReady
          ? 'connected'
          : 'connecting',

    });

  }
);


/*
=========================================================
DATABASE READINESS MIDDLEWARE
=========================================================

Only database-dependent API routes use this middleware.

If MongoDB is not ready, the request receives an immediate
503 response.

It does NOT wait for MongoDB.
It does NOT sleep.
It does NOT retry inside the HTTP request.
=========================================================
*/

function requireDatabase(
  req,
  res,
  next
) {

  if (!databaseReady) {

    return res.status(503).json({

      error:
        'Database is temporarily unavailable. Please try again.',

      code:
        'DATABASE_NOT_READY',

    });

  }


  return next();

}


/*
=========================================================
AUTH ROUTES
=========================================================
*/

app.use(
  '/api/auth',
  requireDatabase,
  authRoutes
);


/*
=========================================================
PRODUCT ROUTES
=========================================================
*/

app.use(
  '/api/products',
  requireDatabase,
  productRoutes
);


/*
=========================================================
ORDER ROUTES
=========================================================
*/

app.use(
  '/api/orders',
  requireDatabase,
  orderRoutes
);


/*
=========================================================
REVIEW ROUTES
=========================================================
*/

app.use(
  '/api/reviews',
  requireDatabase,
  reviewRoutes
);


/*
=========================================================
404 HANDLER
=========================================================
*/

app.use(
  (req, res) => {

    res.status(404).json({

      error:
        'Route not found.',

    });

  }
);


/*
=========================================================
GLOBAL ERROR HANDLER
=========================================================
*/

app.use(
  (err, req, res, next) => {

    console.error(
      'GLOBAL SERVER ERROR:',
      err
    );


    if (res.headersSent) {
      return next(err);
    }


    res.status(500).json({

      error:
        'Something went wrong on our end.',

    });

  }
);


/*
=========================================================
START HTTP SERVER
=========================================================

IMPORTANT:

The HTTP server starts FIRST.

MongoDB initialization happens after this.

This prevents MongoDB connection problems from preventing
Express from starting.
=========================================================
*/

function startHttpServer() {

  return new Promise(
    (resolve, reject) => {

      const server =
        app.listen(
          PORT,
          () => {

            console.log(
              `✨ Astha API running on http://localhost:${PORT}`
            );

            console.log(
              `📡 API base path: /api`
            );

            console.log(
              `📧 SMTP user configured: ${
                process.env.SMTP_USER
                  ? 'YES'
                  : 'NO'
              }`
            );

            console.log(
              '🌐 HTTP server started successfully.'
            );

            resolve(server);

          }
        );


      server.on(
        'error',
        (error) => {

          console.error(
            '❌ HTTP SERVER ERROR:',
            error
          );

          reject(error);

        }
      );

    }
  );

}


/*
=========================================================
INITIALIZE DATABASE
=========================================================

This runs AFTER Express has started.

MongoDB connection errors are logged without killing the
HTTP server.

The server can therefore continue responding to health
checks and other non-database requests.
=========================================================
*/

async function initializeDatabase() {

  try {

    console.log(
      'Environment configuration loaded.'
    );


    console.log(
      '🔌 Starting MongoDB initialization...'
    );


    await initDb();


    databaseReady = true;


    console.log(
      '✅ Database is ready.'
    );


    console.log(
      '🚀 Astha backend is fully ready.'
    );

  } catch (error) {

    databaseReady = false;


    console.error(
      '❌ MongoDB initialization failed:',
      error
    );


    console.error(
      '⚠️ HTTP server will remain online.'
    );


    console.error(
      '⚠️ Database-dependent API routes will return 503.'
    );

  }

}


/*
=========================================================
START APPLICATION
=========================================================

1. Start Express immediately.
2. Start MongoDB initialization in the background.
=========================================================
*/

async function startServer() {

  try {

    await startHttpServer();


    /*
    -----------------------------------------------------
    IMPORTANT

    Do NOT await database initialization here.

    The HTTP server must remain independent from the
    MongoDB startup process.
    -----------------------------------------------------
    */

    initializeDatabase();

  } catch (error) {

    console.error(
      '❌ SERVER STARTUP ERROR:',
      error
    );

    process.exit(1);

  }

}


/*
=========================================================
START APPLICATION
=========================================================
*/

startServer();