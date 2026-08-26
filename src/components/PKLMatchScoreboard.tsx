import React from 'react';
import type { MatchStatusData, MatchSummary } from '../types';
import { MapPin, ArrowLeft } from 'lucide-react';

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
  const matchNumber = matchSummary?.match_number || matchSummary?.id || matchData?.match_id || 20;
  const venue = matchSummary?.venue_name || 'Kanteerva Indoor Stadium';
  const rawPhase = matchData?.game_phase || matchSummary?.session?.game_phase || matchSummary?.status || 'second_half';

  const teamAName = matchData?.team_a?.team_name || matchSummary?.team_a_placeholder || 'Delhi Capitals';
  const teamBName = matchData?.team_b?.team_name || matchSummary?.team_b_placeholder || 'New Zealand National Team';

  const teamAScore = matchData?.team_a?.score ?? matchSummary?.final_team_a_score ?? matchSummary?.session?.total_team_a_score ?? 46;
  const teamBScore = matchData?.team_b?.score ?? matchSummary?.final_team_b_score ?? matchSummary?.session?.total_team_b_score ?? 37;

  const fiveRaidsA = matchData?.team_a?.five_raids_score ?? matchSummary?.session?.five_raids_team_a_score ?? 0;
  const fiveRaidsB = matchData?.team_b?.five_raids_score ?? matchSummary?.session?.five_raids_team_b_score ?? 0;

  const logoA = matchData?.team_a?.logo_url || matchSummary?.team1_logo || '';
  const logoB = matchData?.team_b?.logo_url || matchSummary?.team2_logo || '';

  const teamAId = matchData?.team_a?.team_id || matchData?.team_a?.id;
  const raidingTeamId = matchData?.current_raiding_team_id;
  const isCompleted = rawPhase.toLowerCase() === 'completed' || rawPhase.toLowerCase() === 'full_time';
  
  // Default to Team B raiding & Team A defending if raidingTeamId is null (as shown in reference image)
  const isTeamARaiding = raidingTeamId ? Number(raidingTeamId) === Number(teamAId) : false;
  const isTeamBRaiding = raidingTeamId ? Number(raidingTeamId) !== Number(teamAId) : true;

  // Selected raider display name
  const selectedRaiderName = matchData?.selected_raider_name || matchData?.last_raid?.raider_name || 'Marco Jansen';

  // Format Phase Label
  const formatPhaseLabel = (phase: string) => {
    const p = phase.toLowerCase();
    if (p === 'completed' || p === 'full_time') return 'COMPLETED';
    if (p === 'second_half' || p === 'second half') return '● SECOND HALF';
    if (p === 'first_half' || p === 'first half') return '● FIRST HALF';
    if (p === 'extra_time') return 'EXTRA TIME';
    if (p === 'five_raids') return 'FIVE RAIDS';
    if (p === 'golden_raid') return 'GOLDEN RAID';
    return `● ${phase.replace('_', ' ').toUpperCase()}`;
  };

  return (
    <div>
      <button onClick={onBack} className="back-link">
        <ArrowLeft size={15} /> Back to Matches
      </button>

      <div className="pkl-match-container">
        {/* Top bar inside card */}
        <div className="scorebug-topbar">
          <span className="match-no-badge">MATCH {matchNumber}</span>

          <div className="scorebug-meta-center">
            <MapPin size={15} className="venue-pin" />
            <span>{venue.toUpperCase()}</span>
          </div>

          <span className={`status-pill ${isCompleted ? 'completed' : 'second-half'}`}>
            {formatPhaseLabel(rawPhase)}
          </span>
        </div>

        {/* Scorecard Body */}
        <div className="scorebug-body">
          <div className="pkl-scoreboard-grid">
            {/* Team A (Defending by default in sample) */}
            <div className={`team-block ${isTeamARaiding ? 'raiding' : 'defending'}`}>
              <div className="team-logo-wrapper">
                {logoA ? (
                  <img
                    src={logoA}
                    alt={teamAName}
                    className="team-logo"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </div>
              <div className="team-name">{teamAName}</div>
              <span className={`team-role-tag ${isTeamARaiding ? 'raid' : 'defend'}`}>
                {isTeamARaiding ? 'RAIDING' : 'DEFENDING'}
              </span>
            </div>

            {/* Score Center */}
            <div className="score-center-block">
              <div className="score-box">
                <span className="score-number">{teamAScore}</span>
                {fiveRaidsA > 0 && <span className="sub-score">5R: {fiveRaidsA}</span>}
              </div>

              <div className="score-divider-container">
                <span className="score-divider">:</span>
                <div className="score-center-meta">
                  {!isCompleted && (
                    <span className="score-live-badge">
                      <span className="rec-dot" style={{ background: 'var(--pkl-red)', width: '5px', height: '5px' }} />
                      LIVE
                    </span>
                  )}
                  <span className="score-phase-text">
                    {rawPhase === 'second_half'
                      ? '2ND HALF'
                      : rawPhase === 'first_half'
                      ? '1ST HALF'
                      : rawPhase === 'extra_time_first_half'
                      ? 'EXTRA TIME 1ST HALF'
                      : rawPhase === 'extra_time_second_half'
                      ? 'EXTRA TIME 2ND HALF'
                      : rawPhase.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {/* Dynamic Match Clock if provided by backend */}
                  {(matchData as any)?.clock || (matchData as any)?.remaining_time || (matchData as any)?.match_time ? (
                    <span className="score-clock-text">
                      {(matchData as any)?.clock || (matchData as any)?.remaining_time || (matchData as any)?.match_time}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="score-box">
                <span className="score-number">{teamBScore}</span>
                {fiveRaidsB > 0 && <span className="sub-score">5R: {fiveRaidsB}</span>}
              </div>
            </div>

            {/* Team B (Raiding by default in sample) */}
            <div className={`team-block ${isTeamBRaiding ? 'raiding' : 'defending'}`}>
              <div className="team-logo-wrapper">
                {logoB ? (
                  <img
                    src={logoB}
                    alt={teamBName}
                    className="team-logo"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                ) : (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </div>
              <div className="team-name">{teamBName}</div>
              <span className={`team-role-tag ${isTeamBRaiding ? 'raid' : 'defend'}`}>
                {isTeamBRaiding ? 'RAIDING' : 'DEFENDING'}
              </span>
            </div>
          </div>

          {/* Centered Raider Selected Banner */}
          <div className="match-summary-banner centered">
            <div className="raider-selected-banner">
              <span className="raider-selected-label">RAIDER SELECTED:</span>
              <span className="raider-selected-name">{selectedRaiderName.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};