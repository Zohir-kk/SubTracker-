// src/store/useStore.jsx
// ─────────────────────────────────────────────────────────────
// Global app state via React Context + localStorage.
//
// All components read subscriptions and budgetLimits from here
// instead of the static data/subscriptions.js file.
//
// First launch: seeds from mock data so the dashboard isn't empty.
// Every mutation (add/update/remove/setBudget) auto-persists.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from "react";
import {
  subscriptions as mockSubs,
  budgetLimits as mockBudget,
  CATEGORIES as defaultCategories,
} from "../data/subscriptions.js";

const StoreContext = createContext(null);

// ── STORAGE KEYS ──────────────────────────────────────────────
const SUBS_KEY    = "subdz_subscriptions";
const BUDGET_KEY  = "subdz_budget";
const CATS_KEY    = "subdz_categories";
const PROFILE_KEY = "subdz_profile";

const DEFAULT_PROFILE = { name: "Zohir K.", initials: "ZK" };

// ── HELPERS ───────────────────────────────────────────────────
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ── STORE PROVIDER ────────────────────────────────────────────
export function StoreProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState(() =>
    loadJSON(SUBS_KEY, mockSubs),
  );
  const [budgetLimits, setBudgetLimitsState] = useState(() =>
    loadJSON(BUDGET_KEY, mockBudget),
  );
  const [categories, setCategoriesState] = useState(() =>
    loadJSON(CATS_KEY, defaultCategories),
  );
  const [profile, setProfileState] = useState(() =>
    loadJSON(PROFILE_KEY, DEFAULT_PROFILE),
  );

  useEffect(() => {
    localStorage.setItem(SUBS_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  useEffect(() => {
    localStorage.setItem(CATS_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // ── CRUD ────────────────────────────────────────────────────

  function add(sub) {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setSubscriptions((prev) => [...prev, { ...sub, id }]);
  }

  function update(id, updates) {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }

  function remove(id) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  function setBudget(category, limit) {
    setBudgetLimitsState((prev) => ({ ...prev, [category]: limit }));
  }

  function addCategory(cat) {
    setCategoriesState((prev) => [...prev, cat]);
  }

  function updateCategory(key, updates) {
    setCategoriesState((prev) => prev.map((c) => c.key === key ? { ...c, ...updates } : c));
  }

  function removeCategory(key) {
    setCategoriesState((prev) => prev.filter((c) => c.key !== key));
  }

  function setProfile(updates) {
    setProfileState((prev) => ({ ...prev, ...updates }));
  }

  return (
    <StoreContext.Provider
      value={{ subscriptions, budgetLimits, categories, profile, add, update, remove, setBudget, addCategory, updateCategory, removeCategory, setProfile }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// ── USE STORE ─────────────────────────────────────────────────
// Usage: const { subscriptions, budgetLimits, add, update, remove, setBudget } = useStore()
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
