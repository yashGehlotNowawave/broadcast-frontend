import React, { useState } from 'react';
import { getBaseUrl, setBaseUrl, getAuthToken, setAuthToken, login } from '../services/api';
import { X, Server, LogIn, Check } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      setLoginMsg('✅ Logged in successfully! Token updated.');
    } catch (err: any) {
      setLoginMsg(`❌ Login failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: 'var(--bg-purple-card)',
          border: '1px solid var(--border-gold)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          padding: '1.5rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} style={{ color: 'var(--accent-gold)' }} /> API & Socket Configuration
          </h3>
          <button onClick={onClose} style={{ background: 'none', color: 'rgba(255,255,255,0.6)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            Backend Base URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            Bearer Token (Optional for REST APIs)
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste JWT token here..."
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '0.85rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1.2rem 0' }} />

        <form onSubmit={handleLogin} style={{ marginBottom: '1.2rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogIn size={16} /> Quick 1-Click Login
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              background: 'var(--accent-gold)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            {isLoading ? 'Logging in...' : 'Sign In & Get Token'}
          </button>

          {loginMsg && <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: loginMsg.includes('❌') ? '#ff3366' : '#00e676' }}>{loginMsg}</div>}
        </form>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '0.7rem',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #ff6000, #ff0055)',
              color: '#fff',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Check size={18} /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
