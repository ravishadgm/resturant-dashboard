import { createContext, useContext, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = message => { const id = Date.now(); setToasts(t => [...t, { id, message }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000); };
  return <ToastContext.Provider value={toast}>{children}<div className="toast-stack">{toasts.map(t => <div className="toast" key={t.id}><CheckCircle2 size={19}/><span>{t.message}</span><button onClick={() => setToasts(x => x.filter(i => i.id !== t.id))}><X size={16}/></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
