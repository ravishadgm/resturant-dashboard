import { useEffect, useRef, useState } from 'react';
import { Save, Store, UserRound } from 'lucide-react';
import { branchProfileApi } from '../../api/branchProfileApi';
import { BRANCH_PROFILE_FIELDS, branchProfileForm } from '../../utils/branchProfile';
import { API_BASE_URL } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import FormField from '../../components/common/FormField';
import Avatar from '../../components/common/Avatar';
import MapLink from '../../components/common/MapLink';

const unpack = response => {
  if (response?.success === false) throw new Error(response.message || 'Unable to load branch profile.');
  const data = response?.data ?? response;
  if (!data?.branch || typeof data.branch !== 'object') throw new Error('The server returned an invalid branch profile.');
  return data;
};
export default function BranchProfile() {
  const {updateUser} = useAuth();
  const toast = useToast();
  const [profile,setProfile] = useState(null);
  const [form,setForm] = useState({});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [attempt,setAttempt] = useState(0);
  const saveLock = useRef(false);
  const apply = data => {
    setProfile(data); setForm(branchProfileForm(data.branch));
    updateUser({name:data.branch.name,branch_name:data.branch.name,branch_id:data.branch.branch_id});
  };
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    branchProfileApi.get().then(response=>{if(active)apply(unpack(response));})
      .catch(err=>{if(active)setError(err.message);})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[attempt]);
  const save = async event => {
    event.preventDefault();
    if (saveLock.current) return;
    saveLock.current=true;setSaving(true);setError('');
    let submitted=false;
    try {
      const response=await branchProfileApi.update(form);
      if(response?.success===false)throw new Error(response.message||'Unable to update branch profile.');
      submitted=true;
      if(response?.data?.branch)apply({...profile,...unpack(response)});
      else apply(unpack(await branchProfileApi.get()));
      toast('Branch profile updated');
    } catch(err) {setError(submitted?`Update submitted, but the saved profile could not be loaded. ${err.message}`:err.message);}
    finally{saveLock.current=false;setSaving(false);}
  };
  const restaurant=profile?.restaurant;
  const logo=restaurant?.logo?new URL(restaurant.logo,`${API_BASE_URL}/`).href:'';
  return <>
    <PageHeader eyebrow="BRANCH OWNER" title="My Profile" description="Update your branch details and queue settings."/>
    {error&&<div className="profile-error" role="alert">{error}{!profile&&!loading&&<button className="btn secondary" onClick={()=>setAttempt(value=>value+1)}>Try again</button>}</div>}
    {loading?<div className="panel profile-loading" role="status">Loading branch profile...</div>:profile&&<div className="profile-layout">
      <form className="panel profile-form" onSubmit={save}>
        <header><span><UserRound/></span><div><h2>Branch details</h2><p>{profile.branch.restaurant_name||restaurant?.name}</p></div></header>
        <fieldset className="profile-fields" disabled={saving}><div className="form-grid">
          {BRANCH_PROFILE_FIELDS.map(field=><FormField key={field.name} {...field} type={field.type||'text'} value={form[field.name]} onChange={event=>setForm(current=>({...current,[field.name]:event.target.value}))}/>)}
          <label className="branch-profile-toggle"><input type="checkbox" checked={form.queue_enabled} onChange={event=>setForm(current=>({...current,queue_enabled:event.target.checked}))}/><span>Queue enabled</span></label>
        </div></fieldset>
        <div className="branch-profile-summary"><span className={`registry-status ${String(profile.branch.status).toLowerCase()}`}>{profile.branch.status||'-'}</span><span>Average dining: {profile.branch.avg_dining_minutes??'-'} minutes</span>{profile.branch.map_url&&<MapLink value={profile.branch.map_url}/>}</div>
        <footer><button type="button" className="btn secondary" disabled={saving} onClick={()=>{setForm(branchProfileForm(profile.branch));setError('');}}>Reset</button><button className="btn primary" disabled={saving}><Save size={16}/>{saving?'Saving...':'Save changes'}</button></footer>
      </form>
      {restaurant&&<section className="panel"><header><span><Store/></span><div><h2>Restaurant details</h2><p>Managed by your restaurant owner.</p></div></header><div className="branch-profile-restaurant"><Avatar name={restaurant.name} image={logo} size={64}/><strong>{restaurant.name}</strong></div><div className="registry-detail">{[['Email',restaurant.email],['Phone',restaurant.phone],['Address',restaurant.address],['Description',restaurant.description],['Status',restaurant.status]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value??'-'}</strong></div>)}</div></section>}
    </div>}
  </>;
}
