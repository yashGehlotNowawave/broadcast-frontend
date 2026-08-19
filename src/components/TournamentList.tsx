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
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <Trophy size={48} className="animate-spin" style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
        <h2>Loading Tournaments...</h2>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <Trophy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h2>No Active Tournaments Found</h2>
        <p style={{ marginTop: '0.5rem' }}>Make sure your backend server is running and auth settings are configured.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>PRO KABADDI TOURNAMENTS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select a tournament to view live match scoreboards</p>
        </div>
        <span className="brand-badge" style={{ fontSize: '0.85rem' }}>{tournaments.length} TOURNAMENTS</span>
      </div>

      <div className="cards-grid">
        {tournaments.map((t) => (
          <div key={t.id} className="card-item" onClick={() => onSelectTournament(t)}>
            <div>
              <div className="card-header">
                <span className="status-pill live" style={{ margin: 0 }}>
                  {t.status || t.source || 'ACTIVE'}
                </span>
                <Trophy size={22} style={{ color: 'var(--accent-gold)' }} />
              </div>

              <div className="card-title">{t.name}</div>
              <div className="card-subtext" style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} />
                <span>{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'Ongoing Season'}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>View Matches</span>
              <ArrowRight size={18} style={{ color: 'var(--accent-gold)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
