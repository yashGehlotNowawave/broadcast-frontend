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
  const matchNumber = matchSummary?.match_number || matchSummary?.id || matchData?.match_id || 1;
  const venue = matchSummary?.venue_name || 'Kanteerva Indoor Stadium';
  const rawPhase = matchData?.game_phase || matchSummary?.session?.game_phase || matchSummary?.status || 'second_half';

  const teamAName = matchData?.team_a?.team_name || matchSummary?.team_a_placeholder || 'Delhi Capitals';
  const teamBName = matchData?.team_b?.team_name || matchSummary?.team_b_placeholder || 'New Zealand National';

  const teamAScore = matchData?.team_a?.score ?? matchSummary?.final_team_a_score ?? matchSummary?.session?.total_team_a_score ?? 35;
  const teamBScore = matchData?.team_b?.score ?? matchSummary?.final_team_b_score ?? matchSummary?.session?.total_team_b_score ?? 27;

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

  let summaryText = matchData?.update_message || '';
  if (!summaryText || summaryText.includes('undefined')) {
    if (rawPhase === 'five_raids' || fiveRaidsA > 0 || fiveRaidsB > 0) {
      const winner = fiveRaidsA > fiveRaidsB ? teamAName : (fiveRaidsB > fiveRaidsA ? teamBName : 'Tied');
      summaryText = `${teamAName} tied with ${teamBName} (${teamAScore}-${teamBScore}) (${winner} wins Five Raids ${fiveRaidsA > fiveRaidsB ? `${fiveRaidsA}-${fiveRaidsB}` : `${fiveRaidsB}-${fiveRaidsA}`})`;
    } else if (matchData?.last_raid) {
      const lr = matchData.last_raid;
      summaryText = `${lr.raider_name || 'Raider'} scored ${lr.points_scored} Pt. in last Raid.`;
    } else if (isCompleted) {
      if (teamAScore === teamBScore) {
        summaryText = `Match Tied (${teamAScore}-${teamBScore})`;
      } else {
        const winner = teamAScore > teamBScore ? teamAName : teamBName;
        const diff = Math.abs(teamAScore - teamBScore);
        summaryText = `${winner} won by ${diff} points (${teamAScore}-${teamBScore})`;
      }
    } else {
      summaryText = `${isTeamARaiding ? teamAName : teamBName} scores 1Pt. in last Raid.`;
    }
  }

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

              {(rawPhase === 'five_raids' || fiveRaidsA > 0 || fiveRaidsB > 0) ? (
                <div className="tiebreaker-badge">
                  <span className="tb-label">5R</span>
                  <span className="tb-value">Tiebreak</span>
                </div>
              ) : (
                <span className="score-divider">:</span>
              )}

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

          {/* Accent Box / Event summary callout */}
          <div className="match-summary-banner">
            <span>{summaryText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};