import mongoose, { type HydratedDocument, Schema, Types } from "mongoose";

export interface Session {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedBySessionId?: Types.ObjectId;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
}

export type SessionDocument = HydratedDocument<Session>;

const sessionSchema = new Schema<Session>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedBySessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    userAgent: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

sessionSchema.index({ userId: 1, expiresAt: 1 });

export const SessionModel = mongoose.model<Session>("Session", sessionSchema);
