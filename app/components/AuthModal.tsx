import { useState, useEffect } from "react";
import { X, Mail, Lock, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "signup" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as any;

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (mode === "signup") {
        setSuccessMessage(data.message);
        if (data.verificationLink) {
          setVerificationLink(data.verificationLink);
        }
      } else {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-medium text-stone-800 mb-2">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-stone-500">
              {mode === "login"
                ? "Sign in to access your premium features"
                : "Sign up to start your journey"}
            </p>
          </div>

          {successMessage ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center mb-6">
              <p className="text-sm">{successMessage}</p>
              {verificationLink && (
                <div className="mt-4">
                  <p className="text-xs text-stone-500 mb-2">For demo purposes:</p>
                  <a
                    href={verificationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Click to Verify
                  </a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-600 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-800 text-white rounded-xl font-medium shadow-lg hover:bg-stone-900 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {mode === "login" ? "Sign In" : "Sign Up"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-500">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-amber-600 font-medium hover:underline"
              >
                {mode === "login" ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
