import React, { useState } from 'react';
import { getBaseUrl, setBaseUrl, getAuthToken, setAuthToken, login } from '../services/api';
import { X, Server, LogIn, Check } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-main)',
  outline: 'none',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 800,
  fontFamily: 'var(--font-head)',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  color: '#475569',
  display: 'block',
  marginBottom: '0.4rem'
};

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrlInput] = useState(getBaseUrl());
  const [token, setTokenInput] = useState(getAuthToken());
  const [email, setEmail] = useState('scorer@example.com');
  const [password, setPassword] = useState('password123');
  const [loginMsg, setLoginMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setBaseUrl(url);
    setAuthToken(token);
    onClose();
    window.location.reload();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginMsg('');
    try {
      const res = await login(email, password);
      setTokenInput(res.token);
      setLoginMsg('Logged in successfully. Token updated.');
    } catch (err: any) {
      setLoginMsg(`Login failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '480px',
          padding: '1.8rem',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <Server size={20} style={{ color: 'var(--pkl-orange)' }} /> API &amp; Socket Config
          </h3>
          <button onClick={onClose} style={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>Backend Base URL</label>
          <input type="text" value={url} onChange={(e) => setUrlInput(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={labelStyle}>Bearer Token (optional for REST APIs)</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste JWT token here..."
            style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
          />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '1.3rem 0' }} />

        <form onSubmit={handleLogin} style={{ marginBottom: '1.3rem' }}>
          <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--pkl-orange)', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <LogIn size={16} /> Quick Login
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.7rem' }}>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={inputStyle} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '8px',
              background: 'var(--pkl-orange-light)',
              color: 'var(--pkl-orange)',
              border: '1px solid var(--pkl-orange)',
              fontFamily: 'var(--font-head)',
              fontWeight: 800,
              fontSize: '0.88rem',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Logging in...' : 'Sign In & Get Token'}
          </button>

          {loginMsg && (
            <div style={{ fontSize: '0.82rem', marginTop: '0.6rem', fontWeight: 600, color: loginMsg.startsWith('Login failed') ? 'var(--pkl-red)' : 'var(--pkl-green)' }}>
              {loginMsg}
            </div>
          )}
        </form>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '10px',
            background: 'var(--pkl-orange)',
            color: '#ffffff',
            fontFamily: 'var(--font-head)',
            fontWeight: 800,
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(255, 85, 0, 0.3)',
            cursor: 'pointer'
          }}
        >
          <Check size={18} /> Save &amp; Apply
        </button>
      </div>
    </div>
  );
};