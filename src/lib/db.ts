import { MongoClient, type Db } from "mongodb";

function getDatabaseUrl(): string {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is not set");
  }
  return uri;
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
  mongoDb?: Db;
  mongoIndexesReady?: Promise<void>;
};

async function getClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClient) {
    return globalForMongo.mongoClient;
  }

  const client = new MongoClient(getDatabaseUrl());
  await client.connect();
  globalForMongo.mongoClient = client;
  return client;
}

export async function getDb(): Promise<Db> {
  if (globalForMongo.mongoDb) {
    return globalForMongo.mongoDb;
  }

  const client = await getClient();
  globalForMongo.mongoDb = client.db();
  return globalForMongo.mongoDb;
}

export async function ensureIndexes(): Promise<void> {
  if (!globalForMongo.mongoIndexesReady) {
    globalForMongo.mongoIndexesReady = (async () => {
      const db = await getDb();
      await db.collection("users").createIndex({ email: 1 }, { unique: true });
    })();
  }

  await globalForMongo.mongoIndexesReady;
}
