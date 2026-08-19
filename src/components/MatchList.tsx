import React from 'react';
import type { MatchSummary } from '../types';
import { Tv, MapPin, ArrowRight } from 'lucide-react';

interface MatchListProps {
  tournamentName: string;
  matches: MatchSummary[];
  onSelectMatch: (match: MatchSummary) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  tournamentName,
  matches,
  onSelectMatch,
  isLoading,
  onBack
}) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <Tv size={48} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
        <h2>Fetching Matches for {tournamentName}...</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              color: 'var(--accent-gold)',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            ← Back to Tournaments
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{tournamentName.toUpperCase()} - MATCHES</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select a match to open the PKL Live Scoreboard & Court View</p>
        </div>
        <span className="brand-badge" style={{ fontSize: '0.85rem' }}>{matches.length} MATCHES</span>
      </div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h2>No Matches Scheduled Yet</h2>
        </div>
      ) : (
        <div className="cards-grid">
          {matches.map((m) => {
            const teamAScore = m.final_team_a_score ?? m.session?.total_team_a_score ?? 0;
            const teamBScore = m.final_team_b_score ?? m.session?.total_team_b_score ?? 0;
            const statusLabel = m.session?.game_phase || m.status || 'UPCOMING';

            return (
              <div key={m.id || m.external_fixture_id} className="card-item" onClick={() => onSelectMatch(m)}>
                <div>
                  <div className="card-header">
                    <span className="card-subtext" style={{ fontWeight: 800, color: 'var(--accent-gold)' }}>
                      Match #{m.match_number || m.id}
                    </span>
                    <span className={`status-pill ${statusLabel === 'completed' ? 'completed' : 'live'}`}>
                      {statusLabel.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                        {m.team_a_placeholder}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-number)', color: 'var(--accent-gold)' }}>
                        {teamAScore}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-muted)' }}>VS</div>

                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                        {m.team_b_placeholder}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-number)', color: 'var(--accent-gold)' }}>
                        {teamBScore}
                      </div>
                    </div>
                  </div>

                  <div className="card-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <MapPin size={14} />
                    <span>{m.venue_name || 'Indoor Stadium'}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Open Live Scorecard</span>
                  <ArrowRight size={18} style={{ color: 'var(--accent-gold)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
