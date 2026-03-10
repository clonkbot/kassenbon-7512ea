import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Receipts uploaded by users
  receipts: defineTable({
    userId: v.id("users"),
    imageUrl: v.optional(v.string()),
    storeName: v.optional(v.string()),
    totalAmount: v.number(),
    purchaseDate: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "purchaseDate"]),

  // Individual products from receipts
  products: defineTable({
    userId: v.id("users"),
    receiptId: v.id("receipts"),
    name: v.string(),
    category: v.string(),
    price: v.number(),
    quantity: v.number(),
    purchaseDate: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_receipt", ["receiptId"])
    .index("by_user_and_category", ["userId", "category"])
    .index("by_user_and_date", ["userId", "purchaseDate"]),

  // Price history for tracking price changes
  priceHistory: defineTable({
    userId: v.id("users"),
    productName: v.string(),
    price: v.number(),
    recordedAt: v.number(),
  }).index("by_user_and_product", ["userId", "productName"]),
});
