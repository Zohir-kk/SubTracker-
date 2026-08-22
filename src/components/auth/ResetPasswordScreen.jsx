import { useState } from "react";
import { auth } from "../../lib/firebase";
import { confirmPasswordReset } from "firebase/auth";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../providers/LanguageProvider.jsx";

export function ResetPasswordScreen({ oobCode }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError("");
    
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || t('auth.error.default'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-bg-2 border border-border rounded-2xl shadow-card overflow-hidden p-8 text-center">
          <CheckCircle2 size={48} className="text-gold mx-auto mb-4" />
          <h2 className="font-playfair text-2xl font-bold text-text mb-2">Password Reset</h2>
          <p className="font-sans text-sm text-text-faint mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full h-11 bg-gold hover:bg-gold-dim text-bg font-sans text-sm font-semibold rounded-xl transition-colors"
          >
            {t('auth.action.login') || "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-2 border border-border rounded-2xl shadow-card overflow-hidden">
        
        <div className="p-8 pb-6 text-center">
          <h2 className="font-playfair text-2xl font-bold text-text mb-1">
            Create New Password
          </h2>
          <p className="font-sans text-sm text-text-faint">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {error && (
            <div className="p-3 bg-red/10 border border-red/20 rounded-lg text-red text-xs font-sans text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-sans font-medium text-text-faint ms-1">{t('auth.label.password') || "New Password"}</label>
            <div className="relative">
              <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 ps-10 pe-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-11 mt-4 bg-gold hover:bg-gold-dim text-bg font-sans text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
