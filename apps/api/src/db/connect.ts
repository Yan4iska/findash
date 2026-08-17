import mongoose from "mongoose";
import { getMongoUri } from "../config/env.js";

export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(getMongoUri());
}

export async function disconnectDb(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
