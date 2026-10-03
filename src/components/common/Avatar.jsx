import { useState } from 'react';

export default function Avatar({ name = '', image, size = 40 }) {
  const [failedImage, setFailedImage] = useState(null);
  const initials = (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return image && image !== failedImage
    ? <img className="avatar" style={{ width: size, height: size }} src={image} alt={name || 'Restaurant logo'} onError={() => setFailedImage(image)} />
    : <span className="avatar avatar-fallback" aria-label={name || 'Restaurant'} style={{ width: size, height: size, fontSize: size * .32 }}>{initials || 'R'}</span>;
}
