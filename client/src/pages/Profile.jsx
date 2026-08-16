import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(
  localStorage.getItem('profile_picture') || ''
);
  const [status, setStatus] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwStatus, setPwStatus] = useState(null);

  useEffect(() => {
    api.get('/auth/profile').then(res => setProfile(res.data));
  }, []);

  if (!profile) return <Loader />;

  const saveProfile = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const { data } = await api.put('/auth/profile', {
        fullName: profile.full_name, address: profile.address, email: profile.email
      });
      setProfile(data);
      setStatus({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setStatus({ type: 'danger', text: err.response?.data?.message || 'Update failed' });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    try {
      const { data } = await api.put('/auth/change-password', pwForm);
      setPwStatus({ type: 'success', text: data.message });
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwStatus({ type: 'danger', text: err.response?.data?.message || 'Failed to change password' });
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h1 className="mb-4">My Profile</h1>

      <form onSubmit={saveProfile} className="card p-4 shadow-sm border-0 mb-4">
        <h5 className="mb-3">Account Information</h5>
        <div className="text-center mb-4">

  <img
    src={
      preview ||
      'https://via.placeholder.com/120'
    }
    alt="Profile"
    className="rounded-circle border"
    style={{
      width: '120px',
      height: '120px',
      objectFit: 'cover'
    }}
  />

  <div className="mt-3">

    <input
      type="file"
      accept="image/*"
      className="form-control"
      onChange={(e) => {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onloadend = () => {
          localStorage.setItem(
            'profile_picture',
            reader.result
          );

          setPreview(reader.result);
        };

        reader.readAsDataURL(file);
      }}
    />

  </div>

</div>
        {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
        <div className="mb-3">
          <label className="form-label">User ID</label>
          <input className="form-control" value={profile.user_id} disabled />
        </div>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input className="form-control" value={profile.full_name}
            onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input className="form-control" value={profile.address || ''}
            onChange={e => setProfile({ ...profile, address: e.target.value })} />
        </div>
        <button className="btn btn-primary glow-btn">Save Changes</button>
      </form>

      <form onSubmit={changePassword} className="card p-4 shadow-sm border-0">
        <h5 className="mb-3">Change Password</h5>
        {pwStatus && <div className={`alert alert-${pwStatus.type}`}>{pwStatus.text}</div>}
        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input type="password" className="form-control" required value={pwForm.currentPassword}
            onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input type="password" className="form-control" required value={pwForm.newPassword}
            onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
        </div>
        <button className="btn btn-primary glow-btn">Update Password</button>
      </form>
    </div>
  );
}
