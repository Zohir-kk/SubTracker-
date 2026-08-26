import { useState, useEffect } from "react";
import { useStore } from "../store/useStore.jsx";
import { cn } from "../lib/utils.js";
import { useLanguage } from "../providers/LanguageProvider.jsx";
import { useExchangeRates } from "../hooks/useExchangeRates.js";

import { Icon } from "../components/ui/Icon.jsx";
import { IconPicker } from "../components/ui/IconPicker.jsx";
import { ChevronLeft, Trash2 } from "lucide-react";

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
        <span className="font-sans text-[17px] font-semibold text-text">{title}</span>
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



const EMPTY_NEW = { label: "", icon: "", color: COLOR_PALETTE[0] };

function CategoriesSection() {
  const { categories, subscriptions, addCategory, updateCategory, removeCategory, remove } = useStore();
  const { t } = useLanguage();
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
    if (!label) { setError(t('settings.cat.err_name')); return; }
    if (!icon) { setError(t('settings.cat.err_icon')); return; }
    const key = slugify(label);
    if (!key) { setError(t('settings.cat.err_invalid')); return; }
    if (categories.find((c) => c.key === key)) { setError(t('settings.cat.err_exists')); return; }
    addCategory({ key, label, icon, color: form.color });
    setForm(EMPTY_NEW);
    setOpen(false);
    setError("");
  }

  return (
    <Section title={t('settings.cat.title')}>
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
                <span className="shrink-0 text-text-faint"><Icon name={cat.icon} size={16} /></span>
                <span className="font-plex text-[10px] tracking-[1px] text-text flex-1">{cat.label}</span>
                <span className="font-plex text-[8px] tracking-[1px] text-text-faint bg-bg-3 px-1.5 py-0.5 rounded">
                  {cat.key}
                </span>
                {affected.length > 0 && (
                  <span className="font-plex text-[8px] tracking-[1px] uppercase text-text-faint px-2 py-[3px] rounded-md border border-border-2 shrink-0">
                    {t('settings.cat.in_use')}
                  </span>
                )}
                <button
                  onClick={() => isEditing ? cancelEdit() : startEdit(cat)}
                  className={cn(
                    "bg-transparent border border-transparent rounded-md cursor-pointer text-[13px] leading-none px-1.5 py-[3px] shrink-0 transition-all duration-150 hover:text-gold hover:border-gold",
                    isEditing ? "text-gold" : "text-text-faint",
                  )}
                  title={isEditing ? t('settings.cat.cancel') : t('settings.cat.edit')}
                >
                  ✏
                </button>
                <button
                  onClick={() => isPending ? setPendingDelete(null) : handleDelete(cat)}
                  className={cn(
                    "bg-transparent border border-transparent rounded-md cursor-pointer text-base leading-none px-1.5 py-0.5 font-plex shrink-0 transition-all duration-150 hover:text-red hover:border-red",
                    isPending ? "text-red" : "text-text-faint",
                  )}
                  title={isPending ? t('settings.cat.cancel') : t('settings.cat.delete')}
                >
                  {isPending ? '×' : <Trash2 size={13} />}
                </button>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div className="bg-bg border border-gold border-t-0 rounded-[0_0_10px_10px] p-3.5">
                  <Field label={t('settings.cat.name')}>
                    <input
                      value={editForm.label || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                      className={cn(inputCls, "mb-2.5")}
                    />
                  </Field>
                  <Field label={t('settings.cat.icon')}>
                    <IconPicker selected={editForm.icon} onSelect={(icon) => setEditForm((f) => ({ ...f, icon }))} />
                  </Field>
                  <Field label={t('settings.cat.color')}>
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
                      {t('settings.profile.save')}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
                    >
                      {t('settings.cat.cancel')}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirmation panel */}
              {isPending && (
                <div className="bg-bg border border-red border-t-0 rounded-[0_0_10px_10px] px-3.5 py-3">
                  <div className="font-plex text-[9px] text-red tracking-[1px] uppercase mb-2">
                    {affected.length} {t('settings.cat.delete_confirm')}
                  </div>
                  <div className="flex flex-col gap-1 mb-3">
                    {affected.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 text-text-faint">
                        <Icon name={s.icon} size={12} />
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
                      {t('settings.cat.delete_all')}
                    </button>
                    <button
                      onClick={() => setPendingDelete(null)}
                      className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-[7px] rounded-[7px] cursor-pointer bg-transparent border border-border-2 text-text-faint"
                    >
                      {t('settings.cat.cancel')}
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
          <Field label={t('settings.cat.name')}>
            <input
              value={form.label}
              onChange={(e) => { setForm((f) => ({ ...f, label: e.target.value })); setError(""); }}
              className={cn(inputCls, "mb-2.5")}
            />
          </Field>
          <Field label={t('settings.cat.icon')}>
            <IconPicker selected={form.icon} onSelect={(icon) => { setForm((f) => ({ ...f, icon })); setError(""); }} />
          </Field>
          <Field label={t('settings.cat.color')}>
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
              {t('settings.cat.add')}
            </button>
            <button
              onClick={() => { setOpen(false); setForm(EMPTY_NEW); setError(""); }}
              className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
            >
              {t('settings.cat.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 font-plex text-[9px] tracking-[1px] uppercase px-4 py-[9px] rounded-lg cursor-pointer bg-transparent border border-dashed border-border text-text-faint hover:border-gold hover:text-gold transition-all duration-200 w-full justify-center"
        >
          + {t('settings.cat.new')}
        </button>
      )}
    </Section>
  );
}

const ALL_CURRENCIES = ["dzd", "eur", "usd", "gbp", "cad"];

function PreferencesSection() {
  const { profile, setProfile } = useStore();
  const { t } = useLanguage();
  const [salaryDay, setSalaryDay] = useState(profile.salaryDay || 1);
  const [multiCurrency, setMultiCurrency] = useState(profile.multiCurrency || false);
  const { rates: liveRates } = useExchangeRates(multiCurrency);
  
  const baseCurr = (profile.currency || 'dzd').toLowerCase();
  const availableCurrencies = ALL_CURRENCIES.filter(c => c !== baseCurr);

  const [rates, setRates] = useState(() => {
    const init = {};
    availableCurrencies.forEach(c => {
      let val = profile.customRates?.[c];
      if (val) {
        if (c === 'dzd') val = (1 / val).toFixed(2);
        init[c] = val;
      } else {
        init[c] = "";
      }
    });
    return init;
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSalaryDay(profile.salaryDay || 1);
    setMultiCurrency(profile.multiCurrency || false);
    
    const newRates = {};
    availableCurrencies.forEach(c => {
      let val = profile.customRates?.[c];
      if (val) {
        if (c === 'dzd') val = (1 / val).toFixed(2);
        newRates[c] = val;
      } else {
        newRates[c] = "";
      }
    });
    setRates(newRates);
  }, [profile]);

  const isDirty = 
    salaryDay !== (profile.salaryDay || 1) || 
    multiCurrency !== (profile.multiCurrency || false) ||
    availableCurrencies.some(c => {
      let savedVal = profile.customRates?.[c];
      if (savedVal && c === 'dzd') savedVal = (1 / savedVal).toFixed(2);
      return (rates[c] || "") !== (savedVal?.toString() || "");
    });

  function handleSave() {
    const customRates = { ...profile.customRates };
    availableCurrencies.forEach(c => {
      if (rates[c]) {
        let val = Number(rates[c]);
        // DZD is our internal base reference for everything in the database. 
        // If the user inputs a DZD rate relative to their selected base currency, 
        // we invert it (1/x) so it stores correctly in the database as "Base -> DZD".
        if (c === 'dzd') val = 1 / val;
        customRates[c] = val;
      } else {
        // Remove empty values to fall back to the live API rate for this currency
        delete customRates[c];
      }
    });

    setProfile({ salaryDay: Number(salaryDay), multiCurrency, customRates });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Section title={t('settings.prefs.title')}>
      <div className="flex flex-col gap-4 max-w-[400px]">
        <Field label={t('settings.prefs.salary_day')}>
          <input
            type="number"
            min="1"
            max="31"
            value={salaryDay}
            onChange={(e) => { setSalaryDay(e.target.value); setSaved(false); }}
            placeholder={t('settings.prefs.salary_day_ph')}
            className={inputCls}
          />
          <div className="text-[10px] text-text-faint mt-1">{t('settings.prefs.salary_day_desc')}</div>
        </Field>
        <div className="flex items-center justify-between border border-border-2 rounded-lg p-3 mt-2">
          <div>
            <div className="font-sans text-sm text-text font-medium">{t('settings.prefs.multi_currency')}</div>
            <div className="text-[10px] text-text-faint">{t('settings.prefs.multi_currency_desc')}</div>
          </div>
          <button
            onClick={() => { setMultiCurrency(!multiCurrency); setSaved(false); }}
            className={cn("w-10 h-6 rounded-full transition-colors relative", multiCurrency ? "bg-gold" : "bg-bg-3")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-bg absolute top-1 transition-transform", multiCurrency ? "translate-x-5 rtl:-translate-x-5" : "translate-x-1 rtl:-translate-x-1")} />
          </button>
        </div>

        {multiCurrency && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-bg-2 border border-border-2 rounded-lg -mt-2">
            {availableCurrencies.map(curr => {
              const isDzd = curr === 'dzd';
              const base = profile.currency || 'DZD';
              const label = isDzd ? `1 ${base.toUpperCase()} = (DZD)` : `1 ${curr.toUpperCase()} = (${base.toUpperCase()})`;
              
              let placeholder = "Live API";
              if (liveRates && liveRates[curr]) {
                placeholder = `~ ${isDzd ? liveRates[curr].toFixed(2) : (1 / liveRates[curr]).toFixed(2)}`;
              }
              return (
                <Field key={curr} label={label}>
                  <input 
                    type="number" 
                    value={rates[curr] || ""} 
                    onChange={(e) => {
                      setRates(prev => ({...prev, [curr]: e.target.value}));
                      setSaved(false);
                    }} 
                    placeholder={placeholder} 
                    className={inputCls} 
                  />
                </Field>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="font-plex text-[9px] tracking-[1px] uppercase px-5 py-[9px] rounded-lg font-semibold border-none transition-all duration-200"
            style={{
              cursor: isDirty ? "pointer" : "not-allowed",
              background: isDirty ? "var(--gold)" : "var(--border-2)",
              color: isDirty ? "#020d0d" : "var(--text-faint)",
            }}
          >
            {t('settings.profile.save')}
          </button>
          {saved && (
            <span className="font-plex text-[9px] tracking-[1px] text-gold uppercase">
              {t('settings.profile.saved')}
            </span>
          )}
        </div>
      </div>
    </Section>
  );
}

function DataSection() {
  const { exportData, importData, resetAccount } = useStore();
  const { t } = useLanguage();
  const [resetWarn, setResetWarn] = useState(false);

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const confirmed = window.confirm(t('settings.data.import_warning'));
      if (confirmed) {
        await importData(event.target.result);
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  }

  return (
    <Section title={t('settings.data.title')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[600px] mb-6">
        <div className="border border-border-2 rounded-xl p-4 flex flex-col items-start">
          <div className="font-sans text-sm text-text font-medium mb-1">{t('settings.data.export')}</div>
          <div className="text-[10px] text-text-faint mb-4">{t('settings.data.export_desc')}</div>
          <button
            onClick={exportData}
            className="mt-auto font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg bg-bg-3 hover:bg-bg border border-border-2 text-text transition-colors cursor-pointer"
          >
            {t('settings.data.export')}
          </button>
        </div>
        <div className="border border-border-2 rounded-xl p-4 flex flex-col items-start relative overflow-hidden group cursor-pointer hover:border-gold transition-colors">
          <div className="font-sans text-sm text-text font-medium mb-1 group-hover:text-gold transition-colors">{t('settings.data.import')}</div>
          <div className="text-[10px] text-text-faint mb-4">{t('settings.data.import_desc')}</div>
          <button className="mt-auto font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg bg-bg-3 border border-border-2 text-text transition-colors group-hover:bg-bg pointer-events-none">
            {t('settings.data.import_btn')}
          </button>
          <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      </div>
      
      <div className="border border-red rounded-xl p-4 max-w-[600px] bg-red/5">
        <div className="font-sans text-sm text-red font-medium mb-1">{t('settings.data.danger')}</div>
        <div className="text-[10px] text-text-faint mb-4">{t('settings.data.danger_desc')}</div>
        
        {resetWarn ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-xs text-red font-medium">{t('settings.data.reset_confirm')}</span>
            <div className="flex gap-2">
              <button
                onClick={() => { resetAccount(); setResetWarn(false); }}
                className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-[7px] rounded-[7px] cursor-pointer bg-red border-none text-white font-semibold"
              >
                {t('settings.data.reset')}
              </button>
              <button
                onClick={() => setResetWarn(false)}
                className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-[7px] rounded-[7px] cursor-pointer bg-bg border border-border-2 text-text-faint"
              >
                {t('settings.cat.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setResetWarn(true)}
            className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg cursor-pointer bg-red border-none text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {t('settings.data.reset')}
          </button>
        )}
      </div>
    </Section>
  );
}

export function Parametres({ onNavigate }) {
  const { t } = useLanguage();
  return (
    <div className="p-2.5 md:p-4 overflow-y-auto">
      <div className="mb-5 flex items-center gap-3">
        {onNavigate && (
           <button onClick={() => onNavigate("dashboard")} className="p-2 -ml-2 rounded-full hover:bg-bg-3 text-text-faint transition-colors cursor-pointer flex items-center justify-center">
             <ChevronLeft size={20} className="rtl:rotate-180" />
           </button>
        )}
        <div>
          <div className="font-sans text-[22px] font-bold text-text mb-1">
            {t('settings.title')}
          </div>
          <div className="font-plex text-[9px] tracking-[1.5px] uppercase text-text-faint">
            {t('settings.subtitle')}
          </div>
        </div>
      </div>

      <PreferencesSection />
      <CategoriesSection />
      <DataSection />
    </div>
  );
}
