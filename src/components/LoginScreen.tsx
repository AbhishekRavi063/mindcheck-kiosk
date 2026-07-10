import { useState } from 'react';
import { loginWithPhonePassword } from '../firebase';

interface LoginScreenProps {
  isDarkMode?: boolean;
  onLoggedIn?: () => void;
}

// Patient login. The clinic creates the account (phone + password) at the Kiosk
// during the first visit and hands the credentials to the patient. The session
// persists, so this is normally only seen once (or after an explicit logout).
export function LoginScreen({ isDarkMode = false, onLoggedIn }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!phone.trim() || !password) {
      setError('Enter your phone number and password.');
      return;
    }
    setBusy(true);
    try {
      await loginWithPhonePassword(phone.trim(), password);
      onLoggedIn?.();
    } catch {
      setError('Incorrect phone number or password. If you forgot it, contact your clinic.');
    } finally {
      setBusy(false);
    }
  };

  const bg = isDarkMode ? '#1a1410' : '#ece5de';
  const card = isDarkMode ? '#241c16' : '#ffffff';
  const text = isDarkMode ? '#ece5de' : '#1a1410';
  const muted = isDarkMode ? '#a89a8c' : '#6b5d4f';
  const border = isDarkMode ? '#3a2f26' : '#d8ccbe';

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 360, background: card, borderRadius: 16,
        padding: 28, border: `1px solid ${border}` }}>
        <h1 style={{ color: text, fontSize: 22, fontWeight: 500, margin: '0 0 4px' }}>
          Welcome to MindCheck
        </h1>
        <p style={{ color: muted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.5 }}>
          Log in with the phone number and password your clinic gave you.
        </p>

        <label style={{ color: muted, fontSize: 13, display: 'block', marginBottom: 6 }}>
          Phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9891234567"
          autoComplete="username"
          style={{ width: '100%', padding: '12px 14px', marginBottom: 16, borderRadius: 10,
            border: `1px solid ${border}`, background: bg, color: text, fontSize: 15, boxSizing: 'border-box' }}
        />

        <label style={{ color: muted, fontSize: 13, display: 'block', marginBottom: 6 }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
          placeholder="Password"
          autoComplete="current-password"
          style={{ width: '100%', padding: '12px 14px', marginBottom: 8, borderRadius: 10,
            border: `1px solid ${border}`, background: bg, color: text, fontSize: 15, boxSizing: 'border-box' }}
        />

        {error && (
          <p style={{ color: '#c0392b', fontSize: 13, margin: '8px 0 0', lineHeight: 1.4 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={busy}
          style={{ width: '100%', marginTop: 20, padding: '13px', borderRadius: 10, border: 'none',
            background: busy ? muted : '#1a1410', color: '#ece5de', fontSize: 15, fontWeight: 500,
            cursor: busy ? 'default' : 'pointer' }}
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        <p style={{ color: muted, fontSize: 12, margin: '18px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
          Forgot your password? Please contact your clinic — they can reset it for you.
        </p>
      </div>
    </div>
  );
}
