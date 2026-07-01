import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function UserBadge() {
  const { displayName, isGuest, logOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogOut = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="user-badge">
      <span className="who">{isGuest ? 'Signed in as Guest' : `Signed in as ${displayName}`}</span>
      <button className="logout" onClick={handleLogOut} type="button" disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out…' : 'Log Out'}
      </button>
    </div>
  );
}
