import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME;
const collectionName = process.env.MONGODB_COLLECTION;
const allowedOrigins = ['http://127.0.0.1:5500', 'https://mirasov.dev', 'https://milleniumstyle.ru'];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Телефон не передан' });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const existing = await collection.findOne({ phone });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Извините, вы уже оставляли контактный номер для участия в этом предложении ...',
      });
    }

    await collection.insertOne({ phone, created_at: new Date().toLocaleDateString('ru-RU') });

    res.status(200).json({ success: true, message: 'Cпасибо, данные успешно сохранены!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  } finally {
    await client.close();
  }
}
