import React from 'react';
import { Tv, Settings } from 'lucide-react';

interface HeaderProps {
  activeView: 'tournaments' | 'matches' | 'match_detail';
  selectedTournamentName?: string;
  onNavigate: (view: 'tournaments' | 'matches') => void;
  isConnected: boolean;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  selectedTournamentName,
  onNavigate,
  isConnected,
  onOpenConfig
}) => {
  return (
    <header className="navbar">
      <div className="brand-logo" onClick={() => onNavigate('tournaments')} style={{ cursor: 'pointer' }}>
        <Tv style={{ color: '#ffc800' }} size={28} />
        <span>PKL <span style={{ color: '#ff6000' }}>BROADCAST</span></span>
        <span className="brand-badge">LIVE</span>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-link ${activeView === 'tournaments' ? 'active' : ''}`}
          onClick={() => onNavigate('tournaments')}
        >
          Tournaments
        </button>

        {selectedTournamentName && (
          <button
            className={`nav-link ${activeView === 'matches' ? 'active' : ''}`}
            onClick={() => onNavigate('matches')}
          >
            {selectedTournamentName} Matches
          </button>
        )}

        <div className="status-indicator">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>{isConnected ? 'LIVE SOCKET' : 'OFFLINE'}</span>
        </div>

        <button className="nav-link" onClick={onOpenConfig} title="API & Auth Config">
          <Settings size={18} />
        </button>
      </nav>
    </header>
  );
};
