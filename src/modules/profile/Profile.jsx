import { useEffect, useState } from 'react';
import { Save, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormField from '../../components/common/FormField';
import ImageUpload from '../../components/common/ImageUpload';
import PageHeader from '../../components/common/PageHeader';
import { emailRegex, phoneRegex } from '../../utils/validation';
import { ROLE_LABELS } from '../../utils/constants';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState(user);
  const [errors, setErrors] = useState({});

  useEffect(() => setValues(user), [user]);

  const change = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const save = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Name is required';
    if (!emailRegex.test(values.email)) nextErrors.email = 'Enter a valid email';
    if (!phoneRegex.test(values.phone)) nextErrors.phone = 'Enter a valid phone';
    if (!values.password || values.password.length < 8) nextErrors.password = 'Password must have at least 8 characters';
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) {
      updateUser(values);
      toast('Profile updated successfully');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile settings" description="Manage your personal information and account security." />
     
      <form className="panel profile-form" onSubmit={save}>
        <header><span><UserRound /></span><div><h2>Personal information</h2><p>Update your profile and login information.</p></div></header>
        <ImageUpload name={values.name} value={values.image} onChange={(image, error) => { setValues({ ...values, image }); setErrors({ ...errors, image: error }); }} error={errors.image} />
        <div className="form-grid">
          <FormField label="Full name" name="name" value={values.name} onChange={change} error={errors.name} />
          <FormField label="Email address" name="email" type="email" value={values.email} onChange={change} error={errors.email} />
          <FormField label="Phone number" name="phone" value={values.phone} onChange={change} error={errors.phone} />
          <FormField label="Password" name="password" type="password" value={values.password} onChange={change} error={errors.password} autoComplete="new-password" />
          <label className="field"><span>Role</span><div className="readonly-field"><ShieldCheck />{ROLE_LABELS[user.role]}</div></label>
          <label className="field"><span>User ID</span><div className="readonly-field">{user.user_id || 'Assigned by API'}</div></label>
          {user.restaurant_id&&<label className="field"><span>Restaurant ID</span><div className="readonly-field">{user.restaurant_id}</div></label>}
          {user.branch_id&&<label className="field"><span>Assigned branch</span><div className="readonly-field">{user.branch_id}</div></label>}
          {user.manager_id&&<label className="field"><span>Manager ID</span><div className="readonly-field">{user.manager_id}</div></label>}
          {user.customer_id&&<label className="field"><span>Customer ID</span><div className="readonly-field">{user.customer_id}</div></label>}
          <label className="field"><span>Account status</span><div className="readonly-field">{user.status || 'ACTIVE'}</div></label>
          <label className="field"><span>Created at</span><div className="readonly-field">{user.created_at || 'Managed by API'}</div></label>
          <label className="field"><span>Updated at</span><div className="readonly-field">{user.updated_at || 'Managed by API'}</div></label>
        </div>
        <footer><button className="btn primary"><Save /> Save changes</button></footer>
      </form>
    </>
  );
}
