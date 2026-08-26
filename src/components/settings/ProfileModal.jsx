import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore.jsx";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { cn } from "../../lib/utils.js";

/**
 * ProfileModal
 * 
 * A modal component for users to manage their profile settings (Name, Initials, Avatar, Currency).
 * It syncs local form state with the global `useStore` profile data.
 * Renders via React Portal to avoid CSS stacking context (z-index) issues.
 */
export function ProfileModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { profile, setProfile, user, logout, subscriptions, update } = useStore();
  
  // Local form state
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync local state with the global profile whenever the modal opens or the profile updates remotely
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setName(profile.name || "");
      setInitials(profile.initials || "");
      setCurrency(profile.currency || "DZD");
      setAvatarUrl(profile.avatarUrl || "");
    } else {
      setTimeout(() => setMounted(false), 300);
    }
  }, [isOpen, profile]);

  if (!isOpen && !mounted) return null;

  /**
   * handleSave
   * Validates inputs, generates auto-initials if empty, and dispatches to Firebase via setProfile.
   */
  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedInitials = initials.trim().toUpperCase().slice(0, 3);
    if (!trimmedName) return; // Prevent saving an empty name
    
    setSaving(true);
    
    await setProfile({ 
      name: trimmedName, 
      initials: trimmedInitials || trimmedName.slice(0, 2).toUpperCase(), // Fallback to first 2 letters
      currency,
      avatarUrl
    });
    
    setSaving(false);
    onClose();
  }

  /**
   * handleAvatarUpload
   * Reads an uploaded image file, paints it to a canvas to crop it into a perfect square, 
   * and saves it as a base64 Data URL to be stored in the user's profile.
   */
  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 150; // Standardize avatar size
        canvas.width = size;
        canvas.height = size;
        
        // Calculate crop dimensions to cover the square canvas
        const ratio = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * ratio) / 2;
        const y = (size - img.height * ratio) / 2;
        
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * ratio, img.height * ratio);
        
        // Convert to a compressed JPEG string
        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sliding Overlay */}
      <div 
        className={cn(
          "absolute top-0 bottom-0 right-0 w-full md:w-[600px] bg-bg-2 border-l border-border shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300 ease-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
      >
        {/* Banner Header */}
        <div className="relative h-32 bg-bg-3 w-full shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 end-4 bg-bg/50 hover:bg-bg border border-border-2 rounded-full cursor-pointer text-text-faint text-xl leading-none w-8 h-8 flex items-center justify-center backdrop-blur-md transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative flex-1">
          {/* Avatar & Title Overlapping Banner */}
          <div className="flex flex-col mb-8">
            <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-bg-2 overflow-hidden bg-bg shrink-0 -mt-14 sm:-mt-16 mb-3">
              <div className="w-full h-full flex items-center justify-center font-plex text-4xl sm:text-5xl font-semibold"
                   style={{ background: "var(--gold)", color: "#020d0d" }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials.trim().toUpperCase().slice(0, 3) || "?"
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                <span className="text-white font-plex text-[10px] uppercase tracking-wider">{t('profile.photo.edit')}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            <div>
              <div className="font-sans text-2xl font-bold text-text">
                {name || profile.name || "User"}
              </div>
              {user?.email && (
                <div className="font-plex text-xs text-text-faint mt-0.5">
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="flex flex-col gap-6 mb-8">
            {/* Name */}
            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-6 items-start sm:items-center">
              <div className="sm:col-span-4 font-plex text-[10px] tracking-[1.5px] uppercase text-text-faint">
                {t('settings.profile.name')}
              </div>
              <div className="sm:col-span-8 w-full">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settings.profile.name_ph')}
                  className="w-full bg-bg border border-border-2 rounded-lg px-4 py-2.5 font-plex text-[13px] text-text outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            {user?.email && (
              <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-6 items-start sm:items-center">
                <div className="sm:col-span-4 font-plex text-[10px] tracking-[1.5px] uppercase text-text-faint">
                  {t('profile.email')}
                </div>
                <div className="sm:col-span-8 w-full">
                  <div className="w-full bg-bg-3 border border-border-2 rounded-lg px-4 py-2.5 font-plex text-[13px] text-text-faint opacity-70">
                    {user.email}
                  </div>
                </div>
              </div>
            )}

            {/* Initials & Currency */}
            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-6 items-start">
              <div className="sm:col-span-4 font-plex text-[10px] tracking-[1.5px] uppercase text-text-faint pt-3">
                {t('profile.settings.title')}
              </div>
              <div className="sm:col-span-8 w-full flex gap-4">
                <div className="flex-1">
                  <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-muted mb-1.5">
                    {t('settings.profile.initials')}
                  </div>
                  <input
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder={t('settings.profile.initials_ph')}
                    maxLength={3}
                    className="w-full bg-bg border border-border-2 rounded-lg px-4 py-2.5 font-plex text-[13px] text-text outline-none focus:border-gold uppercase tracking-[3px] transition-colors"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-muted mb-1.5">
                    {t('profile.currency')}
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-bg border border-border-2 rounded-lg px-4 py-2.5 font-plex text-[13px] text-text outline-none focus:border-gold cursor-pointer appearance-none transition-colors"
                  >
                    <option value="DZD">DZD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-6 items-start sm:items-center">
              <div className="sm:col-span-4 font-plex text-[10px] tracking-[1.5px] uppercase text-text-faint">
                {t('profile.photo.title')}
              </div>
              <div className="sm:col-span-8 w-full flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border-2 border-border-2"
                     style={{ background: "var(--gold)", color: "#020d0d" }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Mini" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-plex text-sm font-semibold">
                      {initials.trim().toUpperCase().slice(0, 3) || "?"}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer">
                  <div className="font-plex text-xs font-semibold text-text hover:text-gold transition-colors">
                    {t('profile.photo.replace')}
                  </div>
                  <div className="font-plex text-[10px] text-text-faint mt-0.5">
                    {t('profile.photo.format')}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-border-2 mb-6" />

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full sm:w-auto font-plex text-[10px] tracking-[1.5px] uppercase px-5 py-2.5 rounded-lg cursor-pointer bg-red/5 border border-red/20 text-red hover:bg-red/10 transition-colors flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              {t('profile.logout')}
            </button>
            
            <div className="w-full sm:w-auto flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none font-plex text-[10px] tracking-[1.5px] uppercase px-5 py-2.5 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text hover:bg-bg-3 transition-colors"
              >
                {t('settings.cat.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none font-plex text-[10px] tracking-[1.5px] uppercase px-6 py-2.5 rounded-lg cursor-pointer border-none font-semibold transition-colors"
                style={{
                  background: name.trim() && !saving ? "var(--gold)" : "var(--border-2)",
                  color: "#020d0d",
                }}
              >
                {saving ? "..." : t('settings.profile.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
