import { ImagePlus, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
export default function ImageUpload({ value, name, onChange, error }) {
  const select = e => { const file = e.target.files[0]; if (!file) return; if (!file.type.startsWith('image/')) return onChange('', 'Please select an image file'); if (file.size > 2*1024*1024) return onChange('', 'Image must be under 2 MB'); const reader = new FileReader(); reader.onload = () => onChange(reader.result, ''); reader.readAsDataURL(file); };
  return <div className="image-upload"><Avatar name={name} image={value} size={72}/><div><label className="upload-button"><ImagePlus size={17}/> Upload photo<input type="file" accept="image/*" onChange={select}/></label>{value && <button type="button" className="text-button danger" onClick={() => onChange('', '')}><Trash2 size={15}/> Remove</button>}<p>PNG or JPG, up to 2 MB.</p>{error && <small className="error-text">{error}</small>}</div></div>;
}

