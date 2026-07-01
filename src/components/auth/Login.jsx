import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

function authErrorMessage(err) {
  const code = err?.code || '';
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'incorrect email or password';
  if (code.includes('user-not-found')) return 'no account with that email';
  if (code.includes('email-already-in-use')) return 'an account already exists for that email';
  if (code.includes('weak-password')) return 'password should be at least 6 characters';
  if (code.includes('popup-closed-by-user')) return 'sign-in was cancelled';
  return 'something went wrong — please try again';
}

export default function Login() {
  const { signInEmail, signUpEmail, signInGoogle, signInGuest } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setBusy(true);
    try {
      await signInGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGuest() {
    setError('');
    setBusy(true);
    try {
      await signInGuest();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="screen active" id="screen-login">
      <div className="auth-screen">
        <div className="auth-tabs tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            className={'tab' + (mode === 'signin' ? ' active' : '')}
            onClick={() => setMode('signin')}
          >
            Log In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={'tab' + (mode === 'signup' ? ' active' : '')}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="btn-row">
            <button className="btn" type="submit" disabled={busy}>
              {mode === 'signin' ? 'Log In' : 'Create Account'}
            </button>
          </div>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-divider">or</div>

        <div className="btn-row">
          <button className="btn ghost" onClick={handleGoogle} disabled={busy} type="button">Continue with Google</button>
          <button className="btn ghost" onClick={handleGuest} disabled={busy} type="button">Continue as Guest</button>
        </div>

        <p className="auth-guest-note">
          Guests can use the booth right away — nothing is saved to an account.
        </p>
      </div>
    </section>
  );
}
