import { MongoMemoryServer } from "mongodb-memory-server";

declare global {
  var __MONGO_SERVER__: MongoMemoryServer | undefined;
}

export default async function globalSetup(): Promise<void> {
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  global.__MONGO_SERVER__ = mongoServer;
}
