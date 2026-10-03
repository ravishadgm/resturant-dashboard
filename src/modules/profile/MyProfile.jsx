import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Save, UserRound } from 'lucide-react';
import { profileApi, PROFILE_FIELDS, profileImageUrl } from '../../api/profileApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../../components/common/Avatar';
import FormField from '../../components/common/FormField';
import PageHeader from '../../components/common/PageHeader';

const fields = [
  ['name', 'Restaurant name', 'text'], ['email', 'Email address', 'email'],
  ['phone', 'Phone number', 'tel'], ['address', 'Address', 'text'],
  ['latitude', 'Latitude', 'number'], ['longitude', 'Longitude', 'number'],
  ['description', 'Description', 'textarea'],
];
const unwrap = response => {
  if (response?.success === false) throw new Error(response.message || 'Unable to load profile.');
  const data = response?.data ?? response;
  if (!data || typeof data !== 'object' || !('user_id' in data || 'name' in data)) throw new Error('The server returned an invalid profile.');
  return data;
};

export default function MyProfile() {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoError, setLogoError] = useState('');
  const fileInput = useRef(null);
  const applyProfile = data => {
    setProfile(data);
    setForm(Object.fromEntries(PROFILE_FIELDS.map(field => [field, data[field] ?? ''])));
    setLogo(null); setLogoError('');
    if (fileInput.current) fileInput.current.value = '';
    updateUser({ ...data, image: profileImageUrl(data.logo) });
  };
  const load = async () => {
    setLoading(true); setError('');
    try { applyProfile(unwrap(await profileApi.get())); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    profileApi.get().then(response => { if (active) applyProfile(unwrap(response)); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!logo) { setPreview(''); return; }
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);
  const selectLogo = event => {
    const file = event.target.files[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setLogoError('Choose a PNG, JPG, or WebP image up to 2 MB.');
      event.target.value = ''; return;
    }
    setLogoError(''); setLogo(file);
  };
  const save = async event => {
    event.preventDefault();
    if (saving || logoError) return;
    setSaving(true); setError('');
    let submitted = false;
    try {
      const response = await profileApi.update(form, logo);
      if (response?.success === false) throw new Error(response.message || 'Unable to update profile.');
      submitted = true;
      const persisted = unwrap(await profileApi.get());
      const ignored = PROFILE_FIELDS.filter(field => String(persisted[field] ?? '') !== String(form[field] ?? '') &&
        !(['latitude', 'longitude'].includes(field) && form[field] !== '' && persisted[field] != null && Number(persisted[field]) === Number(form[field])));
      applyProfile(persisted);
      if (ignored.length) setError(`The server did not save these fields: ${ignored.join(', ')}. Please check the profile API's supported update fields.`);
      else toast('Profile updated successfully');
    } catch (err) { setError(submitted ? `Update submitted, but the saved profile could not be verified. ${err.message}` : err.message); }
    finally { setSaving(false); }
  };
  return <>
    <PageHeader eyebrow="ACCOUNT" title="My Profile" description="View and update your restaurant profile." />
    {error && <div className="profile-error" role="alert">{error}{!profile && <button className="btn secondary" onClick={load} disabled={loading}>Try again</button>}</div>}
    {loading ? <div className="panel profile-loading" role="status">Loading your profile...</div> : profile && <>
      <div className="profile-layout profile-layout-single">
        <form className="panel profile-form" onSubmit={save}>
          <header><span><UserRound /></span><div><h2>Profile details</h2><p>Keep your restaurant information up to date.</p></div></header>
          <fieldset disabled={saving} className="profile-fields">
            <div className="image-upload"><Avatar name={form.name} image={preview || profileImageUrl(profile.logo)} size={72} /><div><label className="upload-button"><ImagePlus size={17} /> Upload logo<input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectLogo} /></label>{logo && <button type="button" className="text-button" onClick={() => { setLogo(null); setLogoError(''); fileInput.current.value = ''; }}>Cancel new logo</button>}<p>PNG, JPG, or WebP, up to 2 MB.</p>{logoError && <small className="error-text" role="alert">{logoError}</small>}</div></div>
            <div className="form-grid">{fields.map(([name, label, type]) => <FormField key={name} name={name} label={label} required={['name', 'email', 'phone'].includes(name)} as={type === 'textarea' ? 'textarea' : 'input'} type={type === 'textarea' ? undefined : type} rows={type === 'textarea' ? 4 : undefined} step={type === 'number' ? 'any' : undefined} min={name === 'latitude' ? -90 : name === 'longitude' ? -180 : undefined} max={name === 'latitude' ? 90 : name === 'longitude' ? 180 : undefined} value={form[name]} onChange={event => setForm(current => ({ ...current, [name]: event.target.value }))} />)}</div>
          </fieldset>
          <footer><button className="btn secondary" type="button" disabled={saving} onClick={() => { applyProfile(profile); setError(''); }}>Reset</button><button className="btn primary" disabled={saving || !!logoError}><Save size={16} />{saving ? 'Saving...' : 'Save changes'}</button></footer>
        </form>
      </div>
    </>}
  </>;
}
