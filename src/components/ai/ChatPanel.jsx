import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { useLanguage } from '../../providers/LanguageProvider.jsx';

export function ChatPanel({ messages, input, setInput, isLoading, handleSubmit, stop, onClose }) {
  const { t } = useLanguage();
  const bottomRef = useRef(null);

  // Auto-scroll to the latest message on every update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-[88px] end-5 w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-120px)] bg-bg-2 border border-border rounded-[20px] shadow-card shadow-gold flex flex-col overflow-hidden z-[240]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-2 bg-bg-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_6px_var(--gold)]" />
          <span className="text-gold font-bold text-sm tracking-wide font-plex">
            SubDz AI
          </span>
        </div>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-text-faint cursor-pointer text-xl leading-none px-1.5 py-0.5 rounded hover:text-text"
          aria-label={t('ai.chat.close')}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-center gap-2.5">
            <div className="text-3xl text-gold">✦</div>
            <p className="text-xs leading-relaxed max-w-[240px] font-plex">
              {t('ai.chat.welcome')}
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
        className="flex items-center gap-2 p-3 border-t border-border-2 bg-bg-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ai.chat.placeholder')}
          disabled={isLoading}
          className="flex-1 bg-bg border border-border rounded-xl px-3.5 py-2 text-text font-plex text-xs outline-none focus:border-gold placeholder:text-text-faint"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="w-9 h-9 rounded-xl border border-border bg-bg-4 text-red cursor-pointer text-sm flex items-center justify-center shrink-0"
            aria-label={t('ai.chat.stop')}
          >
            ■
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={`w-9 h-9 rounded-xl border-none text-sm flex items-center justify-center shrink-0 transition-colors duration-150 font-bold ${
              input.trim()
                ? "bg-gold text-[#020d0d] cursor-pointer"
                : "bg-bg-4 text-text-faint cursor-default"
            }`}
            aria-label={t('ai.chat.send')}
          >
            ↑
          </button>
        )}
      </form>
    </div>
  );
}
