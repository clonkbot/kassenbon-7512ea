import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Product {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const CATEGORIES = [
  "Lebensmittel",
  "Getränke",
  "Haushalt",
  "Hygiene",
  "Snacks",
  "Tiefkühl",
  "Fleisch",
  "Milchprodukte",
  "Obst",
  "Gemüse",
  "Brot",
  "Sonstiges",
];

export function AddReceiptModal({ onClose }: { onClose: () => void }) {
  const createReceipt = useMutation(api.receipts.create);
  const [storeName, setStoreName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [products, setProducts] = useState<Product[]>([
    { name: "", category: "Lebensmittel", price: 0, quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProduct = () => {
    setProducts([
      ...products,
      { name: "", category: "Lebensmittel", price: 0, quantity: 1 },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (products.some((p) => !p.name.trim())) return;

    setIsSubmitting(true);
    try {
      await createReceipt({
        storeName: storeName || undefined,
        totalAmount,
        purchaseDate: new Date(purchaseDate).getTime(),
        products: products.map((p) => ({
          ...p,
          name: p.name.trim(),
        })),
      });
      onClose();
    } catch (error) {
      console.error("Failed to create receipt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Beleg hinzufügen
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Store & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Geschäft (optional)
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="z.B. REWE, Edeka..."
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Einkaufsdatum
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-400">
                  Produkte
                </label>
                <button
                  type="button"
                  onClick={addProduct}
                  className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  + Produkt hinzufügen
                </button>
              </div>

              <div className="space-y-3">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800/30 rounded-xl p-3 md:p-4 border border-zinc-700/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            updateProduct(index, "name", e.target.value)
                          }
                          placeholder="Produktname"
                          className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <select
                          value={product.category}
                          onChange={(e) =>
                            updateProduct(index, "category", e.target.value)
                          }
                          className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.price || ""}
                          onChange={(e) =>
                            updateProduct(index, "price", parseFloat(e.target.value) || 0)
                          }
                          placeholder="Preis €"
                          className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) =>
                            updateProduct(index, "quantity", parseInt(e.target.value) || 1)
                          }
                          placeholder="Menge"
                          className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="sm:col-span-1 flex items-center justify-end">
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-red-500/20 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors"
                          >
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
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-zinc-800 bg-zinc-900/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-zinc-500">Gesamtsumme</p>
                <p className="text-xl md:text-2xl font-bold text-white">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || products.some((p) => !p.name.trim())}
                  className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Speichern..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
