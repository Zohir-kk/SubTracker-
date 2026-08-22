import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'success', message, duration = 3000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }) {
  const { type, message } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000); // safety fallback
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className="animate-in slide-in-from-right-5 fade-in duration-300 flex items-center gap-4 bg-bg-2 border border-border shadow-card rounded-xl px-5 py-4 min-w-[320px] max-w-[90vw] relative overflow-hidden">
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        type === 'success' ? 'bg-green' : type === 'error' ? 'bg-red' : 'bg-gold'
      )} />
      {type === 'success' && <CheckCircle2 size={22} className="text-green shrink-0" />}
      {type === 'error' && <AlertCircle size={22} className="text-red shrink-0" />}
      {type === 'info' && <Info size={22} className="text-gold shrink-0" />}
      
      <div className="font-plex text-sm text-text flex-1">
        {message}
      </div>
      
      <button onClick={onRemove} className="text-text-faint hover:text-text cursor-pointer shrink-0">
        <X size={18} />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
