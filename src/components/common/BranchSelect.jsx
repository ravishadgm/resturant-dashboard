import ResponsiveSelect from './ResponsiveSelect';

export default function BranchSelect({ value, options, onChange, disabled }) {
  return <div className="field"><span>Branch</span>
    <ResponsiveSelect aria-label="Branch" value={value} onChange={onChange} disabled={disabled || !options.length}>
      {options.length ? options.map(option => <option key={option.value} value={option.value}>{option.label}</option>) : <option value="">No branches available</option>}
    </ResponsiveSelect>
  </div>;
}
