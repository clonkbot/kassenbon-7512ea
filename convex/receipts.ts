import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeName: v.optional(v.string()),
    totalAmount: v.number(),
    purchaseDate: v.number(),
    products: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const receiptId = await ctx.db.insert("receipts", {
      userId,
      storeName: args.storeName,
      totalAmount: args.totalAmount,
      purchaseDate: args.purchaseDate,
      createdAt: Date.now(),
    });

    // Insert all products
    for (const product of args.products) {
      await ctx.db.insert("products", {
        userId,
        receiptId,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        purchaseDate: args.purchaseDate,
        createdAt: Date.now(),
      });

      // Track price history
      await ctx.db.insert("priceHistory", {
        userId,
        productName: product.name,
        price: product.price,
        recordedAt: args.purchaseDate,
      });
    }

    return receiptId;
  },
});

export const remove = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const receipt = await ctx.db.get(args.id);
    if (!receipt || receipt.userId !== userId) throw new Error("Not found");

    // Delete associated products
    const products = await ctx.db
      .query("products")
      .withIndex("by_receipt", (q) => q.eq("receiptId", args.id))
      .collect();

    for (const product of products) {
      await ctx.db.delete(product._id);
    }

    await ctx.db.delete(args.id);
  },
});
