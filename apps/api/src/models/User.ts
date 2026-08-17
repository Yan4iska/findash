import mongoose, { type HydratedDocument, Schema } from "mongoose";

export interface User {
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<User>("User", userSchema);
