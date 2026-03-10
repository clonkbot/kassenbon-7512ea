import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SpendingChart } from "./SpendingChart";
import { PriceAlerts } from "./PriceAlerts";
import { AddReceiptModal } from "./AddReceiptModal";
import { useState } from "react";

export function Dashboard() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const weeklySpending = useQuery(api.products.getWeeklySpendingByCategory);
  const [showAddModal, setShowAddModal] = useState(false);

  if (stats === undefined || weeklySpending === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500">Laden...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Diese Woche"
          value={formatCurrency(stats.thisWeekTotal)}
          change={stats.weeklyChange}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Letzte Woche"
          value={formatCurrency(stats.lastWeekTotal)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Belege gesamt"
          value={stats.receiptsCount.toString()}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Ø pro Einkauf"
          value={formatCurrency(stats.avgPerReceipt)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Spending Comparison Chart */}
        <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl md:rounded-3xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Wöchentlicher Vergleich
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Ausgaben nach Kategorie im Vergleich zur Vorwoche
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="sm:hidden md:inline">Beleg hinzufügen</span>
              <span className="hidden sm:inline md:hidden">Hinzufügen</span>
            </button>
          </div>
          <SpendingChart data={weeklySpending} />
        </div>

        {/* Price Alerts */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl md:rounded-3xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4">
            Preisänderungen
          </h2>
          <PriceAlerts />
        </div>
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdown data={weeklySpending} />

      {showAddModal && <AddReceiptModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              change >= 0
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-xl md:text-2xl font-bold text-white">{value}</p>
      <p className="text-xs md:text-sm text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function CategoryBreakdown({
  data,
}: {
  data: {
    currentWeek: Record<string, number>;
    previousWeek: Record<string, number>;
    changes: Record<string, { amount: number; percentage: number }>;
  };
}) {
  const categories = Object.keys(data.changes).sort(
    (a, b) => (data.currentWeek[b] || 0) - (data.currentWeek[a] || 0)
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const categoryIcons: Record<string, string> = {
    Lebensmittel: "🥑",
    Getränke: "🥤",
    Haushalt: "🏠",
    Hygiene: "🧴",
    Snacks: "🍫",
    Tiefkühl: "❄️",
    Fleisch: "🥩",
    Milchprodukte: "🥛",
    Obst: "🍎",
    Gemüse: "🥬",
    Brot: "🍞",
    Sonstiges: "📦",
  };

  if (categories.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Keine Daten vorhanden</h3>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Füge deinen ersten Kassenbon hinzu, um deine Ausgaben nach Kategorien zu analysieren.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl md:rounded-3xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">
        Ausgaben nach Kategorie
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {categories.map((category) => {
          const current = data.currentWeek[category] || 0;
          const change = data.changes[category];
          const isIncrease = change.amount > 0;

          return (
            <div
              key={category}
              className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg md:text-xl">
                  {categoryIcons[category] || "📦"}
                </span>
                <span className="text-sm font-medium text-zinc-300 truncate">
                  {category}
                </span>
              </div>
              <p className="text-lg md:text-xl font-bold text-white">
                {formatCurrency(current)}
              </p>
              {change.amount !== 0 && (
                <p
                  className={`text-xs mt-1 ${
                    isIncrease ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {isIncrease ? "+" : ""}
                  {formatCurrency(change.amount)} ({change.percentage.toFixed(0)}%)
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
