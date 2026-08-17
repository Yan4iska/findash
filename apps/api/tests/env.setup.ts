process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/findash-test";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? "test-access-secret-min-16-chars";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-min-16-chars";
process.env.CORS_ORIGIN = "http://localhost:5173";
