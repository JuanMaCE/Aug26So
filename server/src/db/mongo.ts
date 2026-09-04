import "dotenv/config";
import { MongoClient } from "mongodb";
import type { Collection, Document } from "mongodb";

let client: MongoClient | null = null;
let usersCollection: Collection<Document> | null = null;

export async function getUsersCollection(): Promise<Collection<Document>> {
  if (usersCollection) {
    return usersCollection;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "aug26so";

  if (!uri) {
    throw new Error("MONGODB_URI no está configurada en .env");
  }

  client = new MongoClient(uri);
  await client.connect();
  usersCollection = client.db(dbName).collection("users");

  console.log(`[Mongo] Conectado a la base "${dbName}"`);
  return usersCollection;
}