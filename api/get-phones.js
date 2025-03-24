import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME;
const collectionName = process.env.MONGODB_COLLECTION;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const phones = await collection.find({}, { projection: { _id: 0 } }).toArray();

    res.status(200).json({ success: true, phones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  } finally {
    await client.close();
  }
}
