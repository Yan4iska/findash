import { z } from "zod";

export const isoDateSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: "Invalid ISO date string" },
);
