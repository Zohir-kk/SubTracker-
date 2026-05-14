export function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <div
          style={{
            maxWidth: '78%',
            padding: '10px 14px',
            borderRadius: '16px 16px 4px 16px',
            background: 'var(--gold-dim)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: '14px',
            lineHeight: '1.55',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
      {/* Avatar dot */}
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'var(--gold)',
          flexShrink: 0,
          marginRight: '8px',
          marginTop: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: '700',
          color: 'var(--bg)',
        }}
      >
        AI
      </div>
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          borderRadius: '4px 16px 16px 16px',
          background: 'var(--bg-3)',
          border: '1px solid var(--border-2)',
          color: 'var(--text)',
          fontSize: '14px',
          lineHeight: '1.55',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message.content || (
          // Blinking cursor while streaming
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '14px',
              background: 'var(--gold)',
              borderRadius: '2px',
              animation: 'blink 1s step-end infinite',
            }}
          />
        )}
      </div>
    </div>
  );
}
