import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore.jsx";
import { useLanguage } from "../../providers/LanguageProvider.jsx";

export function ProfileModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { profile, setProfile, user, logout } = useStore();
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(profile.name || "");
    setInitials(profile.initials || "");
    setCurrency(profile.currency || "DZD");
    setAvatarUrl(profile.avatarUrl || "");
  }, [isOpen, profile]);

  if (!isOpen) return null;

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedInitials = initials.trim().toUpperCase().slice(0, 3);
    if (!trimmedName) return;
    setProfile({ 
      name: trimmedName, 
      initials: trimmedInitials || trimmedName.slice(0, 2).toUpperCase(),
      currency,
      avatarUrl
    });
    onClose();
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        
        const ratio = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * ratio) / 2;
        const y = (size - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * ratio, img.height * ratio);
        
        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
    >
      <div className="bg-bg-2 border border-border rounded-2xl p-6 w-full max-w-[340px]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
          <div className="font-sans text-[17px] font-semibold text-text">
            {t('settings.profile.title')}
          </div>
          <button
            onClick={onClose}
            className="ms-auto bg-transparent border-none cursor-pointer text-text-faint text-xl leading-none px-1.5 py-0.5"
          >
            ×
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-5 relative group w-max mx-auto">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-plex text-base font-semibold overflow-hidden border-2 border-gold"
            style={{ background: "var(--gold)", color: "#020d0d" }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials.trim().toUpperCase().slice(0, 3) || "?"
            )}
          </div>
          <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-white text-[10px]">Edit</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3.5">
          {user?.email && (
            <div>
              <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-[5px]">
                {t('profile.email')}
              </div>
              <div className="w-full bg-bg-3 border border-border-2 rounded-lg px-3 py-[9px] font-plex text-[11px] text-text-faint">
                {user.email}
              </div>
            </div>
          )}

          <div>
            <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-[5px]">
              {t('settings.profile.name')}
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('settings.profile.name_ph')}
              className="w-full bg-bg border border-border-2 rounded-lg px-3 py-[9px] font-plex text-[11px] text-text outline-none focus:border-gold"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-[5px]">
                {t('settings.profile.initials')}
              </div>
              <input
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
                placeholder={t('settings.profile.initials_ph')}
                maxLength={3}
                className="w-full bg-bg border border-border-2 rounded-lg px-3 py-[9px] font-plex text-[11px] text-text outline-none focus:border-gold uppercase tracking-[3px]"
              />
            </div>
            
            <div className="flex-1">
              <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-[5px]">
                Currency
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-bg border border-border-2 rounded-lg px-3 py-[9px] font-plex text-[11px] text-text outline-none focus:border-gold cursor-pointer appearance-none"
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

        {/* Actions */}
        <div className="mt-5 flex gap-2.5 justify-between">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-red/10 border border-red/20 text-red hover:bg-red/20 transition-colors"
          >
            {t('profile.logout')}
          </button>
          
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
            >
              {t('settings.cat.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg cursor-pointer border-none font-semibold"
              style={{
                background: name.trim() ? "var(--gold)" : "var(--border-2)",
                color: "#020d0d",
              }}
            >
              {t('settings.profile.save')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
