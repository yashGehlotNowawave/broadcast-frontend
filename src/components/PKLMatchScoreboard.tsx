import React from 'react';
import type { MatchStatusData, MatchSummary } from '../types';
import { MapPin } from 'lucide-react';

interface PKLMatchScoreboardProps {
  matchSummary: MatchSummary | null;
  matchData: MatchStatusData | null;
  onBack: () => void;
}

export const PKLMatchScoreboard: React.FC<PKLMatchScoreboardProps> = ({
  matchSummary,
  matchData,
  onBack
}) => {
  const matchNumber = matchSummary?.match_number || matchSummary?.id || matchData?.match_id || 1;
  const venue = matchSummary?.venue_name || 'Thyagaraj Indoor Stadium, Delhi';
  const gamePhase = matchData?.game_phase || matchSummary?.session?.game_phase || matchSummary?.status || 'completed';

  const teamAName = matchData?.team_a?.team_name || matchSummary?.team_a_placeholder || 'Team A';
  const teamBName = matchData?.team_b?.team_name || matchSummary?.team_b_placeholder || 'Team B';

  const teamAScore = matchData?.team_a?.score ?? matchSummary?.final_team_a_score ?? matchSummary?.session?.total_team_a_score ?? 0;
  const teamBScore = matchData?.team_b?.score ?? matchSummary?.final_team_b_score ?? matchSummary?.session?.total_team_b_score ?? 0;

  const fiveRaidsA = matchData?.team_a?.five_raids_score ?? matchSummary?.session?.five_raids_team_a_score ?? 0;
  const fiveRaidsB = matchData?.team_b?.five_raids_score ?? matchSummary?.session?.five_raids_team_b_score ?? 0;

  const logoA = matchData?.team_a?.logo_url || matchSummary?.team1_logo || 'https://via.placeholder.com/100?text=PUN';
  const logoB = matchData?.team_b?.logo_url || matchSummary?.team2_logo || 'https://via.placeholder.com/100?text=JAI';

  // Build summary message matching PKL screenshot format
  let summaryText = matchData?.update_message || '';
  if (!summaryText || summaryText.includes('undefined')) {
    if (gamePhase === 'five_raids' || fiveRaidsA > 0 || fiveRaidsB > 0) {
      const winner = fiveRaidsA > fiveRaidsB ? teamAName : (fiveRaidsB > fiveRaidsA ? teamBName : 'Tied');
      summaryText = `${teamAName} tied with ${teamBName} (${teamAScore}-${teamBScore}) (${winner} wins Five Raids ${fiveRaidsA > fiveRaidsB ? `${fiveRaidsA}-${fiveRaidsB}` : `${fiveRaidsB}-${fiveRaidsA}`})`;
    } else if (teamAScore === teamBScore) {
      summaryText = `Match Tied (${teamAScore}-${teamBScore})`;
    } else {
      const winner = teamAScore > teamBScore ? teamAName : teamBName;
      const diff = Math.abs(teamAScore - teamBScore);
      summaryText = `${winner} won by ${diff} points (${teamAScore}-${teamBScore})`;
    }
  }

  return (
    <div className="pkl-match-container">
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '1.2rem',
          left: '1.5rem',
          background: 'none',
          color: 'var(--accent-gold)',
          fontSize: '0.85rem',
          fontWeight: 700
        }}
      >
        ← Back to Matches
      </button>

      {/* Match Header Venue */}
      <div className="match-venue-header">
        <span>Match {matchNumber}</span> | <MapPin size={16} style={{ color: 'var(--accent-gold)' }} /> {venue}
      </div>

      <div style={{ textAlign: 'center' }}>
        <span className={`status-pill ${gamePhase === 'completed' ? 'completed' : 'live'}`}>
          {gamePhase === 'completed' ? 'Match Completed' : gamePhase.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Scoreboard Grid */}
      <div className="pkl-scoreboard-grid">
        {/* Team A */}
        <div className="team-block">
          <div className="team-logo-wrapper">
            <img
              src={logoA}
              alt={teamAName}
              className="team-logo"
              onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/100?text=TEAM+A'; }}
            />
          </div>
          <div className="team-name">{teamAName}</div>
        </div>

        {/* Score Center */}
        <div className="score-center-block">
          <div className="score-box">
            <span className="score-number">{teamAScore}</span>
            {fiveRaidsA > 0 && <span className="sub-score">{fiveRaidsA}</span>}
          </div>

          {(gamePhase === 'five_raids' || fiveRaidsA > 0 || fiveRaidsB > 0) && (
            <div className="tiebreaker-badge">
              <span className="tb-label">5R</span>
              <span className="tb-value">5 Raids</span>
            </div>
          )}

          <div className="score-box">
            <span className="score-number">{teamBScore}</span>
            {fiveRaidsB > 0 && <span className="sub-score">{fiveRaidsB}</span>}
          </div>
        </div>

        {/* Team B */}
        <div className="team-block">
          <div className="team-logo-wrapper">
            <img
              src={logoB}
              alt={teamBName}
              className="team-logo"
              onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/100?text=TEAM+B'; }}
            />
          </div>
          <div className="team-name">{teamBName}</div>
        </div>
      </div>

      {/* Match Summary Banner */}
      <div className="match-summary-banner">
        {summaryText}
      </div>
    </div>
  );
};
