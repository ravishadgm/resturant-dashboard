import { useEffect, useState } from 'react';
import FormField from './FormField';
import ImageUpload from './ImageUpload';
import { validateEntity } from '../../utils/validation';
export default function EntityForm({ initial, fields, onSubmit, onCancel, submitLabel='Save record' }) {
  const blank=Object.fromEntries(fields.map(f=>[f.name,''])); const [values,setValues]=useState({...blank,...initial}); const [errors,setErrors]=useState({});
  useEffect(()=>setValues({...blank,...initial}),[initial]); const change=e=>{setValues({...values,[e.target.name]:e.target.value});setErrors({...errors,[e.target.name]:''})};
  const submit=e=>{e.preventDefault();const next=validateEntity(values,fields);setErrors(next);if(!Object.keys(next).length)onSubmit(values)};
  const hasImage=fields.some(f=>f.name==='image');
  return <form className="entity-form" onSubmit={submit}>{hasImage&&<div className="form-intro"><ImageUpload name={values.name} value={values.image} error={errors.image} onChange={(image,error)=>{setValues({...values,image});setErrors({...errors,image:error})}}/></div>}<div className="form-grid">{fields.filter(f=>f.name!=='image').map(f=><FormField key={f.name} {...f} required={f.required!==false} value={values[f.name]??''} onChange={change} placeholder={f.placeholder} as={f.as||'input'} rows={f.as==='textarea'?3:undefined} error={errors[f.name]}/>)}</div><footer className="modal-actions form-actions"><button type="button" className="btn secondary" onClick={onCancel}>Cancel</button><button className="btn primary">{submitLabel}</button></footer></form>;
}
