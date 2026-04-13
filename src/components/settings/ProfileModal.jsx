// src/components/settings/ProfileModal.jsx
// ─────────────────────────────────────────────────────────────
// Small modal for editing the user's display name and initials.
// Triggered by clicking the avatar in AppHeader.
// ─────────────────────────────────────────────────────────────

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

  const inputStyle = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border-2)",
    borderRadius: "8px",
    padding: "9px 12px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box",
  };

  return createPortal(
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "340px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 600, color: "var(--text)" }}>
            Profil utilisateur
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: "20px", lineHeight: 1, padding: "2px 6px" }}
          >
            ×
          </button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "var(--gold)", color: "#020d0d",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: "16px", fontWeight: 600,
          }}>
            {initials.trim().toUpperCase().slice(0, 3) || "?"}
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "5px" }}>
              Nom affiché
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Zohir K."
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
            />
          </div>

          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "5px" }}>
              Initiales (2–3 caractères)
            </div>
            <input
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="ex: ZK"
              maxLength={3}
              style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "3px" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px",
              textTransform: "uppercase", padding: "8px 14px", borderRadius: "8px",
              cursor: "pointer", background: "transparent", border: "1px solid var(--border-2)",
              color: "var(--text-faint)",
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px",
              textTransform: "uppercase", padding: "8px 16px", borderRadius: "8px",
              cursor: "pointer", background: name.trim() ? "var(--gold)" : "var(--border-2)",
              border: "none", color: "#020d0d", fontWeight: 600,
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
