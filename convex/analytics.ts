import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalSpent: 0,
        receiptsCount: 0,
        productsCount: 0,
        avgPerReceipt: 0,
        thisWeekTotal: 0,
        lastWeekTotal: 0,
        weeklyChange: 0,
      };
    }

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalSpent = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const receiptsCount = receipts.length;
    const productsCount = products.length;
    const avgPerReceipt = receiptsCount > 0 ? totalSpent / receiptsCount : 0;

    const thisWeekReceipts = receipts.filter(
      (r) => r.purchaseDate >= oneWeekAgo && r.purchaseDate <= now
    );
    const lastWeekReceipts = receipts.filter(
      (r) => r.purchaseDate >= twoWeeksAgo && r.purchaseDate < oneWeekAgo
    );

    const thisWeekTotal = thisWeekReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
    const lastWeekTotal = lastWeekReceipts.reduce((sum, r) => sum + r.totalAmount, 0);

    const weeklyChange =
      lastWeekTotal > 0
        ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
        : thisWeekTotal > 0
        ? 100
        : 0;

    return {
      totalSpent,
      receiptsCount,
      productsCount,
      avgPerReceipt,
      thisWeekTotal,
      lastWeekTotal,
      weeklyChange,
    };
  },
});

export const getTopCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const categoryTotals: Record<string, number> = {};
    for (const product of products) {
      categoryTotals[product.category] =
        (categoryTotals[product.category] || 0) + product.price * product.quantity;
    }

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  },
});

export const getMonthlySpending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const monthlyTotals: Record<string, number> = {};
    for (const receipt of receipts) {
      const date = new Date(receipt.purchaseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + receipt.totalAmount;
    }

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  },
});
