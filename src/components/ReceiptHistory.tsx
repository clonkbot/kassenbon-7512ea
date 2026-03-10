import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

export function ReceiptHistory() {
  const receipts = useQuery(api.receipts.list);
  const removeReceipt = useMutation(api.receipts.remove);
  const [deletingId, setDeletingId] = useState<Id<"receipts"> | null>(null);

  if (receipts === undefined) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-zinc-800/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-zinc-800 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          Keine Belege vorhanden
        </h3>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          Füge deinen ersten Kassenbon hinzu, um dein Kaufverhalten zu analysieren.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(timestamp));

  const handleDelete = async (id: Id<"receipts">) => {
    setDeletingId(id);
    try {
      await removeReceipt({ id });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl md:rounded-3xl p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">
        Letzte Belege
      </h2>
      <div className="space-y-3">
        {receipts.slice(0, 10).map((receipt: { _id: Id<"receipts">; storeName?: string; purchaseDate: number; totalAmount: number }, index: number) => (
          <div
            key={receipt._id}
            className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 transition-colors group"
            style={{
              animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
            }}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm md:text-base font-medium text-white truncate">
                  {receipt.storeName || "Einkauf"}
                </p>
                <p className="text-xs md:text-sm text-zinc-500">
                  {formatDate(receipt.purchaseDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-base md:text-lg font-semibold text-white">
                {formatCurrency(receipt.totalAmount)}
              </span>
              <button
                onClick={() => handleDelete(receipt._id)}
                disabled={deletingId === receipt._id}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-red-500/20 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                {deletingId === receipt._id ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

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
      `}</style>
    </div>
  );
}
