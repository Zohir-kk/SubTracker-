import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore.jsx";

export function ProfileModal({ isOpen, onClose }) {
  const { profile, setProfile } = useStore();
  const [name, setName] = useState("");
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(profile.name || "");
    setInitials(profile.initials || "");
  }, [isOpen, profile]);

  if (!isOpen) return null;

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedInitials = initials.trim().toUpperCase().slice(0, 3);
    if (!trimmedName) return;
    setProfile({ name: trimmedName, initials: trimmedInitials || trimmedName.slice(0, 2).toUpperCase() });
    onClose();
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
    >
      <div className="bg-bg-2 border border-border rounded-2xl p-6 w-full max-w-[340px]">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
          <div className="font-playfair text-[17px] font-semibold text-text">
            Profil utilisateur
          </div>
          <button
            onClick={onClose}
            className="ml-auto bg-transparent border-none cursor-pointer text-text-faint text-xl leading-none px-1.5 py-0.5"
          >
            ×
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center font-plex text-base font-semibold"
            style={{ color: "#020d0d" }}>
            {initials.trim().toUpperCase().slice(0, 3) || "?"}
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-[5px]">
              Nom affiché
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Zohir K."
              className="w-full bg-bg border border-border-2 rounded-lg px-3 py-[9px] font-plex text-[11px] text-text outline-none focus:border-gold"
            />
          </div>

          <div>
            <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-[5px]">
              Initiales (2–3 caractères)
            </div>
            <input
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="ex: ZK"
              maxLength={3}
              className="w-full bg-bg border border-border-2 rounded-lg px-3 py-[9px] font-plex text-[11px] text-text outline-none focus:border-gold uppercase tracking-[3px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg cursor-pointer border-none font-semibold"
            style={{
              background: name.trim() ? "var(--gold)" : "var(--border-2)",
              color: "#020d0d",
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
