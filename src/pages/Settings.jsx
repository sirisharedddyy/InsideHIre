import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import '../styles/settings.css';

const Settings = () => {
  const { currentUser, userProfile, saveProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // profile, security, email
  const fileInputRef = useRef(null);

  // ── Profile State ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ name: '', enrollment: '', branch: '', batch: '', degree: '', linkedin: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '', enrollment: userProfile.enrollment || '',
        branch: userProfile.branch || '', batch: userProfile.batch || '',
        degree: userProfile.degree || '', linkedin: userProfile.linkedin || ''
      });
    }
  }, [userProfile]);

  const handleProfileChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSave = async () => {
    if (!currentUser) return;
    setIsSaving(true); setSuccessMsg('');
    try {
      await saveProfile(currentUser.uid, formData);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { alert('Failed to save settings: ' + err.message); } 
    finally { setIsSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    
    // Basic validation
    if (file.size > 5 * 1024 * 1024) return alert('File is too large. Max 5MB.');
    if (!file.type.startsWith('image/')) return alert('Must be an image file.');

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateProfile(currentUser, { photoURL: url });
      await saveProfile(currentUser.uid, { photoURL: url });
      
      setSuccessMsg('Profile Photo updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Security State ────────────────────────────────────────────────────────
  const [secCurrentPassword, setSecCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secMsg, setSecMsg] = useState({ text: '', type: '' });
  const [isSecSaving, setIsSecSaving] = useState(false);

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSecMsg({ text: '', type: '' });
    if (!secCurrentPassword || !newPassword) return setSecMsg({ text: 'All fields are required.', type: 'error' });
    if (newPassword.length < 6) return setSecMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
    
    setIsSecSaving(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, secCurrentPassword);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, newPassword);
      setSecMsg({ text: 'Password successfully updated.', type: 'success' });
      setSecCurrentPassword(''); setNewPassword('');
    } catch (err) {
      setSecMsg({ text: err.message, type: 'error' });
    } finally {
      setIsSecSaving(false);
    }
  };

  // ── Email State ───────────────────────────────────────────────────────────
  const [emCurrentPassword, setEmCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emMsg, setEmMsg] = useState({ text: '', type: '' });
  const [isEmSaving, setIsEmSaving] = useState(false);

  const handleEmailSave = async (e) => {
    e.preventDefault();
    setEmMsg({ text: '', type: '' });
    if (!emCurrentPassword || !newEmail) return setEmMsg({ text: 'All fields are required.', type: 'error' });

    setIsEmSaving(true);
    try {
      const cred = EmailAuthProvider.credential(currentUser.email, emCurrentPassword);
      await reauthenticateWithCredential(currentUser, cred);
      await updateEmail(currentUser, newEmail);
      
      // Update in database too
      await saveProfile(currentUser.uid, { email: newEmail });
      
      setEmMsg({ text: 'Email successfully updated.', type: 'success' });
      setEmCurrentPassword(''); setNewEmail('');
    } catch (err) {
      setEmMsg({ text: err.message, type: 'error' });
    } finally {
      setIsEmSaving(false);
    }
  };

  if (!currentUser) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  const displayName = userProfile?.name || currentUser.displayName || 'User';
  const avatarUrl = userProfile?.photoURL || currentUser.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="settings-layout">
        
        {/* Sidebar Nav */}
        <aside className="settings-nav">
          <div className="settings-nav-section">
            <span className="settings-nav-label">Account</span>
            <a href="#about" className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}><i className="fa-regular fa-user"></i> Profile Info</a>
            
            {/* Third-party providers often block standard password/email resets, but for MVP we expose it */}
            <a href="#security" className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('security'); }}><i className="fa-solid fa-lock"></i> Password & Security</a>
            <a href="#email" className={`settings-nav-item ${activeTab === 'email' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('email'); }}><i className="fa-regular fa-envelope"></i> Email</a>
          </div>
          <div className="settings-nav-section">
            <span className="settings-nav-label">Preferences</span>
            <a href="#appearance" className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('appearance'); }}><i className="fa-solid fa-palette"></i> Appearance</a>
          </div>
        </aside>

        <div className="settings-content">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <section className="settings-section fade-in">
              <h2 className="settings-section-title">Profile Information</h2>
              <p className="settings-section-desc">Update your personal information as it appears on your profile to others.</p>

              <div className="settings-avatar-row">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/png, image/jpeg, image/gif" 
                  style={{ display: 'none' }} 
                  onChange={handlePhotoUpload} 
                />
                
                {avatarUrl ? (
                  <img src={avatarUrl} className="settings-avatar" alt="Avatar" style={{ opacity: uploadingImage ? 0.4 : 1 }} />
                ) : (
                  <div className="settings-avatar" style={{
                    background: 'var(--primary-color)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '2rem', opacity: uploadingImage ? 0.4 : 1
                  }}>
                    {initials}
                  </div>
                )}
                <div>
                  <button className="btn btn-primary btn-sm-settings" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                    {uploadingImage ? 'Uploading...' : 'Change Photo'}
                  </button>
                  <p className="settings-hint">JPG, PNG or GIF &middot; Max 5MB</p>
                </div>
              </div>

              <div className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" name="name" value={formData.name} onChange={handleProfileChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Enrollment Number</label>
                    <input type="text" className="form-input" name="enrollment" value={formData.enrollment} onChange={handleProfileChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Branch / Department</label>
                    <select className="form-input" name="branch" value={formData.branch} onChange={handleProfileChange} style={{ appearance: 'auto' }}>
                      <option value="" disabled>Select Branch</option>
                      <option value="cse">Computer Science</option>
                      <option value="it">Information Tech</option>
                      <option value="ece">Electronics</option>
                      <option value="me">Mechanical</option>
                      <option value="ce">Civil</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Batch / Class Year</label>
                    <select className="form-input" name="batch" value={formData.batch} onChange={handleProfileChange} style={{ appearance: 'auto' }}>
                      <option value="" disabled>Select Year</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Degree</label>
                  <select className="form-input" name="degree" value={formData.degree} onChange={handleProfileChange} style={{ appearance: 'auto' }}>
                    <option value="" disabled>Select Degree</option>
                    <option value="btech">B.Tech</option>
                    <option value="mtech">M.Tech</option>
                    <option value="bca">BCA</option>
                    <option value="mca">MCA</option>
                    <option value="bsc">B.Sc</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">LinkedIn URL</label>
                  <input type="url" className="form-input" name="linkedin" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedin} onChange={handleProfileChange} />
                </div>
                
                {successMsg && <p style={{ color: '#10B981', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}><i className="fa-solid fa-circle-check"></i> {successMsg}</p>}
                
                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={handleProfileSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <section className="settings-section fade-in">
              <h2 className="settings-section-title">Password & Security</h2>
              <p className="settings-section-desc">Change your account password securely.</p>
              
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', color: '#B45309', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-circle-info"></i> If you originally registered using Google Sign-In, resetting passwords here may be restricted by your provider.
              </div>

              <form className="settings-form" onSubmit={handlePasswordSave}>
                <div className="form-group full-width">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" placeholder="Verify current password" value={secCurrentPassword} onChange={e => setSecCurrentPassword(e.target.value)} />
                </div>
                <div className="form-group full-width" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="New strong password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>

                {secMsg.text && (
                  <p style={{ color: secMsg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 500, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <i className={`fa-solid ${secMsg.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i> {secMsg.text}
                  </p>
                )}

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={isSecSaving}>{isSecSaving ? 'Updating...' : 'Update Password'}</button>
                </div>
              </form>
            </section>
          )}

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <section className="settings-section fade-in">
              <h2 className="settings-section-title">Email Address</h2>
              <p className="settings-section-desc">Transfer your account to a new email. Must verify current password.</p>

              <div style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Current Email: <strong>{currentUser.email}</strong>
              </div>

              <form className="settings-form" onSubmit={handleEmailSave}>
                <div className="form-group full-width">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" placeholder="Verify password for security" value={emCurrentPassword} onChange={e => setEmCurrentPassword(e.target.value)} />
                </div>
                <div className="form-group full-width" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">New Email Address</label>
                  <input type="email" className="form-input" placeholder="new.email@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                </div>

                {emMsg.text && (
                  <p style={{ color: emMsg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 500, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <i className={`fa-solid ${emMsg.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i> {emMsg.text}
                  </p>
                )}

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={isEmSaving}>{isEmSaving ? 'Syncing...' : 'Change Email'}</button>
                </div>
              </form>
            </section>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <section className="settings-section fade-in">
              <h2 className="settings-section-title">Appearance</h2>
              <p className="settings-section-desc">Customize how InsideHire looks for you.</p>
              <div className="theme-options">
                <div className="theme-option selected-theme" onClick={() => { document.body.classList.remove('dark-theme'); localStorage.setItem('theme', 'light'); }}>
                  <div className="theme-preview light-preview">
                    <div className="tp-sidebar"></div>
                    <div className="tp-content"><div className="tp-card"></div><div className="tp-card"></div></div>
                  </div>
                  <span className="theme-label"><i className="fa-regular fa-sun"></i> Light</span>
                </div>
                <div className="theme-option" onClick={() => { document.body.classList.add('dark-theme'); localStorage.setItem('theme', 'dark'); }}>
                  <div className="theme-preview dark-preview">
                    <div className="tp-sidebar dark"></div>
                    <div className="tp-content dark"><div className="tp-card dark"></div><div className="tp-card dark"></div></div>
                  </div>
                  <span className="theme-label"><i className="fa-regular fa-moon"></i> Dark</span>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
