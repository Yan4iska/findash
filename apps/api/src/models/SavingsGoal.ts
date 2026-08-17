import mongoose, { type HydratedDocument, Schema, Types } from 'mongoose';

export interface SavingsGoal {
  userId: Types.ObjectId;
  name: string;
  targetAmount: number;
  targetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
export type SavingsGoalDocument = HydratedDocument<SavingsGoal>;
const schema = new Schema<SavingsGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    targetDate: { type: Date, required: true },
  },
  { timestamps: true },
);
schema.index({ userId: 1, targetDate: 1 });
export const SavingsGoalModel = mongoose.model<SavingsGoal>('SavingsGoal', schema);
