import React from 'react';
import type { MatchSummary } from '../types';
import { Tv, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

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
      <div className="empty-state">
        <Tv size={44} style={{ color: 'var(--pkl-orange)' }} />
        <h2>Fetching Matches for {tournamentName}&hellip;</h2>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('five')) return 'status-pill five-raids';
    if (s.includes('golden')) return 'status-pill golden-raid';
    if (s.includes('extra')) return 'status-pill extra-time';
    if (s.includes('completed') || s.includes('full')) return 'status-pill completed';
    return 'status-pill live';
  };

  const formatStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') return 'MATCH COMPLETED';
    if (s === 'five_raids') return 'FIVE RAIDS';
    if (s === 'golden_raid') return 'GOLDEN RAID';
    if (s === 'extra_time') return 'EXTRA TIME';
    if (s === 'second_half') return 'SECOND HALF';
    if (s === 'first_half') return 'FIRST HALF';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div>
      <button onClick={onBack} className="back-link">
        <ArrowLeft size={15} /> Back to Tournaments
      </button>

      <div style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-heading">{tournamentName.toUpperCase()} - MATCHES</h1>
          <p className="page-subtext">Select a match to open the PKL Live Scoreboard &amp; Court View</p>
        </div>
        <span className="count-chip">{matches.length} MATCHES</span>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <h2>No Matches Scheduled Yet</h2>
          <p>Check back later or select a different tournament.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {matches.map((m, index) => {
            const teamAScore = m.final_team_a_score ?? m.session?.total_team_a_score ?? 0;
            const teamBScore = m.final_team_b_score ?? m.session?.total_team_b_score ?? 0;
            const rawStatus = m.session?.game_phase || m.status || 'MATCH COMPLETED';
            const matchNo = m.match_number || m.id || index + 1;

            return (
              <div
                key={m.id || m.external_fixture_id || index}
                className="card-item"
                onClick={() => onSelectMatch(m)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div className="card-header">
                    <span className="card-match-no">
                      Match #{matchNo}
                    </span>
                    <span className={getStatusBadgeClass(rawStatus)}>
                      {formatStatusLabel(rawStatus)}
                    </span>
                  </div>

                  <div className="match-card-score-row">
                    <div className="match-card-team">
                      <div className="match-card-team-name">{m.team_a_placeholder || 'Team A'}</div>
                      <div className="match-card-team-score">{teamAScore}</div>
                    </div>

                    <div className="match-card-vs">vs</div>

                    <div className="match-card-team">
                      <div className="match-card-team-name">{m.team_b_placeholder || 'Team B'}</div>
                      <div className="match-card-team-score">{teamBScore}</div>
                    </div>
                  </div>

                  <div className="card-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                    <span>{m.venue_name || 'Kanteerva Indoor Stadium'}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <span className="card-footer-label">
                    Open Live Scorecard
                  </span>
                  <ArrowRight size={16} className="card-footer-icon" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
