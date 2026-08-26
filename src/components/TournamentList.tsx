import React from 'react';
import type { Tournament } from '../types';
import { Trophy, Calendar, ArrowRight } from 'lucide-react';

interface TournamentListProps {
  tournaments: Tournament[];
  onSelectTournament: (tournament: Tournament) => void;
  isLoading: boolean;
}

export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  onSelectTournament,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="empty-state">
        <Trophy size={44} style={{ color: 'var(--pkl-orange)' }} />
        <h2>Loading Tournaments&hellip;</h2>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="empty-state">
        <Trophy size={44} style={{ opacity: 0.3 }} />
        <h2>No Active Tournaments Found</h2>
        <p>Make sure your backend server is running and auth settings are configured.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-heading">Pro Kabaddi Tournaments</h1>
          <p className="page-subtext">Select a tournament to view live match scoreboards</p>
        </div>
        <span className="count-chip">{tournaments.length} TOURNAMENTS</span>
      </div>

      <div className="cards-grid">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="card-item"
            onClick={() => onSelectTournament(t)}
            role="button"
            tabIndex={0}
          >
            <div>
              <div className="card-header">
                <span className="status-pill live" style={{ margin: 0 }}>
                  {t.status || t.source || 'ACTIVE'}
                </span>
                <Trophy size={20} style={{ color: 'var(--pkl-amber)' }} />
              </div>

              <div className="card-title">{t.name}</div>

              <div className="card-subtext" style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                <span>{t.start_date ? new Date(t.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Ongoing Season'}</span>
              </div>
            </div>

            <div className="card-footer">
              <span className="card-footer-label">View Matches</span>
              <ArrowRight size={16} className="card-footer-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};