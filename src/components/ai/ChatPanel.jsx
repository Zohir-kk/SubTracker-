import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

export function ChatPanel({ messages, input, setInput, isLoading, handleSubmit, stop, onClose }) {
  const bottomRef = useRef(null);

  // Auto-scroll to the latest message on every update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '88px',
        right: '20px',
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        height: '520px',
        maxHeight: 'calc(100vh - 120px)',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-card), var(--shadow-gold)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-2)',
          background: 'var(--bg-3)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--gold)',
              boxShadow: '0 0 6px var(--gold)',
            }}
          />
          <span
            style={{
              color: 'var(--gold)',
              fontWeight: '700',
              fontSize: '15px',
              letterSpacing: '0.02em',
            }}
          >
            SubDz AI
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '20px',
            lineHeight: '1',
            padding: '2px 6px',
            borderRadius: '6px',
          }}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              textAlign: 'center',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '32px' }}>✦</div>
            <p style={{ fontSize: '14px', lineHeight: '1.5', maxWidth: '220px' }}>
              Ask me about your subscriptions, budget, or anything Algerian telecom.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          borderTop: '1px solid var(--border-2)',
          background: 'var(--bg-3)',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your subscriptions…"
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'var(--bg-4)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '9px 14px',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-4)',
              color: 'var(--red)',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Stop"
          >
            ■
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: input.trim() ? 'var(--gold)' : 'var(--bg-4)',
              color: input.trim() ? 'var(--bg)' : 'var(--text-muted)',
              cursor: input.trim() ? 'pointer' : 'default',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            aria-label="Send"
          >
            ↑
          </button>
        )}
      </form>
    </div>
  );
}
