export default async function globalTeardown(): Promise<void> {
  await global.__MONGO_SERVER__?.stop();
}
