import React from 'react';
import type { MatchStatusData, MatchSummary } from '../types';
import { MapPin, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const venue = matchSummary?.venue_name || 'Indoor Stadium';
  const rawPhase = matchData?.game_phase || matchData?.session?.game_phase || matchSummary?.session?.game_phase || matchSummary?.status || 'first_half';

  const teamAName = matchData?.team_a?.team_name || matchData?.team_a?.name || matchSummary?.team_a_placeholder || 'Team A';
  const teamBName = matchData?.team_b?.team_name || matchData?.team_b?.name || matchSummary?.team_b_placeholder || 'Team B';

  const teamAScore = matchData?.team_a?.score ?? matchData?.team_a?.total_score ?? matchSummary?.final_team_a_score ?? matchSummary?.session?.total_team_a_score ?? 0;
  const teamBScore = matchData?.team_b?.score ?? matchData?.team_b?.total_score ?? matchSummary?.final_team_b_score ?? matchSummary?.session?.total_team_b_score ?? 0;

  const extraTimeA = matchData?.team_a?.extra_time_score ?? matchSummary?.session?.extra_time_team_a_score ?? 0;
  const extraTimeB = matchData?.team_b?.extra_time_score ?? matchSummary?.session?.extra_time_team_b_score ?? 0;

  const fiveRaidsA = matchData?.team_a?.five_raids_score ?? matchSummary?.session?.five_raids_team_a_score ?? 0;
  const fiveRaidsB = matchData?.team_b?.five_raids_score ?? matchSummary?.session?.five_raids_team_b_score ?? 0;

  const logoA = matchData?.team_a?.logo_url || matchSummary?.team1_logo || '';
  const logoB = matchData?.team_b?.logo_url || matchSummary?.team2_logo || '';

  const teamAId = matchData?.team_a?.team_id || matchData?.team_a?.id;
  const raidingTeamId = matchData?.current_raiding_team_id ?? matchData?.session?.current_raiding_team_id;
  const isCompleted = rawPhase.toLowerCase() === 'completed' || rawPhase.toLowerCase() === 'full_time' || rawPhase.toLowerCase() === 'match_completed';

  const isTeamAWinner = isCompleted && teamAScore > teamBScore;
  const isTeamBWinner = isCompleted && teamBScore > teamAScore;
  const isTie = isCompleted && teamAScore === teamBScore;
  const winningScoreDiff = Math.abs(teamAScore - teamBScore);
  const winningTeamName = isTeamAWinner ? teamAName : (isTeamBWinner ? teamBName : null);
  
  const isTeamARaiding = raidingTeamId && teamAId ? Number(raidingTeamId) === Number(teamAId) : false;
  const isTeamBRaiding = raidingTeamId && teamAId ? Number(raidingTeamId) !== Number(teamAId) : false;

  // Selected raider display name
  const selectedRaiderName = matchData?.selected_raider_name || matchData?.last_raid?.raider_name || null;

  // Firecrackers & celebration effect when completed match is opened
  React.useEffect(() => {
    if (!isCompleted) return;

    // Trigger star & confetti fireworks celebration
    const end = Date.now() + 3200; // 3.2 seconds duration
    const colors = ['#ffd700', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#ffffff'];

    // Left and right fireworks cannons
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      // Origin on winner's side if specific winner
      const leftX = isTeamBWinner ? 0.65 : 0.15;
      const rightX = isTeamAWinner ? 0.35 : 0.85;

      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: leftX, y: 0.65 },
        colors: colors,
        shapes: ['star', 'circle']
      });

      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: rightX, y: 0.65 },
        colors: colors,
        shapes: ['star', 'circle']
      });
    }, 120);

    // Initial big burst
    confetti({
      particleCount: 90,
      spread: 110,
      origin: { y: 0.45 },
      colors: ['#ffd700', '#f59e0b', '#ef4444', '#10b981', '#ffffff'],
      shapes: ['star']
    });

    const secondBurst = setTimeout(() => {
      confetti({
        particleCount: 110,
        spread: 130,
        origin: { y: 0.4 },
        colors: ['#ffd700', '#f59e0b', '#ef4444', '#3b82f6']
      });
    }, 600);

    return () => {
      clearInterval(interval);
      clearTimeout(secondBurst);
    };
  }, [isCompleted, matchNumber]);

  // Format Phase Label
  const formatPhaseLabel = (phase: string) => {
    const p = phase.toLowerCase();
    if (p === 'completed' || p === 'full_time' || p === 'match_completed') return 'COMPLETED';
    if (p === 'second_half' || p === 'second half') return '● SECOND HALF';
    if (p === 'first_half' || p === 'first half') return '● FIRST HALF';
    if (p === 'extra_time' || p === 'extra_time_first_half') return '● EXTRA TIME 1ST HALF';
    if (p === 'extra_time_second_half') return '● EXTRA TIME 2ND HALF';
    if (p === 'extra_time_half_time') return 'EXTRA TIME HALF TIME';
    if (p === 'half_time') return 'HALF TIME';
    if (p === 'five_raids') return '● FIVE RAIDS';
    if (p === 'golden_raid') return '● GOLDEN RAID';
    return `● ${phase.replace(/_/g, ' ').toUpperCase()}`;
  };

  const [imgErrorA, setImgErrorA] = React.useState(false);
  const [imgErrorB, setImgErrorB] = React.useState(false);

  React.useEffect(() => {
    setImgErrorA(false);
  }, [logoA]);

  React.useEffect(() => {
    setImgErrorB(false);
  }, [logoB]);

  const initialA = teamAName?.trim()?.charAt(0)?.toUpperCase() || 'A';
  const initialB = teamBName?.trim()?.charAt(0)?.toUpperCase() || 'B';

  return (
    <div>
      <button onClick={onBack} className="back-link">
        <ArrowLeft size={15} /> Back to Matches
      </button>

      <div className={`pkl-match-container ${isCompleted ? 'match-completed-container' : ''}`}>
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
            {/* Team A */}
            <div className={`team-block ${isTeamAWinner ? 'winner' : ''} ${isTeamARaiding ? 'raiding' : (isTeamBRaiding ? 'defending' : '')}`}>
              <div className="team-logo-container">
                {isTeamAWinner && (
                  <>
                    <div className="winner-crown-badge">🏆 WINNER</div>
                    <div className="winner-stars-container">
                      <span className="winner-star star-1">✨</span>
                      <span className="winner-star star-2">⭐</span>
                      <span className="winner-star star-3">🌟</span>
                      <span className="winner-star star-4">✨</span>
                    </div>
                  </>
                )}
                <div className="team-logo-wrapper">
                  {logoA && !imgErrorA ? (
                    <img
                      src={logoA}
                      alt={teamAName}
                      className="team-logo"
                      onError={() => setImgErrorA(true)}
                    />
                  ) : (
                    <div className="team-logo-initial">{initialA}</div>
                  )}
                </div>
              </div>
              <div className="team-name">{teamAName}</div>
              <span className={`team-role-tag ${isTeamAWinner ? 'winner' : (isTeamARaiding ? 'raid' : 'defend')}`}>
                {isTeamAWinner ? '🏆 WINNER' : (isTeamARaiding ? 'RAIDING' : (isTeamBRaiding ? 'DEFENDING' : 'COURT'))}
              </span>
            </div>

            {/* Score Center */}
            <div className="score-center-block">
              <div className="score-box">
                <span className="score-number">{teamAScore}</span>
                {extraTimeA > 0 && <span className="sub-score">ET: {extraTimeA}</span>}
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
                      : rawPhase === 'extra_time_first_half' || rawPhase === 'extra_time'
                      ? 'EXTRA TIME 1ST HALF'
                      : rawPhase === 'extra_time_second_half'
                      ? 'EXTRA TIME 2ND HALF'
                      : rawPhase.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {/* Dynamic Match Clock if provided by backend */}
                  {matchData?.clock || matchData?.remaining_time || matchData?.match_time ? (
                    <span className="score-clock-text">
                      {matchData.clock || matchData.remaining_time || matchData.match_time}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="score-box">
                <span className="score-number">{teamBScore}</span>
                {extraTimeB > 0 && <span className="sub-score">ET: {extraTimeB}</span>}
                {fiveRaidsB > 0 && <span className="sub-score">5R: {fiveRaidsB}</span>}
              </div>
            </div>

            {/* Team B */}
            <div className={`team-block ${isTeamBWinner ? 'winner' : ''} ${isTeamBRaiding ? 'raiding' : (isTeamARaiding ? 'defending' : '')}`}>
              <div className="team-logo-container">
                {isTeamBWinner && (
                  <>
                    <div className="winner-crown-badge">🏆 WINNER</div>
                    <div className="winner-stars-container">
                      <span className="winner-star star-1">✨</span>
                      <span className="winner-star star-2">⭐</span>
                      <span className="winner-star star-3">🌟</span>
                      <span className="winner-star star-4">✨</span>
                    </div>
                  </>
                )}
                <div className="team-logo-wrapper">
                  {logoB && !imgErrorB ? (
                    <img
                      src={logoB}
                      alt={teamBName}
                      className="team-logo"
                      onError={() => setImgErrorB(true)}
                    />
                  ) : (
                    <div className="team-logo-initial">{initialB}</div>
                  )}
                </div>
              </div>
              <div className="team-name">{teamBName}</div>
              <span className={`team-role-tag ${isTeamBWinner ? 'winner' : (isTeamBRaiding ? 'raid' : 'defend')}`}>
                {isTeamBWinner ? '🏆 WINNER' : (isTeamBRaiding ? 'RAIDING' : (isTeamARaiding ? 'DEFENDING' : 'COURT'))}
              </span>
            </div>
          </div>

          {/* Celebratory Winner Callout Banner OR Raider Selected Banner */}
          {isCompleted ? (
            <div className="match-summary-banner centered winner-banner">
              <div className="winner-callout-content">
                <span className="winner-trophy-icon">🏆</span>
                <span className="winner-callout-text">
                  {isTie
                    ? 'MATCH TIED'
                    : `${winningTeamName?.toUpperCase()} WON BY ${winningScoreDiff} ${winningScoreDiff === 1 ? 'POINT' : 'POINTS'}`}
                </span>
                <span className="winner-trophy-icon">🎉</span>
              </div>
            </div>
          ) : selectedRaiderName ? (
            <div className="match-summary-banner centered">
              <div className="raider-selected-banner">
                <span className="raider-selected-label">RAIDER SELECTED:</span>
                <span className="raider-selected-name">{selectedRaiderName.toUpperCase()}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
