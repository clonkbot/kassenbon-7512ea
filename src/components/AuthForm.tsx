import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(
        flow === "signIn"
          ? "Invalid email or password"
          : "Could not create account. Try a different email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4 py-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-6 h-6 md:w-7 md:h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              Kassenbon
            </h1>
          </div>
          <p className="text-zinc-500 text-sm md:text-base max-w-xs mx-auto">
            Behalte deine Ausgaben im Blick. Erkenne Muster. Spare Geld.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-6">
            {flow === "signIn" ? "Willkommen zurück" : "Konto erstellen"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-400 mb-2"
              >
                E-Mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400 mb-2"
              >
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Laden...
                </span>
              ) : flow === "signIn" ? (
                "Anmelden"
              ) : (
                "Registrieren"
              )}
            </button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900/50 text-zinc-500">oder</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="mt-6 w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl border border-zinc-700 transition-all duration-200 disabled:opacity-50"
          >
            Als Gast fortfahren
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {flow === "signIn" ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {flow === "signIn" ? "Jetzt registrieren" : "Jetzt anmelden"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          Requested by @web-user · Built by @clonkbot
        </p>
      </div>
    </div>
  );
}
