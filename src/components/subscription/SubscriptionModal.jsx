import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useStore } from "../../store/useStore.jsx";
import { cn } from "../../lib/utils.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { Icon } from "../ui/Icon.jsx";
import { IconPicker } from "../ui/IconPicker.jsx";
import { useToast } from "../ui/Toast.jsx";

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
  billingCycle: "monthly",
  renewalDay: "",
  renewalMonth: "",
  status: "active",
  startDate: "",
};

const inputBase = "w-full bg-bg rounded-lg px-3 py-[9px] font-plex text-[11px] text-text outline-none border transition-colors duration-200";

function Field({ label, error, children }) {
  return (
    <div>
      <div
        className={cn(
          "font-plex text-[8px] tracking-[1.5px] uppercase mb-[5px]",
          error ? "text-red" : "text-text-faint",
        )}
      >
        {label}
        {error && <span className="ms-1.5 italic">— {error}</span>}
      </div>
      {children}
    </div>
  );
}

function FormInput({ error, className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        inputBase,
        error ? "border-red" : "border-border-2 focus:border-gold",
        className,
      )}
    />
  );
}

function FormSelect({ children, className, ...props }) {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  return (
    <select
      {...props}
      className={cn(
        inputBase,
        "border-border-2 focus:border-gold cursor-pointer appearance-none",
        isRtl ? "ps-8" : "pe-8",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: isRtl ? "left 10px center" : "right 10px center",
      }}
    >
      {children}
    </select>
  );
}

export function SubscriptionModal({ isOpen, sub, onClose }) {
  const { t } = useLanguage();
  const { subscriptions, add, update, remove, categories, addCategory, updateCategory, removeCategory } = useStore();
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const [showManageCats, setShowManageCats] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("⭐");
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
  const [editCatKey, setEditCatKey] = useState(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("");
  const [editCatColor, setEditCatColor] = useState(COLOR_PALETTE[0]);
  const { addToast } = useToast();

  const isEdit = Boolean(sub);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      sub
        ? {
            name: sub.name,
            provider: sub.provider || "",
            category: sub.category,
            amount: String(sub.amount),
            billingCycle: sub.billingCycle || "monthly",
            renewalDay: String(sub.renewalDay),
            renewalMonth: sub.renewalMonth ? String(sub.renewalMonth) : "",
            status: sub.status,
            startDate: sub.startDate || "",
          }
        : { ...EMPTY_FORM, startDate: new Date().toISOString().split("T")[0] },
    );
    setConfirmDelete(false);
    setErrors({});
    setShowNewCat(false);
    setShowManageCats(false);
    setNewCatLabel("");
    setNewCatIcon("⭐");
    setNewCatColor(COLOR_PALETTE[0]);
    setEditCatKey(null);
  }, [isOpen, sub]);

  function startEditCat(cat) {
    setEditCatKey(cat.key);
    setEditCatLabel(cat.label);
    setEditCatIcon(cat.icon);
    setEditCatColor(cat.color);
    setShowNewCat(false);
  }

  function saveEditCat() {
    if (!editCatLabel.trim()) return;
    updateCategory(editCatKey, { label: editCatLabel.trim(), icon: editCatIcon, color: editCatColor });
    setEditCatKey(null);
  }

  if (!isOpen) return null;

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
    const cat = categories.find((c) => c.key === form.category);
    const payload = {
      name: form.name.trim(),
      provider: form.provider.trim(),
      category: form.category,
      icon: cat?.icon ?? "⭐",
      amount: Number(form.amount),
      billingCycle: form.billingCycle,
      renewalDay: Number(form.renewalDay),
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
    if (sub) {
      remove(sub.id);
      addToast({ type: "info", message: t('toast.sub.deleted') });
    }
    onClose();
  }

  function handleCategoryChange(value) {
    if (value === NEW_CAT_KEY) setShowNewCat(true);
    else { setField("category", value); setShowNewCat(false); }
  }

  function handleCreateCategory() {
    const label = newCatLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    addCategory({ key, label, icon: newCatIcon, color: newCatColor });
    setField("category", key);
    setShowNewCat(false);
    setNewCatLabel("");
    setNewCatIcon("⭐");
    setNewCatColor(COLOR_PALETTE[0]);
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
    >
      <div className="bg-bg-2 border border-border rounded-2xl p-6 w-full max-w-[460px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
          <div className="font-sans text-[17px] font-semibold text-text">
            {isEdit ? t('modal.sub.title_edit') : t('modal.sub.title_new')}
          </div>
          <button
            onClick={onClose}
            className="ms-auto bg-transparent border-none cursor-pointer text-text-faint text-xl leading-none px-1.5 py-0.5 rounded"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3.5">
          <Field label={t('modal.sub.name')} error={errors.name}>
            <FormInput
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="ex: Netflix"
              error={errors.name}
            />
          </Field>

          <Field label={t('modal.sub.provider')}>
            <FormInput
              value={form.provider}
              onChange={(e) => setField("provider", e.target.value)}
              placeholder="ex: Netflix Inc."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label={t('modal.sub.category')}>
              <FormSelect
                value={showNewCat ? NEW_CAT_KEY : form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
                <option value={NEW_CAT_KEY}>{t('modal.sub.cat_new')}</option>
              </FormSelect>
            </Field>
            <Field label={t('modal.sub.status')}>
              <FormSelect value={form.status} onChange={(e) => setField("status", e.target.value)}>
                <option value="active">{t('subs.status.active')}</option>
                <option value="paused">{t('subs.status.paused')}</option>
                <option value="trial">{t('subs.status.trial')}</option>
              </FormSelect>
            </Field>
          </div>

          {/* New category form */}
          {showNewCat && (
            <div className="bg-bg-3 border border-border rounded-[10px] p-3.5 flex flex-col gap-3">
              <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-gold mb-0.5">
                {t('settings.cat.new')}
              </div>
              <FormInput
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder={t('settings.cat.label_ph')}
              />
              
              <div>
                <div className="font-plex text-[10px] tracking-[1px] uppercase text-text-faint mb-2">
                  {t('settings.cat.icon')}
                </div>
                <IconPicker selected={newCatIcon} onSelect={setNewCatIcon} />
              </div>

              <div className="flex gap-2 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    className="w-6 h-6 rounded-full cursor-pointer p-0 shrink-0 border-2"
                    style={{
                      background: color,
                      borderColor: newCatColor === color ? "var(--text)" : "transparent",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNewCat(false)}
                  className="font-plex text-[9px] tracking-[1px] uppercase px-3 py-1.5 rounded-md cursor-pointer bg-transparent border border-border-2 text-text-faint"
                >
                  {t('settings.cat.cancel')}
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-1.5 rounded-md cursor-pointer border font-semibold"
                  style={{
                    background: newCatColor,
                    borderColor: newCatColor,
                    color: "#020d0d",
                    opacity: newCatLabel.trim() ? 1 : 0.4,
                  }}
                >
                  {t('modal.sub.create')}
                </button>
              </div>
            </div>
          )}

          {/* Manage categories toggle */}
          <div>
            <button
              onClick={() => setShowManageCats((v) => !v)}
              className="font-plex text-[8px] tracking-[1.5px] uppercase bg-transparent border-none cursor-pointer text-text-faint p-0 flex items-center gap-1.5"
            >
              <span className="text-[10px]">{showManageCats ? "▾" : "▸"}</span>
              {t('modal.sub.cat_manage')}
            </button>

            {showManageCats && (
              <div className="mt-2.5 bg-bg-3 border border-border rounded-[10px] p-3 flex flex-col gap-1.5">
                {categories.map((cat) => {
                  const usedBy = subscriptions.filter((s) => s.category === cat.key).length;
                  const canDelete = usedBy === 0;
                  const isEditingThis = editCatKey === cat.key;
                  return (
                    <div key={cat.key}>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 bg-bg-2 border",
                          isEditingThis
                            ? "rounded-[7px_7px_0_0] border-gold border-b-0"
                            : "rounded-[7px] border-transparent",
                        )}
                      >
                        <div
                          className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-[13px] shrink-0"
                          style={{ background: `${cat.color}18` }}
                        >
                          <Icon name={cat.icon} size={14} color="currentColor" />
                        </div>
                        <span className="font-plex text-[10px] text-text flex-1">{cat.label}</span>
                        {usedBy > 0 && (
                          <span className="font-plex text-[8px] text-text-faint">{t('modal.sub.cat_used', { count: usedBy })}</span>
                        )}
                        <button
                          onClick={() => isEditingThis ? setEditCatKey(null) : startEditCat(cat)}
                          title={isEditingThis ? t('settings.cat.cancel') : t('settings.cat.edit')}
                          className={cn(
                            "bg-transparent border-none cursor-pointer text-xs leading-none px-1 py-0.5 rounded shrink-0",
                            isEditingThis ? "text-gold" : "text-text-faint",
                          )}
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => { if (canDelete) removeCategory(cat.key); }}
                          title={canDelete ? t('settings.cat.delete') : t('modal.sub.cat_used_by', { count: usedBy })}
                          className="bg-transparent border-none text-base leading-none px-1 py-0.5 rounded shrink-0"
                          style={{
                            cursor: canDelete ? "pointer" : "not-allowed",
                            color: canDelete ? "var(--red)" : "var(--border)",
                            opacity: canDelete ? 1 : 0.4,
                          }}
                        >
                          ×
                        </button>
                      </div>

                      {isEditingThis && (
                        <div className="bg-bg-2 border border-gold border-t-0 rounded-[0_0_7px_7px] p-2.5 flex flex-col gap-2">
                          <div className="flex flex-col gap-2">
                            <FormInput
                              value={editCatLabel}
                              onChange={(e) => setEditCatLabel(e.target.value)}
                              placeholder={t('settings.cat.label_ph')}
                            />
                            <div className="mt-1">
                              <IconPicker selected={editCatIcon} onSelect={setEditCatIcon} />
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {COLOR_PALETTE.map((c) => (
                              <button
                                key={c}
                                onClick={() => setEditCatColor(c)}
                                className="w-5 h-5 rounded-full cursor-pointer p-0 shrink-0 border-2"
                                style={{
                                  background: c,
                                  borderColor: editCatColor === c ? "var(--text)" : "transparent",
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => setEditCatKey(null)}
                              className="font-plex text-[8px] tracking-[1px] uppercase px-2.5 py-[5px] rounded-md cursor-pointer bg-transparent border border-border-2 text-text-faint"
                            >
                              {t('settings.cat.cancel')}
                            </button>
                            <button
                              onClick={saveEditCat}
                              className="font-plex text-[8px] tracking-[1px] uppercase px-3 py-[5px] rounded-md cursor-pointer bg-gold border-none font-semibold"
                              style={{ color: "#020d0d", opacity: editCatLabel.trim() ? 1 : 0.4 }}
                            >
                              {t('settings.profile.save')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label={t('modal.sub.amount')} error={errors.amount}>
              <FormInput
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="1 990"
                error={errors.amount}
              />
            </Field>
            <Field label="Billing Cycle">
              <FormSelect value={form.billingCycle} onChange={(e) => setField("billingCycle", e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </FormSelect>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label={form.billingCycle === "yearly" ? "Renewal Day" : t('modal.sub.renewal')} error={errors.renewalDay}>
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
            {form.billingCycle === "yearly" && (
              <Field label="Renewal Month" error={errors.renewalMonth}>
                <FormSelect value={form.renewalMonth} onChange={(e) => setField("renewalMonth", e.target.value)}>
                  <option value="" disabled>Select Month</option>
                  <option value="1">Jan</option>
                  <option value="2">Feb</option>
                  <option value="3">Mar</option>
                  <option value="4">Apr</option>
                  <option value="5">May</option>
                  <option value="6">Jun</option>
                  <option value="7">Jul</option>
                  <option value="8">Aug</option>
                  <option value="9">Sep</option>
                  <option value="10">Oct</option>
                  <option value="11">Nov</option>
                  <option value="12">Dec</option>
                </FormSelect>
              </Field>
            )}
          </div>

          <Field label={t('modal.sub.start')}>
            <FormInput
              type="date"
              value={form.startDate}
              onChange={(e) => setField("startDate", e.target.value)}
            />
          </Field>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-2.5">
          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-[rgba(248,113,113,0.3)] text-red"
            >
              {t('settings.cat.delete')}
            </button>
          )}
          {isEdit && confirmDelete && (
            <button
              onClick={handleDelete}
              className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-[rgba(248,113,113,0.15)] border border-red text-red"
            >
              {t('modal.sub.del_confirm')}
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={onClose}
            className="font-plex text-[9px] tracking-[1px] uppercase px-3.5 py-2 rounded-lg cursor-pointer bg-transparent border border-border-2 text-text-faint"
          >
            {t('settings.cat.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-2 rounded-lg cursor-pointer bg-gold border border-gold font-semibold"
            style={{ color: "#020d0d" }}
          >
            {isEdit ? t('settings.profile.save') : t('settings.cat.add')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
