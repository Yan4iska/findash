import mongoose, { type HydratedDocument, Schema, Types } from 'mongoose';
import type { TransactionType } from '@findash/shared';

export interface RecurringTransaction {
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amount: number;
  type: TransactionType;
  description?: string;
  frequency: 'weekly' | 'monthly';
  nextDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type RecurringTransactionDocument = HydratedDocument<RecurringTransaction>;
const schema = new Schema<RecurringTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    description: { type: String, trim: true },
    frequency: { type: String, enum: ['weekly', 'monthly'], required: true },
    nextDate: { type: Date, required: true },
  },
  { timestamps: true },
);
schema.index({ userId: 1, nextDate: 1 });
export const RecurringTransactionModel = mongoose.model<RecurringTransaction>(
  'RecurringTransaction',
  schema,
);
