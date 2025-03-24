import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME;
const collectionName = process.env.MONGODB_COLLECTION;
const allowedOrigins = ['http://127.0.0.1:5500', 'https://mirasov.dev', 'https://milleniumstyle.ru', 'https://ruslanmirasov.github.io'];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const phones = await collection
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .toArray();

    res.status(200).json({ phones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  } finally {
    await client.close();
  }
}
