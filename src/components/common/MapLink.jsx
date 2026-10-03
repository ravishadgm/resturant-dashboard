import { ExternalLink } from 'lucide-react';

export default function MapLink({ value }) {
  if (!value) return <span>-</span>;
  const text = String(value);
  let href = '';
  try {
    const url = new URL(text);
    if (['http:', 'https:'].includes(url.protocol)) href = url.href;
  } catch { /* Display invalid URLs as plain text. */ }
  return <span className="map-link-cell">
    {href ? <a className="map-link-text" href={href} target="_blank" rel="noopener noreferrer" title={text}>{text}</a> : <span className="map-link-text" title={text}>{text}</span>}
    {href && <a className="map-link-action" href={href} target="_blank" rel="noopener noreferrer" aria-label="Open location in maps" title="Open location"><ExternalLink size={15}/></a>}
  </span>;
}
