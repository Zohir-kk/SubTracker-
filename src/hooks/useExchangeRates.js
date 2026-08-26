import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const CACHE_KEY = 'subdz_exchange_rates';
const CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Custom hook to manage currency exchange rates and conversions.
 * Fetches daily rates from a global CDN and caches them in localStorage for 24 hours.
 * 
 * @param {boolean} forceEnable - If true, forces the engine to run even if multi-currency is disabled in the user's profile.
 * @returns {{ rates: Object, loading: boolean, error: Error|null, convertToBase: Function }}
 */
export function useExchangeRates(forceEnable = false) {
  const { profile } = useStore();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseCurrency = (profile?.currency || 'dzd').toLowerCase();
  const isEnabled = profile?.multiCurrency || forceEnable;

  useEffect(() => {
    if (!isEnabled) return;

    async function fetchRates() {
      try {
        // Check cache first
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (cached.base === baseCurrency && Date.now() - cached.timestamp < CACHE_TIME) {
            setRates(cached.rates);
            return;
          }
        }

        setLoading(true);
        // Using fawazahmed0/currency-api
        const res = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency}.json`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        const newRates = data[baseCurrency];
        setRates(newRates);
        
        // Cache it
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          base: baseCurrency,
          timestamp: Date.now(),
          rates: newRates
        }));
        
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, [baseCurrency, isEnabled]);

  /**
   * Converts an amount from a given currency to the user's base currency.
   * Prioritizes the user's custom rates over the global API rates.
   * 
   * @param {number} amount - The numeric amount to convert.
   * @param {string} fromCurrency - The 3-letter currency code of the input amount.
   * @returns {number} The converted amount in the user's base currency.
   */
  const convertToBase = (amount, fromCurrency) => {
    if (!isEnabled || !fromCurrency) return amount;
    const from = fromCurrency.toLowerCase();
    if (from === baseCurrency) return amount;
    
    // Check custom rates first (e.g. 1 EUR = 240 DZD)
    if (profile?.customRates?.[from]) {
      return amount * Number(profile.customRates[from]);
    }

    if (!rates) return amount;
    
    // 2. Fallback to direct API rate
    const rate = rates[from];
    if (rate) {
      return amount / rate;
    }
    
    return amount;
  };

  return { rates, loading, error, convertToBase };
}
