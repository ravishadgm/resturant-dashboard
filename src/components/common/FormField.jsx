import ResponsiveSelect from './ResponsiveSelect';
export default function FormField({ label, name, error, required, as = 'input', options, ...props }) {
  const Tag = as;
  return <label className={`field ${error ? 'field-error' : ''}`}><span>{label}{required && <em>*</em>}</span>{as==='select'?<ResponsiveSelect aria-label={label} required={required} name={name} aria-invalid={!!error} {...props}>{options?.map(option=><option key={option.value??option} value={option.value??option}>{option.label??option}</option>)}</ResponsiveSelect>:<Tag name={name} aria-invalid={!!error} {...props}/>} {error && <small>{error}</small>}</label>;
}
