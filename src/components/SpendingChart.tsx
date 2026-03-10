interface SpendingData {
  currentWeek: Record<string, number>;
  previousWeek: Record<string, number>;
  changes: Record<string, { amount: number; percentage: number }>;
}

export function SpendingChart({ data }: { data: SpendingData }) {
  const categories = Object.keys(data.changes).sort(
    (a, b) => (data.currentWeek[b] || 0) - (data.currentWeek[a] || 0)
  ).slice(0, 6);

  const maxValue = Math.max(
    ...categories.flatMap((cat) => [
      data.currentWeek[cat] || 0,
      data.previousWeek[cat] || 0,
    ]),
    1
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (categories.length === 0) {
    return (
      <div className="h-64 md:h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">Noch keine Daten zum Vergleichen</p>
          <p className="text-zinc-600 text-xs mt-1">Füge Belege hinzu, um Trends zu sehen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-4 md:gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">Diese Woche</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <span className="text-zinc-400">Letzte Woche</span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-3 md:space-y-4">
        {categories.map((category, index) => {
          const current = data.currentWeek[category] || 0;
          const previous = data.previousWeek[category] || 0;
          const change = data.changes[category];
          const isIncrease = change.amount > 0;

          return (
            <div
              key={category}
              className="group"
              style={{
                animation: `slideIn 0.4s ease-out ${index * 0.05}s both`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-300 truncate pr-2">
                  {category}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(current)}
                  </span>
                  {change.amount !== 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        isIncrease
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {isIncrease ? "+" : ""}
                      {change.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-6 md:h-8 bg-zinc-800/50 rounded-lg overflow-hidden">
                {/* Previous week bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-zinc-700/50 rounded-lg transition-all duration-500"
                  style={{
                    width: `${(previous / maxValue) * 100}%`,
                  }}
                />
                {/* Current week bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                    isIncrease
                      ? "bg-gradient-to-r from-amber-500 to-red-500"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  }`}
                  style={{
                    width: `${(current / maxValue) * 100}%`,
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
