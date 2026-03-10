import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function PriceAlerts() {
  const alerts = useQuery(api.products.getPriceAlerts);

  if (alerts === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-zinc-800/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-zinc-800 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <p className="text-zinc-400 text-sm">Keine Preisänderungen</p>
        <p className="text-zinc-600 text-xs mt-1">
          Wir benachrichtigen dich bei Preissteigerungen
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
      {alerts.map((alert: { productName: string; oldPrice: number; newPrice: number; changePercent: number }, index: number) => (
        <div
          key={`${alert.productName}-${index}`}
          className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 hover:border-amber-500/30 transition-colors"
          style={{
            animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {alert.productName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500">
                  {formatCurrency(alert.oldPrice)}
                </span>
                <svg
                  className="w-3 h-3 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <span className="text-xs text-amber-400 font-medium">
                  {formatCurrency(alert.newPrice)}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                +{alert.changePercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
}
