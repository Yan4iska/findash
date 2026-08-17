import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./db/connect.js";
import { env } from "./config/env.js";

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
