import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'polarguard';

  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  client = new MongoClient(uri, { tls: true, tlsAllowInvalidCertificates: false });
  await client.connect();
  db = client.db(dbName);

  console.log(`✓ Connected to MongoDB Atlas — database: "${dbName}"`);
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) await client.close();
}
