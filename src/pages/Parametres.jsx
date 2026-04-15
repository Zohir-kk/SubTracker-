// src/pages/Parametres.jsx
// ─────────────────────────────────────────────────────────────
// Settings page — Profile + Categories sections.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useStore } from "../store/useStore.jsx";
import { useWideLayout } from "../hooks/useSubscriptions.js";

// ── SECTION WRAPPER ───────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--gold)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── FIELD ─────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "8px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "var(--text-faint)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

// ── PROFILE SECTION ───────────────────────────────────────────
function ProfileSection() {
  const { profile, setProfile } = useStore();
  const [name, setName] = useState(profile.name || "");
  const [initials, setInitials] = useState(profile.initials || "");
  const [saved, setSaved] = useState(false);

  // Keep local state in sync if profile changes externally
  useEffect(() => {
    setName(profile.name || "");
    setInitials(profile.initials || "");
  }, [profile]);

  const previewInitials =
    initials.trim().toUpperCase().slice(0, 3) ||
    name.trim().slice(0, 2).toUpperCase() ||
    "?";

  const isDirty =
    name.trim() !== profile.name || initials.trim().toUpperCase().slice(0, 3) !== profile.initials;

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const trimmedInitials =
      initials.trim().toUpperCase().slice(0, 3) ||
      trimmedName.slice(0, 2).toUpperCase();
    setProfile({ name: trimmedName, initials: trimmedInitials });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
    transition: "border-color 0.2s ease",
  };

  return (
    <Section title="Profil utilisateur">
      {/* Avatar preview */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--gold)",
            color: "#020d0d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "20px",
            fontWeight: 600,
            boxShadow: "var(--shadow-gold)",
            transition: "all 0.2s ease",
          }}
        >
          {previewInitials}
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
        <Field label="Nom affiché">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            placeholder="ex: Zohir K."
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
          />
        </Field>

        <Field label="Initiales (2–3 caractères)">
          <input
            value={initials}
            onChange={(e) => { setInitials(e.target.value.toUpperCase().slice(0, 3)); setSaved(false); }}
            placeholder="ex: ZK"
            maxLength={3}
            style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "3px" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
          />
        </Field>

        {/* Save */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !isDirty}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "9px 20px",
              borderRadius: "8px",
              cursor: name.trim() && isDirty ? "pointer" : "not-allowed",
              background: name.trim() && isDirty ? "var(--gold)" : "var(--border-2)",
              border: "none",
              color: name.trim() && isDirty ? "#020d0d" : "var(--text-faint)",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            Enregistrer
          </button>

          {saved && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "1px",
                color: "var(--gold)",
                textTransform: "uppercase",
              }}
            >
              Sauvegardé
            </span>
          )}
        </div>
      </div>
    </Section>
  );
}

// ── CATEGORIES SECTION ────────────────────────────────────────
const EMOJI_GRID = [
  "📡", "📶", "🌐", "☁️", "🔌",   // internet / tech
  "🎬", "🎭", "🎵", "🎮", "📺",   // media / entertainment
  "🚇", "🚌", "🚗", "✈️", "🚲",   // transport
  "💼", "📰", "📚", "🏋️", "🏥",   // work / lifestyle
  "🛒", "🍔", "☕", "🎁", "💡",   // misc
];

const COLOR_PALETTE = [
  "var(--teal)",
  "var(--orange)",
  "var(--red)",
  "var(--green)",
  "#a78bfa",
  "#60a5fa",
  "#f472b6",
  "#fbbf24",
];

const EMPTY_NEW = { label: "", icon: "", color: COLOR_PALETTE[0] };

function CategoriesSection() {
  const { categories, subscriptions, addCategory, updateCategory, removeCategory, remove } = useStore();
  const [form, setForm] = useState(EMPTY_NEW);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Subscriptions grouped by category key
  const subsByCategory = subscriptions.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  function startEdit(cat) {
    setEditingKey(cat.key);
    setEditForm({ label: cat.label, icon: cat.icon, color: cat.color });
    setPendingDelete(null);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditForm({});
  }

  function saveEdit(key) {
    const label = editForm.label?.trim();
    if (!label) return;
    updateCategory(key, { label, icon: editForm.icon, color: editForm.color });
    cancelEdit();
  }

  function handleDelete(cat) {
    const affected = subsByCategory[cat.key] || [];
    if (affected.length === 0) {
      removeCategory(cat.key);
    } else {
      setPendingDelete(cat.key);
    }
  }

  function confirmDelete(key) {
    (subsByCategory[key] || []).forEach((s) => remove(s.id));
    removeCategory(key);
    setPendingDelete(null);
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }

  function handleAdd() {
    const label = form.label.trim();
    const icon = form.icon.trim();
    if (!label) { setError("Le nom est requis."); return; }
    if (!icon) { setError("L'icône est requise."); return; }
    const key = slugify(label);
    if (!key) { setError("Nom invalide."); return; }
    if (categories.find((c) => c.key === key)) { setError("Cette catégorie existe déjà."); return; }
    addCategory({ key, label, icon, color: form.color });
    setForm(EMPTY_NEW);
    setOpen(false);
    setError("");
  }

  const inputStyle = {
    background: "var(--bg)",
    border: "1px solid var(--border-2)",
    borderRadius: "8px",
    padding: "8px 10px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  };

  return (
    <Section title="Catégories">
      {/* Category list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {categories.map((cat) => {
          const affected = subsByCategory[cat.key] || [];
          const isPending = pendingDelete === cat.key;
          const isEditing = editingKey === cat.key;
          const hasPanel = isPending || isEditing;
          return (
            <div key={cat.key}>
              {/* ── Row ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  background: isPending ? "var(--bg-3)" : "var(--bg)",
                  border: isPending ? "1px solid var(--red)" : isEditing ? "1px solid var(--gold)" : "1px solid var(--border-2)",
                  borderRadius: hasPanel ? "10px 10px 0 0" : "10px",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <span style={{ fontSize: "16px", lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "1px", color: "var(--text)", flex: 1 }}>
                  {cat.label}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", letterSpacing: "1px", color: "var(--text-faint)", background: "var(--bg-3)", padding: "2px 6px", borderRadius: "4px" }}>
                  {cat.key}
                </span>
                {affected.length > 0 && (
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "8px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "var(--text-faint)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-2)",
                    flexShrink: 0,
                  }}>
                    En usage
                  </span>
                )}
                {/* Pencil button */}
                <button
                  onClick={() => isEditing ? cancelEdit() : startEdit(cat)}
                  style={{
                    background: "transparent",
                    border: "1px solid transparent",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: isEditing ? "var(--gold)" : "var(--text-faint)",
                    fontSize: "13px",
                    lineHeight: 1,
                    padding: "3px 6px",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.borderColor = "var(--gold)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isEditing ? "var(--gold)" : "var(--text-faint)"; e.currentTarget.style.borderColor = "transparent"; }}
                  title={isEditing ? "Annuler" : "Modifier"}
                >
                  ✏
                </button>
                {/* Delete button */}
                <button
                  onClick={() => isPending ? setPendingDelete(null) : handleDelete(cat)}
                  style={{
                    background: "transparent",
                    border: "1px solid transparent",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: isPending ? "var(--red)" : "var(--text-faint)",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "16px",
                    lineHeight: 1,
                    padding: "2px 6px",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "var(--red)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isPending ? "var(--red)" : "var(--text-faint)"; e.currentTarget.style.borderColor = "transparent"; }}
                  title={isPending ? "Annuler" : "Supprimer"}
                >
                  ×
                </button>
              </div>

              {/* ── Edit panel ── */}
              {isEditing && (
                <div style={{
                  background: "var(--bg)",
                  border: "1px solid var(--gold)",
                  borderTop: "none",
                  borderRadius: "0 0 10px 10px",
                  padding: "14px",
                }}>
                  <Field label="Nom">
                    <input
                      value={editForm.label || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                      style={{ ...inputStyle, width: "100%", marginBottom: "10px" }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
                    />
                  </Field>
                  <Field label="Icône">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(13, 36px)", gap: "6px", marginTop: "6px", marginBottom: "10px" }}>
                      {EMOJI_GRID.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setEditForm((f) => ({ ...f, icon: emoji }))}
                          style={{
                            width: "36px", height: "36px", borderRadius: "8px",
                            border: editForm.icon === emoji ? "2px solid var(--gold)" : "1px solid var(--border-2)",
                            background: editForm.icon === emoji ? "var(--gold-dim)" : "var(--bg-3)",
                            cursor: "pointer", fontSize: "18px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 0, transition: "all 0.15s ease",
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Couleur">
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px", marginBottom: "12px" }}>
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditForm((f) => ({ ...f, color: c }))}
                          style={{
                            width: "22px", height: "22px", borderRadius: "50%", background: c,
                            border: editForm.color === c ? "2px solid var(--text)" : "2px solid transparent",
                            cursor: "pointer", padding: 0, flexShrink: 0, transition: "border-color 0.15s ease",
                          }}
                        />
                      ))}
                    </div>
                  </Field>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => saveEdit(cat.key)}
                      disabled={!editForm.label?.trim()}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px",
                        textTransform: "uppercase", padding: "8px 16px", borderRadius: "8px",
                        cursor: editForm.label?.trim() ? "pointer" : "not-allowed",
                        background: editForm.label?.trim() ? "var(--gold)" : "var(--border-2)",
                        border: "none", color: editForm.label?.trim() ? "#020d0d" : "var(--text-faint)", fontWeight: 600,
                      }}
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px",
                        textTransform: "uppercase", padding: "8px 14px", borderRadius: "8px",
                        cursor: "pointer", background: "transparent", border: "1px solid var(--border-2)", color: "var(--text-faint)",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* ── Confirmation panel ── */}
              {isPending && (
                <div
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--red)",
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--red)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                    {affected.length} abonnement{affected.length > 1 ? "s" : ""} sera{affected.length > 1 ? "ont" : ""} supprimé{affected.length > 1 ? "s" : ""}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "12px" }}>
                    {affected.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "12px" }}>{s.icon}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-muted)" }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => confirmDelete(cat.key)}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px",
                        textTransform: "uppercase", padding: "7px 14px", borderRadius: "7px",
                        cursor: "pointer", background: "var(--red)", border: "none", color: "#fff", fontWeight: 600,
                      }}
                    >
                      Supprimer tout
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "1px",
                        textTransform: "uppercase", padding: "7px 14px", borderRadius: "7px",
                        cursor: "pointer", background: "transparent", border: "1px solid var(--border-2)", color: "var(--text-faint)",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {open ? (
        <div
          style={{
            padding: "14px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
          }}
        >
          <Field label="Nom">
            <input
              value={form.label}
              onChange={(e) => { setForm((f) => ({ ...f, label: e.target.value })); setError(""); }}
              placeholder="ex: Musique"
              style={{ ...inputStyle, width: "100%", marginBottom: "10px" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-2)")}
            />
          </Field>

          <Field label="Icône">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(13, 36px)",
                gap: "6px",
                marginTop: "6px",
                marginBottom: "10px",
              }}
            >
              {EMOJI_GRID.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { setForm((f) => ({ ...f, icon: emoji })); setError(""); }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: form.icon === emoji
                      ? "2px solid var(--gold)"
                      : "1px solid var(--border-2)",
                    background: form.icon === emoji ? "var(--gold-dim)" : "var(--bg-3)",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Couleur">
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: c,
                    border: form.color === c ? "2px solid var(--text)" : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                    transition: "border-color 0.15s ease",
                  }}
                />
              ))}
            </div>
          </Field>

          {error && (
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                color: "var(--red)",
                marginTop: "8px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button
              onClick={handleAdd}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                background: "var(--gold)",
                border: "none",
                color: "#020d0d",
                fontWeight: 600,
              }}
            >
              Ajouter
            </button>
            <button
              onClick={() => { setOpen(false); setForm(EMPTY_NEW); setError(""); }}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                background: "transparent",
                border: "1px solid var(--border-2)",
                color: "var(--text-faint)",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "9px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            background: "transparent",
            border: "1px dashed var(--border)",
            color: "var(--text-faint)",
            transition: "all 0.2s ease",
            width: "100%",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--gold)";
            e.currentTarget.style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-faint)";
          }}
        >
          + Nouvelle catégorie
        </button>
      )}
    </Section>
  );
}

// ── PAGE ──────────────────────────────────────────────────────
export function Parametres() {
  const isWide = useWideLayout(768);

  return (
    <div style={{ padding: isWide ? "16px" : "10px", overflowY: "auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "4px",
          }}
        >
          Paramètres
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--text-faint)",
          }}
        >
          Préférences & configuration
        </div>
      </div>

      <ProfileSection />
      <CategoriesSection />
    </div>
  );
}
