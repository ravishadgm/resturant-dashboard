import { useEffect, useState } from 'react';
import FormField from './FormField';
import ImageUpload from './ImageUpload';
import { validateEntity } from '../../utils/validation';
export default function EntityForm({ initial, fields, onSubmit, onCancel, onFormChange, submitLabel='Save record', busy=false, formError='' }) {
  const blank=Object.fromEntries(fields.map(f=>[f.name,''])); const [values,setValues]=useState({...blank,...initial}); const [errors,setErrors]=useState({});
  useEffect(()=>setValues({...blank,...initial}),[initial]); const change=e=>{const value=e.target.files?.[0]||e.target.value;setValues({...values,[e.target.name]:value});setErrors({...errors,[e.target.name]:''});onFormChange?.()};
  const submit=e=>{e.preventDefault();if(busy)return;const next=validateEntity(values,fields);setErrors(next);if(!Object.keys(next).length)onSubmit(values)};
  const hasImage=fields.some(f=>f.name==='image');
  return <form className="entity-form" onSubmit={submit}>{formError&&<div className="login-error">{formError}</div>}{hasImage&&<div className="form-intro"><ImageUpload name={values.name} value={values.image} error={errors.image} onChange={(image,error)=>{setValues({...values,image});setErrors({...errors,image:error})}}/></div>}<div className="form-grid">{fields.filter(f=>f.name!=='image').map(f=><FormField key={f.name} {...f} required={f.required!==false} value={f.type==='file'?undefined:values[f.name]??''} onChange={change} placeholder={f.placeholder} as={f.as||'input'} rows={f.as==='textarea'?3:undefined} error={errors[f.name]}/>)}</div><footer className="modal-actions form-actions"><button type="button" className="btn secondary" onClick={onCancel} disabled={busy}>Cancel</button><button className="btn primary" disabled={busy}>{busy?'Saving...':submitLabel}</button></footer></form>;
}
