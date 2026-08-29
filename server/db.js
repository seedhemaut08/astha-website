/*
=========================================================
ASTHA SILVER DATABASE
=========================================================

MongoDB database connection and compatibility layer.

IMPORTANT:

The application must NOT load the entire database into
memory during startup.

Only the collections that are actually required are
loaded when necessary.

This keeps server startup fast and prevents large
users/orders collections from blocking the application.

The existing compatibility API is preserved:

    db.read()
    db.write()
    db.data.users
    db.data.products
    db.data.orders

MongoDB remains the source of truth.
=========================================================
*/


/*
=========================================================
LOAD ENVIRONMENT VARIABLES
=========================================================
*/

import 'dotenv/config';


/*
=========================================================
DNS
=========================================================
*/

import dns from 'node:dns';


/*
=========================================================
MONGODB
=========================================================
*/

import {
  MongoClient,
} from 'mongodb';


/*
=========================================================
ID GENERATOR
=========================================================
*/

import {
  nanoid,
} from 'nanoid';


/*
=========================================================
DNS CONFIGURATION
=========================================================

MongoDB Atlas uses an SRV connection string:

mongodb+srv://...

The application previously encountered DNS problems
with Node.js SRV resolution.

We therefore explicitly configure public DNS servers.
=========================================================
*/

try {

  dns.setServers([
    '8.8.8.8',
    '1.1.1.1',
  ]);


  console.log(
    '🌐 Node DNS servers configured:',
    '8.8.8.8, 1.1.1.1'
  );

} catch (error) {

  console.error(
    '⚠️ Unable to configure DNS servers:',
    error.message
  );

}


/*
=========================================================
MONGODB URI
=========================================================
*/

const uri =
  process.env.MONGODB_URI;


if (!uri) {

  throw new Error(
    '❌ MONGODB_URI is missing in .env'
  );

}


/*
=========================================================
MONGODB CLIENT
=========================================================

Short connection timeouts prevent a dead/unreachable
MongoDB server from keeping requests waiting for a very
long time.

The HTTP server is started separately by index.js.
=========================================================
*/

const client =
  new MongoClient(
    uri,
    {
      serverSelectionTimeoutMS:
        5000,

      connectTimeoutMS:
        5000,

      socketTimeoutMS:
        10000,

      maxPoolSize:
        10,

      minPoolSize:
        0,

      retryWrites:
        true,

      retryReads:
        true,
    }
  );


/*
=========================================================
DATABASE REFERENCE
=========================================================
*/

let database = null;


/*
=========================================================
DEFAULT DATA
=========================================================
*/

const defaultData = {

  users: [],

  products: [],

  orders: [],

};


/*
=========================================================
SEED PRODUCTS
=========================================================
*/

const seedProducts = [

  {
    category: 'Ganesh Ji',

    items: [

      {
        name:
          'Lord Ganesha',

        price:
          4499,

        weight:
          '450g',

        height:
          '6 inch',

        desc:
          'Hand-finished silver Ganesh idol seated on a lotus base, flanked by Riddhi and Siddhi, crafted for the home mandir.',
      },


      {
        name:
          'Bal Ganesh Silver Idol',

        price:
          2999,

        weight:
          '280g',

        height:
          '4.5 inch',

        desc:
          'A playful Bal Ganesh murti with fine trunk detailing, ideal as a housewarming or wedding gift.',
      },


      {
        name:
          'Panchmukhi Ganesh Statue',

        price:
          7999,

        weight:
          '620g',

        height:
          '7 inch',

        desc:
          'Rare five-faced Ganesh idol representing the five elements, finished with intricate mukut work.',
      },

    ],
  },


  {
    category:
      'Lakshmi Ji',

    items: [

      {
        name:
          'Kamal Aasan Lakshmi Murti',

        price:
          5499,

        weight:
          '480g',

        height:
          '6.5 inch',

        desc:
          'Goddess Lakshmi seated on a full-bloom lotus, coins cascading from her palm, for prosperity and abundance.',
      },


      {
        name:
          'Lakshmi Ganesh Jodi',

        price:
          8999,

        weight:
          '750g',

        height:
          '6 inch pair',

        desc:
          'The classic Diwali pairing — Lakshmi and Ganesh together on a single ornate silver platform.',
      },


      {
        name:
          'Gaja Lakshmi Idol',

        price:
          6999,

        weight:
          '540g',

        height:
          '6 inch',

        desc:
          'Lakshmi flanked by two elephants performing abhishek, a symbol of royal fortune.',
      },

    ],
  },


  {
    category:
      'Hanuman Ji',

    items: [

      {
        name:
          'Veer Hanuman Murti',

        price:
          5999,

        weight:
          '560g',

        height:
          '7 inch',

        desc:
          'A powerful standing Hanuman idol with gada in hand, detailed armour and flowing angavastram.',
      },


      {
        name:
          'Sankat Mochan Hanuman',

        price:
          4299,

        weight:
          '400g',

        height:
          '5.5 inch',

        desc:
          'Hanuman ji in blessing posture, believed to remove obstacles and protect the household.',
      },


      {
        name:
          'Panchmukhi Hanuman Idol',

        price:
          8499,

        weight:
          '700g',

        height:
          '7.5 inch',

        desc:
          'Five-faced Hanuman murti, an intricate and rare piece for dedicated devotees.',
      },

    ],
  },


  {
    category:
      'Shiv Ji',

    items: [

      {
        name:
          'Shiv Parivar Murti',

        price:
          9999,

        weight:
          '900g',

        height:
          '6 inch group',

        desc:
          'The complete Shiv family — Shiva, Parvati, Ganesh and Kartikeya — on one ornate base.',
      },


      {
        name:
          'Dhyan Mudra Shiv Idol',

        price:
          5299,

        weight:
          '460g',

        height:
          '6 inch',

        desc:
          'Lord Shiva in deep meditation, matted hair and trishul finely etched by hand.',
      },


      {
        name:
          'Nataraja Silver Statue',

        price:
          11499,

        weight:
          '1.1kg',

        height:
          '9 inch',

        desc:
          'Shiva as Nataraja within a silver prabhavali ring, our most detailed showpiece.',
      },

    ],
  },


  {
    category:
      'Krishna Ji',

    items: [

      {
        name:
          'Bansuri Krishna Murti',

        price:
          4799,

        weight:
          '420g',

        height:
          '6 inch',

        desc:
          'Krishna playing the flute in classic tribhanga pose, peacock feather crown detailing.',
      },


      {
        name:
          'Radha Krishna Jodi',

        price:
          9499,

        weight:
          '820g',

        height:
          '7 inch pair',

        desc:
          'Radha and Krishna together beneath a silver kadamba arch, a treasured wedding gift.',
      },

    ],
  },

];


/*
=========================================================
DB COMPATIBILITY OBJECT
=========================================================

Existing routes can continue using:

    db.read()
    db.write()
    db.data.users
    db.data.products
    db.data.orders

MongoDB remains the source of truth.
=========================================================
*/

export const db = {

  data: {

    users: [],

    products: [],

    orders: [],

  },


  /*
  ========================================================
  READ DATA FROM MONGODB
  ========================================================

  This method is retained for compatibility with older
  routes.

  It is NOT called automatically during database startup.

  This prevents startup from loading every collection.
  ========================================================
  */

  async read() {

    if (!database) {

      throw new Error(
        'MongoDB is not connected.'
      );

    }


    /*
    ======================================================
    READ COLLECTIONS IN PARALLEL
    ======================================================
    */

    const [
      users,
      products,
      orders,
    ] = await Promise.all([

      database
        .collection('users')
        .find({})
        .toArray(),

      database
        .collection('products')
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray(),

      database
        .collection('orders')
        .find({})
        .toArray(),

    ]);


    /*
    ======================================================
    UPDATE COMPATIBILITY CACHE
    ======================================================
    */

    this.data = {

      users,

      products,

      orders,

    };


    return this.data;

  },


  /*
  ========================================================
  WRITE DATA TO MONGODB
  ========================================================

  Retained for compatibility with existing routes.

  NOTE:

  This method intentionally keeps the previous behavior
  because changing its semantics could break existing
  authentication/order logic.
  ========================================================
  */

  async write() {

    if (!database) {

      throw new Error(
        'MongoDB is not connected.'
      );

    }


    /*
    ======================================================
    COLLECTION REFERENCES
    ======================================================
    */

    const usersCollection =
      database.collection(
        'users'
      );


    const productsCollection =
      database.collection(
        'products'
      );


    const ordersCollection =
      database.collection(
        'orders'
      );


    /*
    ======================================================
    USERS
    ======================================================
    */

    await usersCollection
      .deleteMany({});


    if (
      this.data.users.length > 0
    ) {

      await usersCollection
        .insertMany(
          this.data.users
        );

    }


    /*
    ======================================================
    PRODUCTS
    ======================================================
    */

    await productsCollection
      .deleteMany({});


    if (
      this.data.products.length > 0
    ) {

      await productsCollection
        .insertMany(
          this.data.products
        );

    }


    /*
    ======================================================
    ORDERS
    ======================================================
    */

    await ordersCollection
      .deleteMany({});


    if (
      this.data.orders.length > 0
    ) {

      await ordersCollection
        .insertMany(
          this.data.orders
        );

    }


    return true;

  },

};


/*
=========================================================
GET COLLECTION
=========================================================

Used by routes such as:

auth.js
products.js
orders.js

This returns the native MongoDB collection directly.
=========================================================
*/

export function getCollection(
  name
) {

  if (!database) {

    throw new Error(
      'MongoDB is not connected.'
    );

  }


  return database.collection(
    name
  );

}


/*
=========================================================
INITIALIZE MONGODB
=========================================================

IMPORTANT:

This function connects to MongoDB and prepares the
database.

It does NOT call db.read().

That means startup no longer downloads the entire users,
products and orders collections.

Only a lightweight product count is performed to determine
whether seed data is required.
=========================================================
*/

export async function initDb() {

  try {

    /*
    ======================================================
    START CONNECTION
    ======================================================
    */

    console.log(
      '🔌 Connecting to MongoDB Atlas...'
    );


    console.log(
      '🌐 Using configured DNS:',
      '8.8.8.8 / 1.1.1.1'
    );


    /*
    ======================================================
    CONNECT
    ======================================================
    */

    await client.connect();


    /*
    ======================================================
    SELECT DATABASE
    ======================================================
    */

    database =
      client.db(
        'astha'
      );


    console.log(
      '✅ MongoDB connected successfully'
    );


    console.log(
      '📦 Database: astha'
    );


    /*
    ======================================================
    CHECK PRODUCT COUNT ONLY
    ======================================================

    We do NOT load every product into memory.

    countDocuments is much lighter than:

        find({}).toArray()
    ======================================================
    */

    const productCount =
      await database
        .collection('products')
        .countDocuments(
          {},
          {
            maxTimeMS:
              5000,
          }
        );


    /*
    ======================================================
    SEED PRODUCTS IF EMPTY
    ======================================================
    */

    if (
      productCount === 0
    ) {

      const products = [];


      /*
      ----------------------------------------------------
      BUILD SEED PRODUCTS
      ----------------------------------------------------
      */

      for (
        const group
        of seedProducts
      ) {

        for (
          const item
          of group.items
        ) {

          products.push({

            id:
              nanoid(10),

            category:
              group.category,

            name:
              item.name,

            price:
              item.price,

            weight:
              item.weight,

            height:
              item.height,

            description:
              item.desc,

            inStock:
              true,

            createdAt:
              new Date()
                .toISOString(),

          });

        }

      }


      /*
      ----------------------------------------------------
      INSERT SEED DATA
      ----------------------------------------------------
      */

      if (
        products.length > 0
      ) {

        await database
          .collection(
            'products'
          )
          .insertMany(
            products
          );


        /*
        --------------------------------------------------
        UPDATE COMPATIBILITY CACHE
        --------------------------------------------------
        */

        db.data.products =
          products;


        console.log(
          `✅ ${products.length} products seeded into MongoDB`
        );

      }

    } else {

      console.log(
        `📦 Existing products found: ${productCount}`
      );

    }


    /*
    ======================================================
    DATABASE INITIALIZATION COMPLETE
    ======================================================
    */

    console.log(
      '🚀 MongoDB initialization complete'
    );


    return true;

  } catch (error) {

    /*
    ======================================================
    RESET DATABASE REFERENCE
    ======================================================
    */

    database =
      null;


    /*
    ======================================================
    ERROR LOGGING
    ======================================================
    */

    console.error(
      '❌ MongoDB connection failed:'
    );


    console.error(
      error.message
    );


    /*
    ======================================================
    SRV / DNS ERROR
    ======================================================
    */

    if (
      error?.code ===
      'ECONNREFUSED'
    ) {

      console.error(
        '⚠️ MongoDB SRV DNS lookup was refused.'
      );


      console.error(
        '⚠️ Node DNS has been configured to use 8.8.8.8 and 1.1.1.1.'
      );

    }


    /*
    ======================================================
    PROPAGATE ERROR
    ======================================================

    index.js handles this error.

    Because index.js starts HTTP first, this failure does
    NOT prevent Express from remaining online.
    ======================================================
    */

    throw error;

  }

}


/*
=========================================================
DATABASE SHUTDOWN
=========================================================

Allows the application to close MongoDB cleanly when
Node receives a shutdown signal.
=========================================================
*/

export async function closeDb() {

  try {

    await client.close();


    database =
      null;


    console.log(
      '🛑 MongoDB connection closed.'
    );

  } catch (error) {

    console.error(
      '❌ Error while closing MongoDB:',
      error.message
    );

  }

}


/*
=========================================================
END OF DATABASE MODULE
=========================================================
*/