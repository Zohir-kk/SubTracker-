import { useState, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { buildContext } from '@/lib/buildContext';

export function useSubDzChat() {
  const { subscriptions, budgetLimits, categories } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text };
    const history = [...messages, userMsg];

    setMessages([...history, { role: 'assistant', content: '' }]);
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    // Build the context block from live store data
    const context = buildContext(subscriptions, budgetLimits, categories);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: assistantContent }]);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setMessages([
        ...history,
        { role: 'assistant', content: `⚠️ ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, subscriptions, budgetLimits, categories]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  }, [input, isLoading, sendMessage]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { messages, input, setInput, isLoading, error, handleSubmit, stop };
}
