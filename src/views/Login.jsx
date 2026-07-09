import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import logo from '../assets/logo.png';
console.log(logo);
const Login = () => {
  const { loginAdmin, authLoading, authError } = useAdmin();
  const [username, setUsername] = useState('admin@vlm.com');
  const [password, setPassword] = useState('AdminPassword123');
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="glass-input"
            />
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

        <div className="login-hints">
          <p>Demo Credentials:</p>
          <code>Username: admin@vlm.com | Password: AdminPassword123</code>
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
          max-width: 420px;
          padding: 5px;
          z-index: 5;
          border-radius: 14px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.55);
        }

        .login-header {
          text-align: center;
          margin-bottom: 0px;
        }
.login-logo{
  width:120px;
  height:120px;

  display:flex;
  justify-content:center;
  align-items:center;

  margin:0 auto 20px;

  background:none;
  border:none;
  box-shadow:none;
}

.login-logo img{
  width:100%;
  height:100%;
  object-fit:contain;
  display:block;
}

        .login-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
          background: linear-gradient(to right, #fff, var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1.4;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
.login-btn {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 14px 20px;
  margin-top: 20px;

  font-size: 16px;
  font-weight: 600;
}

.login-btn svg {
  position: absolute;
  right: 20px;
  width: 18px;
  height: 18px;
}

        .login-hints {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid var(--panel-border);
          text-align: center;
        }

        .login-hints p {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-hints code {
          font-size: 11px;
          background: rgba(10, 15, 24, 0.5);
          border: 1px solid var(--panel-border);
          padding: 6px 10px;
          display: block;
          color: var(--text-secondary);
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
