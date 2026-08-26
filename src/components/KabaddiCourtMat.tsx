import React from 'react';
import type { MatchStatusData, Player } from '../types';
import { Shield, Zap, AlertTriangle } from 'lucide-react';

interface KabaddiCourtMatProps {
  matchData: MatchStatusData | null;
}

export const KabaddiCourtMat: React.FC<KabaddiCourtMatProps> = ({ matchData }) => {
  const raidingTeamId = matchData?.current_raiding_team_id ?? (matchData as any)?.session?.current_raiding_team_id;
  const teamAId = matchData?.team_a?.team_id || matchData?.team_a?.id;

  // Correctly identify raiding team vs defending team
  const isTeamARaiding = raidingTeamId && teamAId ? Number(raidingTeamId) === Number(teamAId) : false;
  const raidingTeam = isTeamARaiding ? matchData?.team_a : matchData?.team_b;
  const defendingTeam = isTeamARaiding ? matchData?.team_b : matchData?.team_a;

  const defendingTeamName = defendingTeam?.team_name || defendingTeam?.name || (isTeamARaiding ? 'Team B' : 'Team A');
  const raidingTeamName = raidingTeam?.team_name || raidingTeam?.name || (isTeamARaiding ? 'Team A' : 'Team B');

  const courtPlayers: Player[] = defendingTeam?.mat || defendingTeam?.court_players || [];

  const selectedRaiderId = matchData?.selected_raider_id || (matchData as any)?.session?.selected_raider_id;

  const allPlayers = [
    ...(matchData?.team_a?.mat || []), ...(matchData?.team_a?.bench || []), ...(matchData?.team_a?.substitute || []), ...(matchData?.team_a?.court_players || []),
    ...(matchData?.team_b?.mat || []), ...(matchData?.team_b?.bench || []), ...(matchData?.team_b?.substitute || []), ...(matchData?.team_b?.court_players || [])
  ];

  const raiderPlayer = selectedRaiderId
    ? allPlayers.find((p: any) => Number(p.id || p.player_id) === Number(selectedRaiderId))
    : null;

  const raiderJerseyNo = raiderPlayer?.jersey_no;
  const raiderDisplayName = raiderPlayer?.full_name || raiderPlayer?.name || matchData?.selected_raider_name || matchData?.last_raid?.raider_name || 'Active Raider';

  const isDoOrDie = matchData?.is_do_or_die_raid || matchData?.last_raid?.is_do_or_die;

  // Live tick for suspension countdowns
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSuspensionTime = (p: Player | null | undefined) => {
    if (!p) return null;
    if (p.suspension_remaining_seconds != null && p.suspension_remaining_seconds > 0) {
      const mins = Math.floor(p.suspension_remaining_seconds / 60);
      const secs = p.suspension_remaining_seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (p.suspended_until) {
      const diffMs = new Date(p.suspended_until).getTime() - Date.now();
      if (diffMs > 0) {
        const totalSec = Math.floor(diffMs / 1000);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }
    return null;
  };

  const raiderCardType = raiderPlayer?.card_type ? raiderPlayer.card_type.toLowerCase() : null;
  const raiderSuspTime = getSuspensionTime(raiderPlayer);

  return (
    <div className="court-section">
      <div className="court-header">
        <div className="court-title">
          <Shield size={19} className="court-title-icon" />
          <span>ON THE MAT</span>
        </div>

        {isDoOrDie && (
          <span className="do-or-die-flag">
            <AlertTriangle size={13} /> Do-Or-Die Raid
          </span>
        )}
      </div>

      <div className="kabaddi-mat">
        {/* Defending Team Court Players */}
        <div>
          <div className="mat-zone-label defend">
            DEFENDING &middot; {defendingTeamName.toUpperCase()} &middot; {courtPlayers.length} ON MAT
          </div>

          <div className="players-court-row">
            {courtPlayers.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                All Out / No players on court
              </div>
            ) : (
              courtPlayers.map((p, idx) => {
                const cardType = p.card_type ? p.card_type.toLowerCase() : null;
                const suspTime = getSuspensionTime(p);

                return (
                  <div key={p.player_id || p.id || idx} className="player-court-item">
                    <div className="player-horizontal-pill">
                      <div className="player-round-badge">
                        {p.jersey_no || idx + 1}
                        {cardType && (
                          <span
                            className={`player-card-flag ${cardType}`}
                            title={`${cardType.toUpperCase()} Card`}
                          />
                        )}
                      </div>
                      <span className="player-pill-name">{p.full_name || p.name}</span>
                    </div>
                    {suspTime && (
                      <div className="player-suspension-countdown">
                        {suspTime}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Raider Line */}
        <div>
          <div className="mat-zone-label raid">
            RAIDING &middot; {raidingTeamName.toUpperCase()}
          </div>

          <div className="players-court-row">
            <div className="player-court-item">
              <div className="player-horizontal-pill raider-pill">
                <div className="player-round-badge raider-badge">
                  {raiderJerseyNo ? raiderJerseyNo : <Zap size={14} />}
                  {raiderCardType && (
                    <span
                      className={`player-card-flag ${raiderCardType}`}
                      title={`${raiderCardType.toUpperCase()} Card`}
                    />
                  )}
                </div>
                <span className="player-pill-name">
                  {raiderDisplayName} {raiderJerseyNo ? `(#${raiderJerseyNo})` : ''}
                </span>
              </div>
              {raiderSuspTime && (
                <div className="player-suspension-countdown">
                  {raiderSuspTime}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Squad Summary Stats */}
      <div className="squad-summary-grid">
        <div className="squad-summary-cell">
          <div className="squad-summary-label">{matchData?.team_a?.team_name || matchData?.team_a?.name || 'Team A'} Squad</div>
          <div className="squad-summary-value">
            Court {matchData?.team_a?.mat?.length || 0} &middot; Bench {matchData?.team_a?.bench?.length || 0} &middot; Sub {matchData?.team_a?.substitute?.length || 0}
          </div>
        </div>

        <div className="squad-summary-cell">
          <div className="squad-summary-label">{matchData?.team_b?.team_name || matchData?.team_b?.name || 'Team B'} Squad</div>
          <div className="squad-summary-value">
            Court {matchData?.team_b?.mat?.length || 0} &middot; Bench {matchData?.team_b?.bench?.length || 0} &middot; Sub {matchData?.team_b?.substitute?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
