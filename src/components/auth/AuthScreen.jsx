import { useState } from "react";
import { auth } from "../../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useLanguage } from "../../providers/LanguageProvider.jsx";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!isLogin && !isResetting) {
        if (password.length < 8) {
           setError(t('auth.error.password_length') || "Password must be at least 8 characters.");
           setLoading(false);
           return;
        }
      }

      if (isResetting) {
        await sendPasswordResetEmail(auth, email);
        setMessage(t('auth.reset_sent'));
        setIsResetting(false); // Switch back to login view after sending
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
         setError(t('auth.error.invalid'));
      } else if (err.code === "auth/email-already-in-use") {
         setError(t('auth.error.in_use'));
      } else if (err.code === "auth/too-many-requests") {
         setError(t('auth.error.too_many'));
      } else {
         setError(t('auth.error.default'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-2 border border-border rounded-2xl shadow-card overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 28 28">
              <polygon points="14,1 27,14 14,27 1,14" fill="var(--gold)" />
              <text x="14" y="19" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#080c14">
                S
              </text>
            </svg>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-text mb-1">
            {isResetting ? t('auth.title.reset') : isLogin ? t('auth.title.login') : t('auth.title.register')}
          </h2>
          <p className="font-sans text-sm text-text-faint">
            {isResetting 
              ? t('auth.subtitle.reset') 
              : isLogin ? t('auth.subtitle.login') : t('auth.subtitle.register')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {error && (
            <div className="p-3 bg-red/10 border border-red/20 rounded-lg text-red text-xs font-sans text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green/10 border border-green/20 rounded-lg text-green text-xs font-sans text-center">
              {message}
            </div>
          )}

          {!isLogin && !isResetting && (
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-medium text-text-faint ms-1">{t('auth.label.name')}</label>
              <div className="relative">
                <User size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 ps-10 pe-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
                  placeholder="Zohir K."
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-sans font-medium text-text-faint ms-1">{t('auth.label.email')}</label>
            <div className="relative">
              <Mail size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 ps-10 pe-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
                placeholder="nom@exemple.com"
              />
            </div>
          </div>

          {!isResetting && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ms-1">
                <label className="block text-xs font-sans font-medium text-text-faint">{t('auth.label.password')}</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setError("");
                      setMessage("");
                    }}
                    className="text-[10px] font-sans text-text-faint hover:text-gold transition-colors"
                  >
                    {t('auth.forgot')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 ps-10 pe-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-4 bg-gold hover:bg-gold-dim text-bg font-sans text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : isResetting ? t('auth.action.reset') : isLogin ? t('auth.action.login') : t('auth.action.register')}
          </button>

          <div className="mt-6 text-center">
            {isResetting ? (
              <button
                type="button"
                onClick={() => {
                  setIsResetting(false);
                  setError("");
                  setMessage("");
                }}
                className="text-xs font-sans text-text-faint hover:text-gold transition-colors"
              >
                {t('auth.link.back')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setMessage("");
                }}
                className="text-xs font-sans text-text-faint hover:text-gold transition-colors"
              >
                {isLogin ? t('auth.link.register') : t('auth.link.login')}
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
