export default function Avatar({ name = '', image, size = 40 }) {
  const initials = name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  return image ? <img className="avatar" style={{width:size,height:size}} src={image} alt={name}/> : <span className="avatar avatar-fallback" style={{width:size,height:size,fontSize:size*.32}}>{initials || 'R'}</span>;
}

