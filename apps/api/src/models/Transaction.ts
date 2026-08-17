import mongoose, { type HydratedDocument, Schema, Types } from "mongoose";
import type { TransactionType } from "@findash/shared";

export interface Transaction {
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionDocument = HydratedDocument<Transaction>;

const transactionSchema = new Schema<Transaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense"], required: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });

export const TransactionModel = mongoose.model<Transaction>(
  "Transaction",
  transactionSchema,
);
