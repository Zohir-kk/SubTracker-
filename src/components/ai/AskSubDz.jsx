import { useState } from 'react';
import { useSubDzChat } from '@/hooks/useSubDzChat';
import { ChatPanel } from './ChatPanel';

export function AskSubDz() {
  const [open, setOpen] = useState(false);
  const chat = useSubDzChat();

  return (
    <>
      {/* Chat panel — only rendered when open */}
      {open && (
        <ChatPanel
          messages={chat.messages}
          input={chat.input}
          setInput={chat.setInput}
          isLoading={chat.isLoading}
          handleSubmit={chat.handleSubmit}
          stop={chat.stop}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--gold)',
          color: 'var(--bg)',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(45, 212, 191, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 51,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(45, 212, 191, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(45, 212, 191, 0.45)';
        }}
      >
        {open ? (
          // X icon when open
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          // Sparkle / chat icon when closed
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.06L2 22l4.94-1.37C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.67 0-3.22-.5-4.51-1.34l-.32-.2-3.32.92.92-3.32-.2-.32C3.5 15.22 3 13.67 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z"/>
            <path d="M8 11h8v1.5H8zM8 14h5v1.5H8z" opacity=".7"/>
          </svg>
        )}
      </button>
    </>
  );
}
