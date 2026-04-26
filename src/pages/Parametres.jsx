import { useState, useEffect } from "react";
import { useStore } from "../store/useStore.jsx";
import { cn } from "../lib/utils.js";

const EMOJI_GRID = [
  "📡", "📶", "🌐", "☁️", "🔌",
  "🎬", "🎭", "🎵", "🎮", "📺",
  "🚇", "🚌", "🚗", "✈️", "🚲",
  "💼", "📰", "📚", "🏋️", "🏥",
  "🛒", "🍔", "☕", "🎁", "💡",
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

const inputCls = "w-full bg-bg border border-border-2 rounded-lg px-3 py-2 font-plex text-[11px] text-text outline-none focus:border-gold box-border transition-colors duration-200";

function Section({ title, children }) {
  return (
    <div className="bg-bg-2 border border-border-2 rounded-2xl p-6 mb-4">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <span className="font-playfair text-[17px] font-semibold text-text">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint">{label}</div>
      {children}
    </div>
  );
}

function EmojiPicker({ selected, onSelect }) {
  return (
    <div className="grid gap-1.5 mt-1.5 mb-2.5" style={{ gridTemplateColumns: "repeat(13, 36px)" }}>
      {EMOJI_GRID.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className={cn(
            "w-9 h-9 rounded-lg cursor-pointer text-lg flex items-center justify-center p-0 transition-all duration-150 border",
            selected === emoji
              ? "border-2 border-gold bg-gold-dim"
              : "border border-border-2 bg-bg-3",
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ selected, onSelect }) {
  return (
    <div className="flex gap-1.5 flex-wrap mt-1 mb-3">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="w-[22px] h-[22px] rounded-full cursor-pointer p-0 shrink-0 border-2 transition-colors duration-150"
          style={{
            background: c,
            borderColor: selected === c ? "var(--text)" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function ProfileSection() {
  const { profile, setProfile } = useStore();
  const [name, setName] = useState(profile.name || "");
  const [initials, setInitials] = useState(profile.initials || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name || "");
    setInitials(profile.initials || "");
  }, [profile]);

  const previewInitials =
    initials.trim().toUpperCase().slice(0, 3) ||
    name.trim().slice(0, 2).toUpperCase() ||
    "?";

  const isDirty =
    name.trim() !== profile.name ||
    initials.trim().toUpperCase().slice(0, 3) !== profile.initials;

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

  const canSave = name.trim() && isDirty;

  return (
    <Section title="Profil utilisateur">
      <div className="flex justify-center mb-7">
        <div
          className="w-[72px] h-[72px] rounded-full bg-gold flex items-center justify-center font-plex text-xl font-semibold shadow-gold"
          style={{ color: "#020d0d" }}
        >
          {previewInitials}
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-[400px]">
        <Field label="Nom affiché">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            placeholder="ex: Zohir K."
            className={inputCls}
          />
        </Field>

        <Field label="Initiales (2–3 caractères)">
          <input
            value={initials}
            onChange={(e) => { setInitials(e.target.value.toUpperCase().slice(0, 3)); setSaved(false); }}
            placeholder="ex: ZK"
            maxLength={3}
            className={cn(inputCls, "uppercase tracking-[3px]")}
          />
        </Field>

        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="font-plex text-[9px] tracking-[1px] uppercase px-5 py-[9px] rounded-lg font-semibold border-none transition-all duration-200"
            style={{
              cursor: canSave ? "pointer" : "not-allowed",
              background: canSave ? "var(--gold)" : "var(--border-2)",
              color: canSave ? "#020d0d" : "var(--text-faint)",
            }}
          >
            Enregistrer
          </button>
          {saved && (
            <span className="font-plex text-[9px] tracking-[1px] text-gold uppercase">
              Sauvegardé
            </span>
          )}
        </div>
      </div>
    </Section>
  );
}

const EMPTY_NEW = { label: "", icon: "", color: COLOR_PALETTE[0] };

function CategoriesSection() {
  const { categories, subscriptions, addCategory, updateCategory, removeCategory, remove } = useStore();
  const [form, setForm] = useState(EMPTY_NEW);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({});

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
  function cancelEdit() { setEditingKey(null); setEditForm({}); }
  function saveEdit(key) {
    const label = editForm.label?.trim();
    if (!label) return;
    updateCategory(key, { label, icon: editForm.icon, color: editForm.color });
    cancelEdit();
  }
  function handleDelete(cat) {
    const affected = subsByCategory[cat.key] || [];
    if (affected.length === 0) removeCategory(cat.key);
    else setPendingDelete(cat.key);
  }
  function confirmDelete(key) {
    (subsByCategory[key] || []).forEach((s) => remove(s.id));
    removeCategory(key);
    setPendingDelete(null);
  }
  function slugify(str) {
    return str.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
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

  return (
    <Section title="Catégories">
      <div className="flex flex-col gap-2 mb-4">
        {categories.map((cat) => {
          const affected = subsByCategory[cat.key] || [];
          const isPending = pendingDelete === cat.key;
          const isEditing = editingKey === cat.key;
          const hasPanel = isPending || isEditing;

          return (
            <div key={cat.key}>
              {/* Row */}
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 transition-all duration-200 border",
                  hasPanel ? "rounded-[10px_10px_0_0]" : "rounded-[10px]",
                  isPending ? "bg-bg-3 border-red" :
                  isEditing ? "bg-bg border-gold" : "bg-bg border-border-2",
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                <span className="text-base leading-none shrink-0">{cat.icon}</span>
                <span className="font-plex text-[10px] tracking-[1px] text-text flex-1">{cat.label}</span>
                <span className="font-plex text-[8px] tracking-[1px] text-text-faint bg-bg-3 px-1.5 py-0.5 rounded">
                  {cat.key}
                </span>
                {affected.length > 0 && (
                  <span className="font-plex text-[8px] tracking-[1px] uppercase text-text-faint px-2 py-[3px] rounded-md border border-border-2 shrink-0">
                    En usage
                  </span>
                )}
                <button
                  onClick={() => isEditing ? cancelEdit() : startEdit(cat)}
                  className={cn(
                    "bg-transparent border border-transparent rounded-md cursor-pointer text-[13px] leading-none px-1.5 py-[3px] shrink-0 transition-all duration-150 hover:text-gold hover:border-gold",
                    isEditing ? "text-gold" : "text-text-faint",
                  )}
                  title={isEditing ? "Annuler" : "Modifier"}
                >
                  ✏
                </button>
                <button
                  onClick={() => isPending ? setPendingDelete(null) : handleDelete(cat)}
                  className={cn(
                    "bg-transparent border border-transparent rounded-md cursor-pointer text-base leading-none px-1.5 py-0.5 font-plex shrink-0 transition-all duration-150 hover:text-red hover:border-red",
                    isPending ? "text-red" : "text-text-faint",
                  )}
                  title={isPending ? "Annuler" : "Supprimer"}
                >
                  ×
                </button>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div className="bg-bg border border-gold border-t-0 rounded-[0_0_10px_10px] p-3.5">
                  <Field label="Nom">
                    <input
                      value={editForm.label || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                      className={cn(inputCls, "mb-2.5")}
                    />
                  </Field>
                  <Field label="Icône">
                    <EmojiPicker selected={editForm.icon} onSelect={(emoji) => setEditForm((f) => ({ ...f, icon: emoji }))} />
                  </Field>
                  <Field label="Couleur">
                    <ColorPicker selected={editForm.color} onSelect={(c) => setEditForm((f) => ({ ...f, color: c }))} />
                  </Field>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(cat.key)}
                      disabled={!editForm.label?.trim()}
                      className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg border-none font-semibold transition-all duration-200"
                      style={{
                        cursor: editForm.label?.trim() ? "pointer" : "not-allowed",
                        background: editForm.label?.trim() ? "var(--gold)" : "var(--border-2)",
                        color: editForm.label?.trim() ? "#020d0d" : "var(--text-faint)",
                      }}
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirmation panel */}
              {isPending && (
                <div className="bg-bg border border-red border-t-0 rounded-[0_0_10px_10px] px-3.5 py-3">
                  <div className="font-plex text-[9px] text-red tracking-[1px] uppercase mb-2">
                    {affected.length} abonnement{affected.length > 1 ? "s" : ""} sera{affected.length > 1 ? "ont" : ""} supprimé{affected.length > 1 ? "s" : ""}
                  </div>
                  <div className="flex flex-col gap-1 mb-3">
                    {affected.map((s) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="text-xs">{s.icon}</span>
                        <span className="font-plex text-[9px] text-text-muted">{s.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDelete(cat.key)}
                      className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-[7px] rounded-[7px] cursor-pointer bg-red border-none font-semibold"
                      style={{ color: "#fff" }}
                    >
                      Supprimer tout
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-[7px] rounded-[7px] cursor-pointer bg-transparent border border-border-2 text-text-faint"
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

      {/* Add form / trigger */}
      {open ? (
        <div className="p-3.5 bg-bg border border-border rounded-[10px]">
          <Field label="Nom">
            <input
              value={form.label}
              onChange={(e) => { setForm((f) => ({ ...f, label: e.target.value })); setError(""); }}
              placeholder="ex: Musique"
              className={cn(inputCls, "mb-2.5")}
            />
          </Field>
          <Field label="Icône">
            <EmojiPicker selected={form.icon} onSelect={(emoji) => { setForm((f) => ({ ...f, icon: emoji })); setError(""); }} />
          </Field>
          <Field label="Couleur">
            <ColorPicker selected={form.color} onSelect={(c) => setForm((f) => ({ ...f, color: c }))} />
          </Field>

          {error && (
            <div className="font-plex text-[9px] text-red mt-2">{error}</div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg cursor-pointer bg-gold border-none font-semibold"
              style={{ color: "#020d0d" }}
            >
              Ajouter
            </button>
            <button
              onClick={() => { setOpen(false); setForm(EMPTY_NEW); setError(""); }}
              className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 font-plex text-[9px] tracking-[1px] uppercase px-4 py-[9px] rounded-lg cursor-pointer bg-transparent border border-dashed border-border text-text-faint hover:border-gold hover:text-gold transition-all duration-200 w-full justify-center"
        >
          + Nouvelle catégorie
        </button>
      )}
    </Section>
  );
}

export function Parametres() {
  return (
    <div className="p-2.5 md:p-4 overflow-y-auto">
      <div className="mb-5">
        <div className="font-playfair text-[22px] font-bold text-text mb-1">
          Paramètres
        </div>
        <div className="font-plex text-[9px] tracking-[1.5px] uppercase text-text-faint">
          Préférences & configuration
        </div>
      </div>

      <ProfileSection />
      <CategoriesSection />
    </div>
  );
}
