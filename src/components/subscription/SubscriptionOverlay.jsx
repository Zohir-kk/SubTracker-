import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore.jsx";
import { cn } from "../../lib/utils.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { Icon } from "../ui/Icon.jsx";
import { IconPicker } from "../ui/IconPicker.jsx";
import { useToast } from "../ui/Toast.jsx";
import { X, Calendar, DollarSign, Tag, CalendarClock, ChevronLeft, Building2 } from "lucide-react";

const NEW_CAT_KEY = "__new__";
const CURRENCIES = ["DZD", "EUR", "USD", "GBP", "CAD"];

const COLOR_PALETTE = [
  "var(--teal)", "var(--orange)", "var(--red)", "var(--green)",
  "#a78bfa", "#60a5fa", "#f472b6", "#fbbf24"
];

const EMPTY_FORM = {
  name: "",
  provider: "",
  category: "streaming",
  amount: "",
  currency: "DZD",
  billingCycle: "monthly",
  renewalDay: "",
  renewalMonth: "",
  status: "active",
  startDate: "",
};

export function SubscriptionOverlay({ isOpen, sub, defaultCategory, onClose }) {
  const { t, language } = useLanguage();
  const { add, update, remove, categories, addCategory, profile } = useStore();
  const { addToast } = useToast();

  const isEdit = !!sub;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⭐");
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      if (sub) {
        setForm({
          name: sub.name || "",
          provider: sub.provider || "",
          category: sub.category || (categories.length > 0 ? categories[0].key : "streaming"),
          amount: sub.amount || "",
          currency: sub.currency || profile.currency || "DZD",
          billingCycle: sub.billingCycle || "monthly",
          renewalDay: sub.renewalDay || "",
          renewalMonth: sub.renewalMonth || "",
          status: sub.status || "active",
          startDate: sub.startDate || "",
        });
      } else {
        setForm({ ...EMPTY_FORM, currency: profile.currency || "DZD", category: defaultCategory || (categories.length > 0 ? categories[0].key : "streaming") });
      }
      setErrors({});
      setShowNewCat(false);
    } else {
      setTimeout(() => setMounted(false), 300); // Wait for transition
    }
  }, [isOpen, sub, profile.currency]);

  if (!isOpen && !mounted) return null;

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = t('modal.sub.err_req');
    const amt = Number(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = t('modal.sub.err_inv');
    const day = Number(form.renewalDay);
    if (!form.renewalDay || isNaN(day) || day < 1 || day > 31) errs.renewalDay = t('modal.sub.err_ren');
    if (form.billingCycle === "yearly") {
      const month = Number(form.renewalMonth);
      if (!form.renewalMonth || isNaN(month) || month < 1 || month > 12) errs.renewalMonth = "Invalid month";
    }
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    // We attach the chosen category's icon directly to the subscription payload
    // to avoid having to join tables or perform complex lookups on the frontend later.
    const cat = categories.find((c) => c.key === form.category);
    const payload = {
      name: form.name.trim(),
      provider: form.provider.trim(),
      category: form.category,
      icon: cat?.icon ?? "⭐",
      amount: Number(form.amount),
      currency: form.currency,
      billingCycle: form.billingCycle,
      renewalDay: Number(form.renewalDay),
      // Yearly subscriptions require a specific renewal month, whereas monthly ones do not.
      // We set it to null to keep the database clean and prevent unexpected UI bugs.
      renewalMonth: form.billingCycle === "yearly" ? Number(form.renewalMonth) : null,
      status: form.status,
      startDate: form.startDate,
    };

    if (isEdit && sub) {
      update(sub.id, payload);
      addToast({ type: "success", message: t('toast.sub.updated') });
    } else {
      add(payload);
      addToast({ type: "success", message: t('toast.sub.added') });
    }
    onClose();
  }

  function handleDelete() {
    if (sub && window.confirm("Delete this subscription?")) {
      remove(sub.id);
      addToast({ type: "info", message: t('toast.sub.deleted') });
      onClose();
    }
  }

  function handleCreateCategory() {
    const label = newCatLabel.trim();
    if (!label) return;
    
    // Automatically generate a URL-safe key from the user's label
    // e.g. "Cloud Storage" -> "cloud-storage"
    const key = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    
    // Add it to the global store so it persists across sessions
    addCategory({ key, label, icon: newCatIcon, color: newCatColor });
    
    // Automatically select the newly created category in the active form
    setField("category", key);
    setShowNewCat(false);
  }

  const inputClasses = "w-full bg-bg border border-border-2 rounded-xl px-4 py-3 font-plex text-sm text-text outline-none focus:border-gold transition-colors duration-200 placeholder:text-text-faint/50";
  const labelClasses = "flex items-center gap-2 font-plex text-[10px] tracking-[1px] uppercase text-text-faint mb-2";

  return createPortal(
    <div className="fixed inset-0 z-[2000] overflow-hidden pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 pointer-events-auto",
          isOpen ? "opacity-100" : "opacity-0"
        )} 
        onClick={onClose}
      />

      {/* Sliding Overlay */}
      <div 
        className={cn(
          "absolute top-0 bottom-0 right-0 w-full md:w-[600px] bg-bg-2 border-l border-border shadow-2xl flex flex-col pointer-events-auto transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-bg text-text-faint transition-colors cursor-pointer">
              <ChevronLeft size={20} className="rtl:rotate-180" />
            </button>
            <div className="font-sans text-xl font-bold text-text">
              {isEdit ? t('modal.sub.title_edit') : t('modal.sub.title_new')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section: Basic Details */}
          <div className="space-y-5">
            <div>
              <label className={labelClasses}><Tag size={12} /> {t('modal.sub.name')}</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Netflix Premium"
                className={cn(inputClasses, errors.name && "border-red focus:border-red")}
              />
              {errors.name && <div className="text-red text-xs mt-1">{errors.name}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}><Building2 size={12} /> {t('modal.sub.provider')}</label>
                <input
                  value={form.provider}
                  onChange={(e) => setField("provider", e.target.value)}
                  placeholder="e.g. Netflix Inc."
                  className={inputClasses}
                />
              </div>
              
              <div>
                <label className={labelClasses}><Tag size={12} /> {t('settings.cat.title')}</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === NEW_CAT_KEY) setShowNewCat(true);
                    else setField("category", e.target.value);
                  }}
                  className={inputClasses}
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                  <option value={NEW_CAT_KEY}>+ {t('settings.cat.new')}</option>
                </select>
              </div>
            </div>

            {/* New Category Inline Form */}
            {showNewCat && (
              <div className="bg-bg border border-gold/30 rounded-xl p-4 space-y-4">
                <div className="font-plex text-xs text-gold uppercase tracking-wider font-semibold">
                  Create Category
                </div>
                <div className="flex items-center gap-3">
                  <IconPicker selected={newCatIcon} onSelect={setNewCatIcon} />
                  <input
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder={t('settings.cat.name')}
                    className={cn(inputClasses, "py-2")}
                  />
                  <button onClick={handleCreateCategory} className="bg-gold text-bg px-4 py-2 rounded-lg font-bold">
                    {t('settings.cat.add')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Pricing & Currency */}
          <div className="space-y-5">
            <label className={labelClasses}><DollarSign size={12} /> Pricing</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setField("amount", e.target.value)}
                  placeholder="0.00"
                  className={cn(inputClasses, "text-xl font-bold", errors.amount && "border-red focus:border-red")}
                />
                {errors.amount && <div className="text-red text-xs mt-1">{errors.amount}</div>}
              </div>
              
              {profile.multiCurrency ? (
                <select 
                  value={form.currency} 
                  onChange={(e) => setField("currency", e.target.value)}
                  className={cn(inputClasses, "w-28 text-center font-bold appearance-none cursor-pointer bg-bg-3")}
                >
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <div className="w-24 flex items-center justify-center bg-bg-3 border border-border-2 rounded-xl font-bold text-text-faint">
                  {profile.currency || "DZD"}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 p-1 bg-bg-3 rounded-xl">
              {["monthly", "yearly"].map(cycle => (
                <button
                  key={cycle}
                  onClick={() => setField("billingCycle", cycle)}
                  className={cn(
                    "flex-1 py-2 rounded-lg font-plex text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer",
                    form.billingCycle === cycle ? "bg-bg text-gold shadow-sm" : "text-text-faint hover:text-text"
                  )}
                >
                  {t(`modal.sub.cycle_${cycle}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Dates & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}><CalendarClock size={12} /> {t('modal.sub.renewal')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.renewalDay}
                  onChange={(e) => setField("renewalDay", e.target.value)}
                  placeholder="Day (1-31)"
                  className={cn(inputClasses, errors.renewalDay && "border-red")}
                />
                {form.billingCycle === "yearly" && (
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={form.renewalMonth}
                    onChange={(e) => setField("renewalMonth", e.target.value)}
                    placeholder="Month (1-12)"
                    className={cn(inputClasses, errors.renewalMonth && "border-red")}
                  />
                )}
              </div>
            </div>

            <div>
              <label className={labelClasses}><Calendar size={12} /> Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className={inputClasses}
              >
                <option value="active">{t('subs.status.active')}</option>
                <option value="paused">{t('subs.status.paused')}</option>
                <option value="trial">{t('subs.status.trial')}</option>
              </select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-bg-2 flex gap-3">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="bg-red/10 text-red font-plex text-sm uppercase tracking-widest font-bold px-6 py-4 rounded-xl hover:bg-red/20 transition-colors cursor-pointer"
            >
              {t('settings.cat.delete')}
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 bg-gold text-[#020d0d] font-plex text-sm uppercase tracking-widest font-bold py-4 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            {isEdit ? t('settings.profile.save') : t('modal.sub.add')}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
