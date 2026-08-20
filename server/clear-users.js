import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is missing in .env');
}

const client = new MongoClient(uri);

async function clearUsers() {
  try {
    await client.connect();

    const db = client.db('astha');
    const users = db.collection('users');

    const result = await users.deleteMany({});

    console.log(`🗑️ Removed ${result.deletedCount} users`);
    console.log('✅ Users collection is now empty');

  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await client.close();
  }
}

clearUsers();