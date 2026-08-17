import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { connectDb, disconnectDb } from "../src/db/connect.js";
import { CategoryModel } from "../src/models/Category.js";
import { DashboardLayoutModel } from "../src/models/DashboardLayout.js";
import { SessionModel } from "../src/models/Session.js";
import { TransactionModel } from "../src/models/Transaction.js";
import { UserModel } from "../src/models/User.js";

beforeAll(async () => {
  await connectDb();
});

afterEach(async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    SessionModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    TransactionModel.deleteMany({}),
    DashboardLayoutModel.deleteMany({}),
  ]);
});

afterAll(async () => {
  await disconnectDb();
});
