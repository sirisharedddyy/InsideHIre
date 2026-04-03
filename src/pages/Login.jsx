import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left branding panel */}
        <div className="login-left">
          <div className="login-brand">
            <i className="fa-solid fa-chart-line logo-icon"></i>
            <span className="logo-text">InsideHire</span>
          </div>
          <div className="login-left-content">
            <h2>Welcome Back</h2>
            <p>
              Read real interview experiences from students who've been through the process.
            </p>
            <ul className="login-features">
              <li>
                <i className="fa-solid fa-check"></i>
                Real stories from real interviews
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                Company-specific insights & tips
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                Contribute your own experience
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                Connect with your campus community
              </li>
            </ul>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <h1>Sign In</h1>
          <p className="login-subtitle">Enter your credentials to continue</p>

          {error && (
            <div className="login-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-container">
                <i className="fa-regular fa-envelope input-icon"></i>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-container" style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '1rem' }}
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn-block btn-primary"
              disabled={loading}
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Signing in…</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>
              )}
            </button>
          </form>

          <div className="divider">or</div>

          <button
            id="btn-google-login"
            className="btn-block btn-google"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Signing in…</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.562c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="login-switch">
            Don't have an account?{' '}
            <Link to="/onboarding">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
