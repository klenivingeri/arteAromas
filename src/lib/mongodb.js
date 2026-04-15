import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();
const dbName =
  process.env.MONGODB_DB?.trim() ||
  process.env.MONGODB_DATABASE?.trim() ||
  "decorartearomas";

const globalForMongo = globalThis;

if (!globalForMongo.__decorartearomasMongoClientPromise) {
  globalForMongo.__decorartearomasMongoClientPromise = uri
    ? new MongoClient(uri).connect()
    : null;
}

export function hasMongoConfig() {
  return Boolean(uri);
}

export async function getMongoClient() {
  if (!uri) {
    throw new Error(
      "MONGODB_URI not configured. Set the environment variable to use MongoDB.",
    );
  }

  return globalForMongo.__decorartearomasMongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  return client.db(dbName);
}
