import mongoose, { type HydratedDocument, Schema, Types } from "mongoose";

export interface Category {
  userId: Types.ObjectId;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<Category>;

const categorySchema = new Schema<Category>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true },
    icon: { type: String, trim: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1, sortOrder: 1 });

export const CategoryModel = mongoose.model<Category>("Category", categorySchema);
