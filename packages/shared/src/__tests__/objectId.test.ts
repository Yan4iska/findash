import { describe, expect, it } from "@jest/globals";
import { objectIdSchema } from "../common/objectId.js";

const VALID_OBJECT_ID = "507f1f77bcf86cd799439011";

describe("objectIdSchema", () => {
  it("accepts a valid 24-character hex string", () => {
    expect(objectIdSchema.parse(VALID_OBJECT_ID)).toBe(VALID_OBJECT_ID);
  });

  it("rejects invalid ObjectId values", () => {
    expect(() => objectIdSchema.parse("not-an-object-id")).toThrow();
    expect(() => objectIdSchema.parse("507f1f77bcf86cd79943901")).toThrow();
    expect(() => objectIdSchema.parse("507f1f77bcf86cd799439011g")).toThrow();
  });
});
