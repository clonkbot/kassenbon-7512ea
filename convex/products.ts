import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getByReceipt = query({
  args: { receiptId: v.id("receipts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("products")
      .withIndex("by_receipt", (q) => q.eq("receiptId", args.receiptId))
      .collect();
  },
});

export const getWeeklySpendingByCategory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { currentWeek: {}, previousWeek: {}, changes: {} };

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const allProducts = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const currentWeekProducts = allProducts.filter(
      (p) => p.purchaseDate >= oneWeekAgo && p.purchaseDate <= now
    );
    const previousWeekProducts = allProducts.filter(
      (p) => p.purchaseDate >= twoWeeksAgo && p.purchaseDate < oneWeekAgo
    );

    const sumByCategory = (products: typeof allProducts) => {
      const result: Record<string, number> = {};
      for (const p of products) {
        result[p.category] = (result[p.category] || 0) + p.price * p.quantity;
      }
      return result;
    };

    const currentWeek = sumByCategory(currentWeekProducts);
    const previousWeek = sumByCategory(previousWeekProducts);

    // Calculate changes
    const allCategories = new Set([
      ...Object.keys(currentWeek),
      ...Object.keys(previousWeek),
    ]);

    const changes: Record<string, { amount: number; percentage: number }> = {};
    for (const category of allCategories) {
      const current = currentWeek[category] || 0;
      const previous = previousWeek[category] || 0;
      const diff = current - previous;
      const percentage = previous > 0 ? ((diff / previous) * 100) : (current > 0 ? 100 : 0);
      changes[category] = { amount: diff, percentage };
    }

    return { currentWeek, previousWeek, changes };
  },
});

export const getTotalSpendingTrend = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const receipts = await ctx.db
      .query("receipts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);

    // Group by week
    const weeklyTotals: Record<string, number> = {};
    for (const receipt of receipts) {
      const weekStart = getWeekStart(receipt.purchaseDate);
      const weekKey = new Date(weekStart).toISOString().split("T")[0];
      weeklyTotals[weekKey] = (weeklyTotals[weekKey] || 0) + receipt.totalAmount;
    }

    return Object.entries(weeklyTotals)
      .map(([week, total]) => ({ week, total }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);
  },
});

function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export const getPriceAlerts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const priceHistory = await ctx.db
      .query("priceHistory")
      .withIndex("by_user_and_product", (q) => q.eq("userId", userId))
      .collect();

    // Group by product name
    const productPrices: Record<string, { price: number; recordedAt: number }[]> = {};
    for (const entry of priceHistory) {
      if (!productPrices[entry.productName]) {
        productPrices[entry.productName] = [];
      }
      productPrices[entry.productName].push({
        price: entry.price,
        recordedAt: entry.recordedAt,
      });
    }

    // Find products with price increases
    const alerts: { productName: string; oldPrice: number; newPrice: number; changePercent: number }[] = [];
    for (const [productName, prices] of Object.entries(productPrices)) {
      if (prices.length < 2) continue;

      const sorted = prices.sort((a, b) => a.recordedAt - b.recordedAt);
      const oldPrice = sorted[sorted.length - 2].price;
      const newPrice = sorted[sorted.length - 1].price;

      if (newPrice > oldPrice) {
        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
        if (changePercent >= 5) {
          alerts.push({ productName, oldPrice, newPrice, changePercent });
        }
      }
    }

    return alerts.sort((a, b) => b.changePercent - a.changePercent).slice(0, 10);
  },
});
