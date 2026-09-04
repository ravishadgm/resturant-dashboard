export default function FormField({ label, name, error, required, as = 'input', ...props }) {
  const Tag = as;
  return <label className={`field ${error ? 'field-error' : ''}`}><span>{label}{required && <em>*</em>}</span><Tag name={name} aria-invalid={!!error} {...props}/>{error && <small>{error}</small>}</label>;
}

