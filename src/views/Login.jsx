import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import logo from '../assets/logo.png';
console.log(logo);
const Login = () => {
  const { loginAdmin, authLoading, authError } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');



  useEffect(() => {
    if (authError) setLocalError(authError);
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const ok = await loginAdmin(username, password);

    if (!ok) {
      // authError already set by context; keep fallback
      setLocalError((prev) => prev || 'Login failed');
    }
  };


  return (
    <div className="login-page">
      <div className="login-background">
        <div className="bg-glow circle-1"></div>
        <div className="bg-glow circle-2"></div>
      </div>

      <div className="login-card glass-panel">
        <div className="login-header">
        <div className="login-logo">
    <img src={logo} alt="VLM Academy Logo" />
</div>
          <h2>VLM Academy</h2>
          <p>Admin Portal Dashboard Control</p>
        </div>

        {(localError || authError) && (
          <div className="error-banner">

            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{localError || authError}</span>

          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="glass-input"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input password-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-me-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert("Contact system administrator to reset password."); }}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className="glass-button login-btn" disabled={authLoading}>
            {authLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                Login
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>


        {/* Security Badge */}
        <div className="secure-badge">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secure Admin Portal • SSL Encrypted Session</span>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 10px;
          overflow: hidden;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.3;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          background: var(--student-color);
          top: -100px;
          left: -100px;
        }

        .circle-2 {
          width: 450px;
          height: 450px;
          background: var(--parent-color);
          bottom: -150px;
          right: -100px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 35px 40px;
          z-index: 5;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .login-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-logo {
          width: 90px;
          height: 90px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
          padding: 10px;
        }

        .login-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .login-header h2 {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 6px;
          background: linear-gradient(to right, #ffffff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .login-header p {
          font-size: 14px;
          color: var(--text-muted);
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.4;
          animation: shake 0.4s ease;
        }

        .error-banner svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
        }

        .password-input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper .glass-input {
          width: 100%;
          padding-right: 46px; /* Space for the toggle button */
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle-btn:hover {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
        }

        .password-toggle-btn svg {
          width: 20px;
          height: 20px;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-top: -4px;
        }

        .remember-me-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }

        .remember-me-checkbox {
          accent-color: var(--accent-blue);
          width: 15px;
          height: 15px;
          border-radius: 4px;
          cursor: pointer;
        }

        .forgot-password-link {
          color: var(--accent-blue);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .forgot-password-link:hover {
          color: #60a5fa;
          text-decoration: underline;
        }

        .login-btn {
          width: 100%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 14px 20px;
          margin-top: 10px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .login-btn svg {
          position: absolute;
          right: 20px;
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }

        .login-btn:hover:not(:disabled) svg {
          transform: translateX(4px);
        }
        .secure-badge {
          margin-top: 30px;
          border-top: 1px solid var(--panel-border);
          padding-top: 24px;
        }

        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          color: var(--text-muted);
          font-size: 11px;
          letter-spacing: 0.02em;
        }

        .secure-badge svg {
          color: var(--success-color);
          width: 14px;
          height: 14px;
        }

        /* Spinner style */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
