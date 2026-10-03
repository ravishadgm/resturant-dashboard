import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function MapLink({ value }) {
  const toast = useToast();
  if (!value) return <span>-</span>;
  const text = String(value);
  let href = '';
  try {
    const url = new URL(text);
    if (['http:', 'https:'].includes(url.protocol)) href = url.href;
  } catch { /* Keep non-URL text available for copying. */ }
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        try {
          input.select();
          if (!document.execCommand('copy')) throw new Error('Copy failed');
        } finally { input.remove(); }
      }
      toast('Full map link copied');
    } catch { toast('Unable to copy. Open the map and copy the address from your browser.'); }
  };
  return <span className="map-link-cell">
    {href ? <a className="map-link-text" href={href} target="_blank" rel="noopener noreferrer" title={text}>{text}</a> : <span className="map-link-text" title={text}>{text}</span>}
    {href && <a className="map-link-action" href={href} target="_blank" rel="noopener noreferrer" aria-label="Open location in maps" title="Open location"><ExternalLink size={15}/></a>}
    <button type="button" className="map-link-action" onClick={copy} aria-label="Copy full map link" title="Copy full link"><Copy size={15}/></button>
  </span>;
}
