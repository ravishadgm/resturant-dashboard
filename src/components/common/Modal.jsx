import { X } from 'lucide-react';

export function Modal({ open, title, children, onClose, size = '' }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={onClose}><section className={`modal ${size}`} onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20}/></button></header>{children}</section></div>;
}
