import { useState } from "react";
import { auth } from "../../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isResetting) {
        await sendPasswordResetEmail(auth, email);
        setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
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
         setError("Email ou mot de passe incorrect.");
      } else if (err.code === "auth/email-already-in-use") {
         setError("Cette adresse email est déjà utilisée.");
      } else if (err.code === "auth/too-many-requests") {
         setError("Trop de tentatives. Veuillez réessayer plus tard.");
      } else {
         setError("Une erreur est survenue. Veuillez vérifier vos informations.");
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
            {isResetting ? "Réinitialiser" : isLogin ? "Bon retour" : "Créer un compte"}
          </h2>
          <p className="font-sans text-sm text-text-faint">
            {isResetting 
              ? "Entrez votre email pour recevoir un lien de réinitialisation." 
              : isLogin ? "Connectez-vous pour gérer vos abonnements." : "Rejoignez SubDz pour suivre vos dépenses."}
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
              <label className="block text-xs font-sans font-medium text-text-faint ml-1">Nom</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
                  placeholder="Zohir K."
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-sans font-medium text-text-faint ml-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
                placeholder="nom@exemple.com"
              />
            </div>
          </div>

          {!isResetting && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-xs font-sans font-medium text-text-faint">Mot de passe</label>
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
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-bg border border-border-2 rounded-xl font-sans text-sm text-text focus:outline-none focus:border-gold transition-colors"
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : isResetting ? "Envoyer le lien" : isLogin ? "Se connecter" : "S'inscrire"}
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
                Retour à la connexion
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
                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
