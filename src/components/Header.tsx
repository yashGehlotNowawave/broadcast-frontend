import React from 'react';
import { Settings } from 'lucide-react';

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
      <div className="navbar-inner">
        <div className="brand-logo" onClick={() => onNavigate('tournaments')} role="button" tabIndex={0}>
          <div className="brand-mark">P</div>
          <span className="brand-wordmark">
            PKL <b>BROADCAST</b>
          </span>
          <span className="brand-badge">
            <span className="rec-dot" />
            LIVE
          </span>
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
              className={`nav-link ${activeView === 'matches' || activeView === 'match_detail' ? 'active' : ''}`}
              onClick={() => onNavigate('matches')}
              title={selectedTournamentName}
            >
              <span className="nav-link-truncate">{selectedTournamentName}</span>
            </button>
          )}

          <div className="status-indicator" title={isConnected ? 'Socket Live' : 'Socket Offline'}>
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span>{isConnected ? 'Socket Live' : 'Offline'}</span>
          </div>

          <button className="icon-button" onClick={onOpenConfig} title="API & Auth Config" aria-label="Settings">
            <Settings size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
};