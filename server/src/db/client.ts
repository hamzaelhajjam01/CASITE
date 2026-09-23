import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI || 'mongodb+srv://hamzaelhajjam01_db_user:twCY9tuh2R3YBwsX@cluster0.jan15th.mongodb.net/?appName=Cluster0';
  const dbName = process.env.MONGODB_DB || 'polarguard';

  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  client = new MongoClient(uri);
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
