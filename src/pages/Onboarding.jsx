import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { signup, saveProfile } = useAuth();

  // Step 1: account credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: profile details
  const [fullName, setFullName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1: Create Firebase account ──────────────────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await signup(email, password);
      setStep(2);
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Save profile to Firestore ─────────────────────────────────────
  const handleStep2 = async (e) => {
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
        linkedin,
        email: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try signing in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="onboarding-container">
        <div className="onboarding-card">

          {/* Left branding panel */}
          <div className="onboarding-left">
            <div className="onboarding-brand">
              <i className="fa-solid fa-chart-line logo-icon"></i>
              <span className="logo-text">InsideHire</span>
            </div>

            <h1 className="onboarding-title">
              {step === 1 ? 'Create Your Account' : 'Complete Your Profile'}
            </h1>
            <p className="onboarding-subtitle">
              Your career journey starts with the stories of those who walked it before you.
            </p>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              {[1, 2].map((s) => (
                <div
                  key={s}
                  style={{
                    height: '4px',
                    flex: 1,
                    borderRadius: '2px',
                    background: s <= step ? 'var(--primary-color)' : 'var(--border-color)',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              Step {step} of 2
            </p>

            <div className="illustration-container">
              <svg viewBox="0 0 400 300" className="onboarding-illustration" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="200" cy="250" rx="140" ry="25" fill="var(--hover-bg)" opacity="0.6" />
                <g transform="translate(140, 60)">
                  <path d="M 60 10 L 120 -10 L 180 10 L 120 30 Z" fill="var(--primary-color)" />
                  <path d="M 75 15 L 75 40 C 75 50, 165 50, 165 40 L 165 15" fill="var(--primary-hover)" />
                  <path d="M 120 10 L 170 25 L 170 50" stroke="#F59E0B" strokeWidth="3" fill="none" />
                  <circle cx="170" cy="55" r="4" fill="#F59E0B" />
                </g>
                <path d="M 100 250 L 130 180 C 140 150, 180 150, 190 130 L 220 110" stroke="var(--text-light)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,6" fill="none" />
                <circle cx="100" cy="250" r="8" fill="var(--text-main)" />
                <circle cx="220" cy="110" r="8" fill="var(--primary-color)" />
              </svg>
            </div>
          </div>

          {/* Right form panel */}
          <div className="onboarding-right">

            {/* ── STEP 1: Account creation ── */}
            {step === 1 && (
              <form className="onboarding-form" onSubmit={handleStep1} noValidate>

                {error && (
                  <div style={{
                    background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c',
                    borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '0.83rem',
                    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-container">
                    <i className="fa-regular fa-envelope input-icon"></i>
                    <input
                      type="email" id="reg-email" placeholder="you@college.edu"
                      value={email} onChange={(e) => setEmail(e.target.value)} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <div className="input-container">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input
                      type="password" id="reg-password" placeholder="Min. 6 characters"
                      value={password} onChange={(e) => setPassword(e.target.value)} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-confirm-password">Confirm Password</label>
                  <div className="input-container">
                    <i className="fa-solid fa-lock input-icon"></i>
                    <input
                      type="password" id="reg-confirm-password" placeholder="Repeat your password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Creating account…</>
                    : <>Continue <i className="fa-solid fa-arrow-right"></i></>
                  }
                </button>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign in
                  </Link>
                </p>
              </form>
            )}

            {/* ── STEP 2: Profile details ── */}
            {step === 2 && (
              <form className="onboarding-form" onSubmit={handleStep2}>

                {error && (
                  <div style={{
                    background: '#fff0f0', border: '1px solid #fca5a5', color: '#b91c1c',
                    borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '0.83rem',
                    marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <i className="fa-solid fa-circle-exclamation"></i> {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-container">
                    <i className="fa-regular fa-user input-icon"></i>
                    <input type="text" id="fullName" placeholder="e.g., Alex Johnson"
                      value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="enrollment">Enrollment Number</label>
                  <div className="input-container">
                    <i className="fa-regular fa-id-badge input-icon"></i>
                    <input type="text" id="enrollment" placeholder="e.g., BT22CS001"
                      value={enrollment} onChange={(e) => setEnrollment(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group form-row">
                  <div className="form-half">
                    <label htmlFor="degree">Degree</label>
                    <div className="input-container">
                      <i className="fa-solid fa-graduation-cap input-icon"></i>
                      <select id="degree" required value={degree} onChange={(e) => setDegree(e.target.value)}>
                        <option value="" disabled>Select Degree</option>
                        <option value="btech">B.Tech</option>
                        <option value="mtech">M.Tech</option>
                        <option value="bca">BCA</option>
                        <option value="mca">MCA</option>
                        <option value="bsc">B.Sc</option>
                      </select>
                      <i className="fa-solid fa-chevron-down select-arrow"></i>
                    </div>
                  </div>
                  <div className="form-half">
                    <label htmlFor="branch">Branch</label>
                    <div className="input-container">
                      <i className="fa-solid fa-code-branch input-icon"></i>
                      <select id="branch" required value={branch} onChange={(e) => setBranch(e.target.value)}>
                        <option value="" disabled>Select Branch</option>
                        <option value="cse">Computer Science</option>
                        <option value="it">Information Tech</option>
                        <option value="ece">Electronics</option>
                        <option value="me">Mechanical</option>
                        <option value="ce">Civil</option>
                      </select>
                      <i className="fa-solid fa-chevron-down select-arrow"></i>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="batch">Passing Out Batch Year</label>
                  <div className="input-container">
                    <i className="fa-regular fa-calendar input-icon"></i>
                    <select id="batch" required value={batch} onChange={(e) => setBatch(e.target.value)}>
                      <option value="" disabled>Select Year</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                    </select>
                    <i className="fa-solid fa-chevron-down select-arrow"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin">LinkedIn Profile <span>(Optional)</span></label>
                  <div className="input-container">
                    <i className="fa-brands fa-linkedin input-icon"></i>
                    <input type="url" id="linkedin" placeholder="https://linkedin.com/in/yourprofile"
                      value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving profile…</>
                    : <>Get Started <i className="fa-solid fa-rocket"></i></>
                  }
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
