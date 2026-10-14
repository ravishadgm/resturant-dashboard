import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export default function DeleteConfirmDialog({ open, name, entityLabel = 'record', onClose, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const cancelRef = useRef(null);
  useEffect(() => {
    if (open) { setError(''); cancelRef.current?.focus(); }
  }, [open, name]);
  useEffect(() => {
    if (!open) return;
    const escape = event => { if (event.key === 'Escape' && !lock.current) onClose(); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open, onClose]);
  const close = () => { if (!lock.current) onClose(); };
  const confirm = async () => {
    if (lock.current) return;
    if (!onDelete) { onClose(); return; }
    lock.current = true; setBusy(true); setError('');
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to delete. Please try again.');
    } finally {
      lock.current = false; setBusy(false);
    }
  };
  return <Modal open={open} title={'Delete ' + entityLabel + '?'} onClose={close}>
    <div className="confirm-body"><span className="warning-icon"><AlertTriangle/></span><p>Are you sure you want to delete this record?</p></div>
    {error && <div className="login-error" role="alert" style={{margin: '0 22px 18px'}}>{error}</div>}
    <footer className="modal-actions"><button ref={cancelRef} className="btn secondary" disabled={busy} onClick={close}>Cancel</button><button className="btn destructive" disabled={busy} onClick={confirm}>{busy ? 'Deleting...' : 'Delete ' + entityLabel}</button></footer>
  </Modal>;
}
