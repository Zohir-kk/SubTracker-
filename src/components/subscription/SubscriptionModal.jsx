// src/components/subscription/SubscriptionModal.jsx
// ─────────────────────────────────────────────────────────────
// Single modal for adding and editing subscriptions.
//
// Add mode:  <SubscriptionModal isOpen sub={null} onClose={...} />
// Edit mode: <SubscriptionModal isOpen sub={existingSub} onClose={...} />
//
// Calls useStore() directly — no callbacks needed from parent.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore.jsx";

const NEW_CAT_KEY = "__new__";

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

const EMPTY_FORM = {
  name: "",
  provider: "",
  category: "streaming",
  amount: "",
  renewalDay: "",
  status: "active",
  startDate: "",
};

// ── SHARED INPUT STYLES ───────────────────────────────────────
const inputBase = {
  width: "100%",
  background: "var(--bg)",
  borderRadius: "8px",
  padding: "9px 12px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "11px",
  color: "var(--text)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

// ── FIELD ─────────────────────────────────────────────────────
// Label + input slot. Shows error inline in the label.
function Field({ label, error, children }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "8px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: error ? "var(--red)" : "var(--text-faint)",
          marginBottom: "5px",
        }}
      >
        {label}
        {error && (
          <span style={{ marginLeft: "6px", fontStyle: "italic" }}>
            — {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── FORM INPUT ────────────────────────────────────────────────
function FormInput({ error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputBase,
        border: `1px solid ${error ? "var(--red)" : focused ? "var(--gold)" : "var(--border-2)"}`,
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

// ── FORM SELECT ───────────────────────────────────────────────
function FormSelect({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputBase,
        border: `1px solid ${focused ? "var(--gold)" : "var(--border-2)"}`,
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        paddingRight: "32px",
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
    >
      {children}
    </select>
  );
}

// ── SUBSCRIPTION MODAL (MAIN EXPORT) ─────────────────────────
export function SubscriptionModal({ isOpen, sub, onClose }) {
  const { subscriptions, add, update, remove, categories, addCategory, removeCategory } = useStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Manage-categories panel ──
  const [showManageCats, setShowManageCats] = useState(false);

  // ── New-category inline form ──
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⭐");
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);

  const isEdit = Boolean(sub);

  // Reset form each time the modal opens or target sub changes
  useEffect(() => {
    if (!isOpen) return;
    setForm(
      sub
        ? {
            name: sub.name,
            provider: sub.provider || "",
            category: sub.category,
            amount: String(sub.amount),
            renewalDay: String(sub.renewalDay),
            status: sub.status,
            startDate: sub.startDate || "",
          }
        : {
            ...EMPTY_FORM,
            startDate: new Date().toISOString().split("T")[0],
          },
    );
    setConfirmDelete(false);
    setErrors({});
    setShowNewCat(false);
    setShowManageCats(false);
    setNewCatLabel("");
    setNewCatIcon("⭐");
    setNewCatColor(COLOR_PALETTE[0]);
  }, [isOpen, sub]);

  if (!isOpen) return null;

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "requis";
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = "invalide";
    const day = Number(form.renewalDay);
    if (!form.renewalDay || isNaN(day) || day < 1 || day > 31)
      errs.renewalDay = "doit être entre 1 et 31";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const cat = categories.find((c) => c.key === form.category);
    const payload = {
      name: form.name.trim(),
      provider: form.provider.trim(),
      category: form.category,
      icon: cat?.icon ?? "⭐",
      amount: Number(form.amount),
      renewalDay: Number(form.renewalDay),
      status: form.status,
      startDate: form.startDate,
    };
    if (isEdit && sub) {
      update(sub.id, payload);
    } else {
      add(payload);
    }
    onClose();
  }

  function handleDelete() {
    if (sub) remove(sub.id);
    onClose();
  }

  function handleCategoryChange(value) {
    if (value === NEW_CAT_KEY) {
      setShowNewCat(true);
    } else {
      setField("category", value);
      setShowNewCat(false);
    }
  }

  function handleCreateCategory() {
    const label = newCatLabel.trim();
    if (!label) return;
    const key = label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    addCategory({ key, label, icon: newCatIcon, color: newCatColor });
    setField("category", key);
    setShowNewCat(false);
    setNewCatLabel("");
    setNewCatIcon("⭐");
    setNewCatColor(COLOR_PALETTE[0]);
  }

  // Clicking the dark backdrop closes the modal
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
          maxWidth: "460px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* ── Header ── */}
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
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "17px",
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            {isEdit ? "Modifier l'abonnement" : "Nouvel abonnement"}
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-faint)",
              fontSize: "20px",
              lineHeight: 1,
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* ── Form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Field label="Nom" error={errors.name}>
            <FormInput
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="ex: Netflix"
              error={errors.name}
            />
          </Field>

          <Field label="Fournisseur">
            <FormInput
              value={form.provider}
              onChange={(e) => setField("provider", e.target.value)}
              placeholder="ex: Netflix Inc."
            />
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
          >
            <Field label="Catégorie">
              <FormSelect
                value={showNewCat ? NEW_CAT_KEY : form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
                <option value={NEW_CAT_KEY}>＋ Nouvelle catégorie</option>
              </FormSelect>
            </Field>

            <Field label="Statut">
              <FormSelect
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="active">Actif</option>
                <option value="paused">Pausé</option>
                <option value="trial">Essai</option>
              </FormSelect>
            </Field>
          </div>

          {/* ── Inline new-category form ── */}
          {showNewCat && (
            <div
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "8px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "2px",
                }}
              >
                Nouvelle catégorie
              </div>

              {/* Icon + Label row */}
              <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: "10px" }}>
                <FormInput
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  placeholder="⭐"
                  style={{ textAlign: "center", fontSize: "18px" }}
                />
                <FormInput
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="ex: Musique"
                />
              </div>

              {/* Color swatches */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: color,
                      border: newCatColor === color
                        ? "2px solid var(--text)"
                        : "2px solid transparent",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setShowNewCat(false); }}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: "transparent",
                    border: "1px solid var(--border-2)",
                    color: "var(--text-faint)",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCategory}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: newCatColor,
                    border: `1px solid ${newCatColor}`,
                    color: "#020d0d",
                    fontWeight: 600,
                    opacity: newCatLabel.trim() ? 1 : 0.4,
                  }}
                >
                  Créer
                </button>
              </div>
            </div>
          )}

          {/* ── Manage categories toggle ── */}
          <div>
            <button
              onClick={() => setShowManageCats((v) => !v)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "8px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-faint)",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "10px" }}>{showManageCats ? "▾" : "▸"}</span>
              Gérer les catégories
            </button>

            {showManageCats && (
              <div
                style={{
                  marginTop: "10px",
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {categories.map((cat) => {
                  const usedBy = subscriptions.filter((s) => s.category === cat.key).length;
                  const canDelete = usedBy === 0;
                  return (
                    <div
                      key={cat.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 8px",
                        borderRadius: "7px",
                        background: "var(--bg-2)",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "6px",
                          background: `${cat.color}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          flexShrink: 0,
                        }}
                      >
                        {cat.icon}
                      </div>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: "10px",
                          color: "var(--text)",
                          flex: 1,
                        }}
                      >
                        {cat.label}
                      </span>
                      {usedBy > 0 && (
                        <span
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: "8px",
                            color: "var(--text-faint)",
                          }}
                        >
                          {usedBy} abo.
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (canDelete) removeCategory(cat.key);
                        }}
                        title={canDelete ? "Supprimer" : `Utilisée par ${usedBy} abonnement(s)`}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: canDelete ? "pointer" : "not-allowed",
                          color: canDelete ? "var(--red)" : "var(--border)",
                          fontSize: "16px",
                          lineHeight: 1,
                          padding: "2px 4px",
                          borderRadius: "4px",
                          flexShrink: 0,
                          opacity: canDelete ? 1 : 0.4,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
          >
            <Field label="Montant (DZD)" error={errors.amount}>
              <FormInput
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="1 990"
                error={errors.amount}
              />
            </Field>

            <Field label="Jour de renouvellement" error={errors.renewalDay}>
              <FormInput
                type="number"
                min="1"
                max="31"
                value={form.renewalDay}
                onChange={(e) => setField("renewalDay", e.target.value)}
                placeholder="1 – 31"
                error={errors.renewalDay}
              />
            </Field>
          </div>

          <Field label="Date de début">
            <FormInput
              type="date"
              value={form.startDate}
              onChange={(e) => setField("startDate", e.target.value)}
            />
          </Field>
        </div>

        {/* ── Actions ── */}
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* Delete — two-step confirmation */}
          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                background: "transparent",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "var(--red)",
                transition: "all 0.2s ease",
              }}
            >
              Supprimer
            </button>
          )}
          {isEdit && confirmDelete && (
            <button
              onClick={handleDelete}
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "9px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                background: "rgba(248,113,113,0.15)",
                border: "1px solid var(--red)",
                color: "var(--red)",
                transition: "all 0.2s ease",
              }}
            >
              Confirmer →
            </button>
          )}

          <div style={{ flex: 1 }} />

          <button
            onClick={onClose}
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
              transition: "all 0.2s ease",
            }}
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "9px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              background: "var(--gold)",
              border: "1px solid var(--gold)",
              color: "#020d0d",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
