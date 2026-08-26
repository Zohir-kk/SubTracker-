// src/store/useStore.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";
import { CATEGORIES as defaultCategories } from "../data/subscriptions.js";

const StoreContext = createContext(null);

const DEFAULT_PROFILE = { name: "User", initials: "U", currency: "DZD", avatarUrl: "", language: "", salaryDay: 1, multiCurrency: false, customRates: {} };

/**
 * StoreProvider acts as the single source of truth for the application state.
 * It strictly syncs data with Firebase Firestore and manages the authentication state.
 */
export function StoreProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // State slices mapped directly from Firestore
  const [subscriptions, setSubscriptions] = useState([]);
  const [budgetLimits, setBudgetLimitsState] = useState({});
  const [categories, setCategoriesState] = useState(defaultCategories);
  const [profile, setProfileState] = useState(DEFAULT_PROFILE);
  const [monthlyBudget, setMonthlyBudgetState] = useState(0);

  /**
   * 1. Listen for Auth State
   * Determines if a user is logged in. If logged out, clears all local state to prevent data leaks.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Clear state if logged out
        setSubscriptions([]);
        setBudgetLimitsState({});
        setCategoriesState(defaultCategories);
        setProfileState(DEFAULT_PROFILE);
        setMonthlyBudgetState(0);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  /**
   * 2. Fetch/Listen to Firestore Data when User is logged in
   * Sets up real-time listeners for the user's root document (profile, budget, categories).
   */
  useEffect(() => {
    if (!user) return;

    // Listen to user document (profile, budgetLimits, categories, monthlyBudget)
    const userDocRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileState(data.profile || DEFAULT_PROFILE);
        setBudgetLimitsState(data.budgetLimits || {});
        setCategoriesState(data.categories || defaultCategories);
        setMonthlyBudgetState(data.monthlyBudget || 0);
      } else {
        // Initialize new user document for first-time login
        setDoc(userDocRef, {
          profile: { 
            name: user.displayName || "User", 
            initials: (user.displayName || "User").charAt(0),
            currency: "DZD",
            avatarUrl: "",
            language: "",
            salaryDay: 1,
            multiCurrency: false,
            customRates: {}
          },
          budgetLimits: {},
          categories: defaultCategories,
          monthlyBudget: 0
        });
      }
      setAuthLoading(false);
    });

    // Listen to subscriptions subcollection
    const subsRef = collection(db, "users", user.uid, "subscriptions");
    const unsubSubs = onSnapshot(subsRef, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setSubscriptions(subs);
    });

    return () => {
      unsubUser();
      unsubSubs();
    };
  }, [user]);

  // ── CRUD ────────────────────────────────────────────────────

  /**
   * Adds a new subscription to the user's Firestore collection.
   * @param {Object} sub - The subscription object to add.
   * @returns {Promise<void>}
   */
  async function add(sub) {
    if (!user) return;
    const subsRef = collection(db, "users", user.uid, "subscriptions");
    await addDoc(subsRef, sub);
  }

  /**
   * Updates an existing subscription.
   * @param {string} id - The document ID of the subscription.
   * @param {Object} updates - The fields to update.
   * @returns {Promise<void>}
   */
  async function update(id, updates) {
    if (!user) return;
    const subRef = doc(db, "users", user.uid, "subscriptions", id);
    await updateDoc(subRef, updates);
  }

  /**
   * Removes a subscription from Firestore.
   * @param {string} id - The document ID of the subscription to delete.
   * @returns {Promise<void>}
   */
  async function remove(id) {
    if (!user) return;
    const subRef = doc(db, "users", user.uid, "subscriptions", id);
    await deleteDoc(subRef);
  }

  /**
   * Sets a specific budget limit for a given category.
   * @param {string} category - The category key (e.g., 'entertainment').
   * @param {number} limit - The budget limit amount in the user's base currency.
   * @returns {Promise<void>}
   */
  async function setBudget(category, limit) {
    if (!user) return;
    const newLimits = { ...budgetLimits, [category]: limit };
    await updateDoc(doc(db, "users", user.uid), { budgetLimits: newLimits });
  }

  /**
   * Adds a custom category to the user's profile.
   * @param {Object} cat - The category object containing key, label, icon, and color.
   * @returns {Promise<void>}
   */
  async function addCategory(cat) {
    if (!user) return;
    const newCats = [...categories, cat];
    await updateDoc(doc(db, "users", user.uid), { categories: newCats });
  }

  /**
   * Updates an existing custom category.
   * @param {string} key - The unique key of the category to update.
   * @param {Object} updates - The fields to update (e.g., color, label).
   * @returns {Promise<void>}
   */
  async function updateCategory(key, updates) {
    if (!user) return;
    const newCats = categories.map((c) => c.key === key ? { ...c, ...updates } : c);
    await updateDoc(doc(db, "users", user.uid), { categories: newCats });
  }

  /**
   * Removes a custom category from the user's profile.
   * @param {string} key - The unique key of the category to remove.
   * @returns {Promise<void>}
   */
  async function removeCategory(key) {
    if (!user) return;
    const newCats = categories.filter((c) => c.key !== key);
    await updateDoc(doc(db, "users", user.uid), { categories: newCats });
  }

  /**
   * Updates the user's profile settings (e.g., currency, salaryDay, customRates).
   * @param {Object} updates - The partial profile object to merge.
   * @returns {Promise<void>}
   */
  async function setProfile(updates) {
    if (!user) return;
    const newProfile = { ...profile, ...updates };
    await updateDoc(doc(db, "users", user.uid), { profile: newProfile });
  }

  /**
   * Sets the global monthly budget limit.
   * @param {number} value - The total monthly budget limit.
   * @returns {Promise<void>}
   */
  async function setMonthlyBudget(value) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { monthlyBudget: value });
  }

  /**
   * Signs the user out of Firebase Auth.
   * State is cleared automatically by the onAuthStateChanged listener.
   * @returns {Promise<void>}
   */
  async function logout() {
    await signOut(auth);
  }

  // ── DATA MANAGEMENT ───────────────────────────────────────────────────

  /**
   * Exports the user's entire dataset (profile, subscriptions, budgets, etc.)
   * as a downloadable JSON file.
   * @returns {Promise<void>}
   */
  async function exportData() {
    if (!user) return;
    const data = {
      profile,
      budgetLimits,
      categories,
      monthlyBudget,
      subscriptions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subdz_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports a dataset from a JSON string, completely overwriting the user's current data.
   * Uses a Firestore batch write to ensure all operations succeed or fail together.
   * @param {string} jsonData - The JSON string representing the exported data.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async function importData(jsonData) {
    if (!user) return false;
    try {
      const data = JSON.parse(jsonData);
      if (!data.profile || !Array.isArray(data.subscriptions)) throw new Error("Invalid format");
      
      const batch = writeBatch(db);
      
      // Overwrite user document
      const userDocRef = doc(db, "users", user.uid);
      batch.set(userDocRef, {
        profile: { ...profile, ...data.profile },
        budgetLimits: data.budgetLimits || {},
        categories: data.categories || defaultCategories,
        monthlyBudget: data.monthlyBudget || 0
      });
      
      // Overwrite subscriptions (delete existing first)
      const subsRef = collection(db, "users", user.uid, "subscriptions");
      subscriptions.forEach(sub => {
        batch.delete(doc(subsRef, sub.id));
      });
      
      // Add new subscriptions
      data.subscriptions.forEach(sub => {
        const newSubRef = doc(subsRef);
        const { id, ...subData } = sub; // remove old id
        batch.set(newSubRef, subData);
      });
      
      await batch.commit();
      return true;
    } catch(e) {
      console.error("Import failed", e);
      return false;
    }
  }

  /**
   * Completely resets the user's account, deleting all subscriptions and budget limits,
   * but retaining basic profile settings like name and language.
   * @returns {Promise<void>}
   */
  async function resetAccount() {
    if (!user) return;
    const batch = writeBatch(db);
    
    const userDocRef = doc(db, "users", user.uid);
    batch.set(userDocRef, {
      profile: { ...profile }, // keep profile name/language
      budgetLimits: {},
      categories: defaultCategories,
      monthlyBudget: 0
    });
    
    const subsRef = collection(db, "users", user.uid, "subscriptions");
    subscriptions.forEach(sub => {
      batch.delete(doc(subsRef, sub.id));
    });
    
    await batch.commit();
  }

  return (
    <StoreContext.Provider
      value={{ 
        user, authLoading, logout,
        subscriptions, budgetLimits, categories, profile, monthlyBudget, 
        add, update, remove, setBudget, addCategory, updateCategory, removeCategory, setProfile, setMonthlyBudget,
        exportData, importData, resetAccount
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
