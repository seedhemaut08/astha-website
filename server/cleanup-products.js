import 'dotenv/config';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'data', 'db.json');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing in .env');
}

const localData = JSON.parse(
  fs.readFileSync(dbFile, 'utf8')
);

const client = new MongoClient(uri);

async function cleanup() {
  try {
    await client.connect();

    const db = client.db('astha');
    const products = db.collection('products');

    const validIds = (localData.products || []).map(
      product => product.id
    );

    const result = await products.deleteMany({
      id: { $nin: validIds }
    });

    console.log(
      `🗑️ Removed ${result.deletedCount} duplicate/seed products`
    );

    const count = await products.countDocuments();

    console.log(`📦 Products now in MongoDB: ${count}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);

  } finally {
    await client.close();
  }
}

cleanup();