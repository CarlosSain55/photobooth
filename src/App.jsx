import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Marquee from './components/layout/Marquee.jsx';
import Login from './components/auth/Login.jsx';
import BoothApp from './BoothApp.jsx';

function Gate() {
  const { user, loading, isFirebaseConfigured } = useAuth();

  if (!isFirebaseConfigured) {
    return (
      <div className="wrap">
        <Marquee />
        <div className="auth-screen">
          <div className="ticket">
            <div className="label">setup needed</div>
            <p style={{ margin: 0, color: 'var(--ink-dim)' }}>
              This booth needs a Firebase project before anyone can log in or continue as a guest.
              Copy <code>.env.example</code> to <code>.env</code>, fill in your Firebase web app config,
              and enable the Email/Password, Google, and Anonymous sign-in providers — see README.md.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wrap">
        <Marquee />
        <div className="developing">
          <div className="display">warming up the booth…</div>
          <div className="tray"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap">
        <Marquee />
        <Login />
      </div>
    );
  }

  return <BoothApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
