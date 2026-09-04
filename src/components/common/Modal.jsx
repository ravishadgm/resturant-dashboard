import { AlertTriangle, X } from 'lucide-react';
export function Modal({ open, title, children, onClose, size = '' }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`modal ${size}`} onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20}/></button></header>{children}</section></div>;
}
export function ConfirmDialog({ open, name, onClose, onConfirm }) {
  return <Modal open={open} title="Delete record?" onClose={onClose}><div className="confirm-body"><span className="warning-icon"><AlertTriangle/></span><p><strong>This action can’t be undone.</strong><br/>“{name}” will be permanently removed.</p></div><footer className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn destructive" onClick={onConfirm}>Delete record</button></footer></Modal>;
}

