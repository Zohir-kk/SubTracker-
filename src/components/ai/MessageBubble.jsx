export function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-2.5">
        <div className="max-w-[80%] px-3.5 py-2.5 rounded-[16px_16px_4px_16px] bg-gold-dim border border-border text-text font-plex text-xs leading-relaxed break-words">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-2.5">
      {/* Avatar dot */}
      <div className="w-[26px] h-[26px] rounded-full bg-gold shrink-0 me-2 mt-0.5 flex items-center justify-center text-[10px] font-bold text-[#020d0d] font-plex">
        AI
      </div>
      <div className="max-w-[80%] px-3.5 py-2.5 rounded-[4px_16px_16px_16px] bg-bg-3 border border-border-2 text-text font-plex text-xs leading-relaxed break-words whitespace-pre-wrap">
        {message.content || (
          // Blinking cursor while streaming
          <span className="inline-block w-2 h-3.5 bg-gold rounded-sm animate-pulse" />
        )}
      </div>
    </div>
  );
}
