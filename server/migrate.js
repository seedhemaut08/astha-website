import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, 'data', 'db.json');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing in .env');
}

const raw = fs.readFileSync(file, 'utf8');
const data = JSON.parse(raw);

const client = new MongoClient(uri);

async function migrate() {
  try {
    await client.connect();

    const db = client.db('astha');

    console.log('✅ Connected to MongoDB');

    const users = db.collection('users');
    const products = db.collection('products');
    const orders = db.collection('orders');

    /* ========================================================
       USERS
       ======================================================== */

    for (const user of data.users || []) {
      await users.updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
      );
    }

    console.log(
      `✅ Users migrated: ${(data.users || []).length}`
    );


    /* ========================================================
       PRODUCTS
       ======================================================== */

    for (const product of data.products || []) {
      await products.updateOne(
        { id: product.id },
        { $set: product },
        { upsert: true }
      );
    }

    console.log(
      `✅ Products migrated: ${(data.products || []).length}`
    );


    /* ========================================================
       ORDERS
       ======================================================== */

    for (const order of data.orders || []) {
      await orders.updateOne(
        { id: order.id },
        { $set: order },
        { upsert: true }
      );
    }

    console.log(
      `✅ Orders migrated: ${(data.orders || []).length}`
    );


    /* ========================================================
       FINAL COUNTS
       ======================================================== */

    const userCount = await users.countDocuments();
    const productCount = await products.countDocuments();
    const orderCount = await orders.countDocuments();

    console.log('');
    console.log('================================');
    console.log('🎉 MIGRATION COMPLETE');
    console.log('================================');
    console.log(`Users:    ${userCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Orders:   ${orderCount}`);
    console.log('================================');

  } catch (error) {
    console.error('❌ MIGRATION FAILED');
    console.error(error);
    process.exitCode = 1;

  } finally {
    await client.close();
  }
}

migrate();