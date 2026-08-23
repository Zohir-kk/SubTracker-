// src/store/useStore.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { CATEGORIES as defaultCategories } from "../data/subscriptions.js";

const StoreContext = createContext(null);

const DEFAULT_PROFILE = { name: "User", initials: "U", currency: "DZD", avatarUrl: "", language: "" };

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
            language: ""
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

  async function add(sub) {
    if (!user) return;
    const subsRef = collection(db, "users", user.uid, "subscriptions");
    await addDoc(subsRef, sub);
  }

  async function update(id, updates) {
    if (!user) return;
    const subRef = doc(db, "users", user.uid, "subscriptions", id);
    await updateDoc(subRef, updates);
  }

  async function remove(id) {
    if (!user) return;
    const subRef = doc(db, "users", user.uid, "subscriptions", id);
    await deleteDoc(subRef);
  }

  async function setBudget(category, limit) {
    if (!user) return;
    const newLimits = { ...budgetLimits, [category]: limit };
    await updateDoc(doc(db, "users", user.uid), { budgetLimits: newLimits });
  }

  async function addCategory(cat) {
    if (!user) return;
    const newCats = [...categories, cat];
    await updateDoc(doc(db, "users", user.uid), { categories: newCats });
  }

  async function updateCategory(key, updates) {
    if (!user) return;
    const newCats = categories.map((c) => c.key === key ? { ...c, ...updates } : c);
    await updateDoc(doc(db, "users", user.uid), { categories: newCats });
  }

  async function removeCategory(key) {
    if (!user) return;
    const newCats = categories.filter((c) => c.key !== key);
    await updateDoc(doc(db, "users", user.uid), { categories: newCats });
  }

  async function setProfile(updates) {
    if (!user) return;
    const newProfile = { ...profile, ...updates };
    await updateDoc(doc(db, "users", user.uid), { profile: newProfile });
  }

  async function setMonthlyBudget(value) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { monthlyBudget: value });
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <StoreContext.Provider
      value={{ 
        user, authLoading, logout,
        subscriptions, budgetLimits, categories, profile, monthlyBudget, 
        add, update, remove, setBudget, addCategory, updateCategory, removeCategory, setProfile, setMonthlyBudget 
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
