/*
=========================================================
ASTHA SILVER API SERVER
=========================================================

Main Express server entry point.

IMPORTANT:
dotenv/config is loaded before importing route modules.

This is required because some route modules, especially
the authentication route, create services such as the
Nodemailer transporter during module initialization.

If environment variables are loaded after those modules
are imported, SMTP credentials may be unavailable when
the transporter is created.
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

import { initDb } from './db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';


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
  express.json()
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
*/

app.get(
  '/api/health',
  (req, res) => {

    res.json({
      status: 'ok',
      brand: 'Astha'
    });

  }
);


/*
=========================================================
AUTH ROUTES
=========================================================
*/

app.use(
  '/api/auth',
  authRoutes
);


/*
=========================================================
PRODUCT ROUTES
=========================================================
*/

app.use(
  '/api/products',
  productRoutes
);


/*
=========================================================
ORDER ROUTES
=========================================================
*/

app.use(
  '/api/orders',
  orderRoutes
);


/*
=========================================================
404 HANDLER
=========================================================
*/

app.use(
  (req, res) => {

    res.status(404).json({
      error: 'Route not found.'
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

    res.status(500).json({
      error:
        'Something went wrong on our end.'
    });

  }
);


/*
=========================================================
DATABASE + SERVER STARTUP
=========================================================
*/

async function startServer() {

  try {

    /*
    -----------------------------------------------------
    CHECK REQUIRED ENVIRONMENT VARIABLES
    -----------------------------------------------------
    */

    console.log(
      'Environment configuration loaded.'
    );


    /*
    -----------------------------------------------------
    INITIALIZE DATABASE
    -----------------------------------------------------
    */

    await initDb();


    /*
    -----------------------------------------------------
    START EXPRESS SERVER
    -----------------------------------------------------
    */

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

      }
    );

  } catch (error) {

    console.error(
      'SERVER STARTUP ERROR:',
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