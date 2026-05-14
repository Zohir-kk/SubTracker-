import { useState, useCallback, useRef } from 'react';

export function useSubDzChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    const userMsg = { role: 'user', content: text };
    // Snapshot of messages including the new user message
    const history = [...messages, userMsg];

    // Immediately show the user message + an empty assistant bubble
    setMessages([...history, { role: 'assistant', content: '' }]);
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      // Read the response body as a stream of text chunks
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantContent += decoder.decode(value, { stream: true });
        // Update the last message (assistant bubble) on every chunk
        setMessages([...history, { role: 'assistant', content: assistantContent }]);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      // Replace the empty assistant bubble with an error notice
      setMessages([
        ...history,
        { role: 'assistant', content: `⚠️ ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

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
