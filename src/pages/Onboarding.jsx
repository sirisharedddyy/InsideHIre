import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { signup, saveProfile, currentUser, userProfile } = useAuth();

  // Wizard Steps:
  // 1 = Email Input
  // 2 = OTP Verification
  // 3 = Password Setup
  // 4 = Profile Details
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // 6 digit OTP string
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile Data
  const [fullName, setFullName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');

  // Auto-skip logic if Google Auth was used but profile is incomplete
  useEffect(() => {
    if (currentUser && userProfile) {
      if (!userProfile.enrollment || !userProfile.branch) {
        setStep(4);
        if (userProfile.name && !fullName) setFullName(userProfile.name);
      } else {
        navigate('/');
      }
    }
  }, [currentUser, userProfile, navigate, fullName]);

  // ── STEP 1: Enter Email ──
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError('Please enter a valid email address.');
    
    setLoading(true);
    // Simulate API call to backend to dispatch 6 digit email
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      // For development MVP, hardcoding valid OTP to 123456
      console.log(`[DEV MODE] OTP for ${email} is: 123456`);
    }, 1000);
  };

  // ── STEP 2: Verify OTP ──
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) return setError('Please enter the 6-digit code.');
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // HARDCODED VALIDATION FOR MVP. 
      // (In production, you hit a custom backend here)
      if (otp !== '123456') {
        return setError('Incorrect verification code. (Hint for MVP: use 123456)');
      }
      setStep(3);
    }, 800);
  };

  // ── STEP 3: Create Firebase Account ──
  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await signup(email, password);
      // successful firebase account creation! Now get their profile info.
      setStep(4);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in directly.');
      } else {
        setError('Failed to create account: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 4: Save Profile Details ──
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { auth } = await import('../firebase');
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('No authenticated user found.');

      await saveProfile(uid, {
        name: fullName,
        enrollment,
        degree,
        branch,
        batch,
        email: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to save your profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="onboarding-container">
        <div className="onboarding-card">

          {/* Left panel branding */}
          <div className="onboarding-left">
            <div className="onboarding-brand">
              <i className="fa-solid fa-chart-line logo-icon"></i><span className="logo-text">InsideHire</span>
            </div>
            <h1 className="onboarding-title">
              {step === 1 ? 'Verify Your Email' : step === 2 ? 'Security Check' : step === 3 ? 'Secure Account' : 'Complete Profile'}
            </h1>
            <p className="onboarding-subtitle">Your career journey starts with the stories of those who walked it before you.</p>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '2rem' }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ height: '4px', flex: 1, borderRadius: '2px', background: s <= step ? 'var(--primary-color)' : 'var(--border-color)', transition: 'background 0.3s' }} />
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Step {step} of 4</p>
          </div>

          <div className="onboarding-right" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-triangle-exclamation"></i> {error}
              </div>
            )}

            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <form className="onboarding-form fade-in" onSubmit={handleRequestOTP}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Enter Student Email</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>We'll send a 6-digit confirmation code to verify you.</p>
                
                <div className="form-group">
                  <div className="input-container">
                    <i className="fa-regular fa-envelope input-icon"></i>
                    <input type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Sending Code...</> : 'Send OTP Code'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Sign in here</Link>
                </p>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form className="onboarding-form fade-in" onSubmit={handleVerifyOTP}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Verify OTP</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter the 6-digit code sent to <strong>{email}</strong></p>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', maxWidth: '320px', height: '70px', fontSize: '2rem', textAlign: 'center', letterSpacing: '1.2rem', paddingLeft: '1.2rem', fontFamily: 'monospace', border: '2px solid var(--border-color)', borderRadius: '12px', background: 'var(--surface-color)', color: 'var(--text-main)', outline: 'none' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                      required
                      autoFocus
                      placeholder="------"
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Verifying...</> : 'Verify & Continue'}
                </button>
                <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', width: '100%', marginTop: '1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  Wrong email? Go back.
                </button>
              </form>
            )}

            {/* STEP 3: PASSWORD */}
            {step === 3 && (
              <form className="onboarding-form fade-in" onSubmit={handleCreatePassword}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Create Password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your email is verified. Secure your account.</p>

                <div className="form-group">
                  <div className="input-container" style={{ position: 'relative' }}>
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input type={showPassword ? "text" : "password"} placeholder="New Password (Min 6)" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '1rem' }}>
                      <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <div className="input-container">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Securing account...</> : 'Create Profile'}
                </button>
              </form>
            )}

            {/* STEP 4: PROFILE INFO */}
            {step === 4 && (
              <form className="onboarding-form fade-in" onSubmit={handleSaveProfile}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Final Profile Setup</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Tell us about your background at college.</p>

                <div className="form-group">
                  <div className="input-container"><i className="fa-regular fa-user input-icon"></i><input type="text" placeholder="Full Name (e.g. Alex Johnson)" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                </div>
                <div className="form-group">
                  <div className="input-container"><i className="fa-regular fa-id-badge input-icon"></i><input type="text" placeholder="Enrollment No. (e.g. BT22CS001)" value={enrollment} onChange={(e) => setEnrollment(e.target.value)} required /></div>
                </div>
                <div className="form-group form-row">
                  <div className="form-half">
                    <div className="input-container">
                      <select required value={degree} onChange={(e) => setDegree(e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--surface-color)', color:'var(--text-main)'}}>
                        <option value="" disabled>Degree</option><option value="btech">B.Tech</option><option value="mtech">M.Tech</option><option value="bca">BCA</option><option value="mca">MCA</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-half">
                    <div className="input-container">
                      <select required value={branch} onChange={(e) => setBranch(e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--surface-color)', color:'var(--text-main)'}}>
                        <option value="" disabled>Branch</option><option value="cse">CSE</option><option value="it">IT</option><option value="ece">ECE</option><option value="me">ME</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: '0.2rem' }}>
                    <select required value={batch} onChange={(e) => setBatch(e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--surface-color)', color:'var(--text-main)'}}>
                      <option value="" disabled>Passing Year (Batch)</option><option value="2024">2024</option><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '1rem' }}>
                  {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Launching...</> : 'Launch InsideHire'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
