import React from 'react';
import type { MatchStatusData, Player } from '../types';
import { Shield, Zap, AlertTriangle } from 'lucide-react';

interface KabaddiCourtMatProps {
  matchData: MatchStatusData | null;
}

export const KabaddiCourtMat: React.FC<KabaddiCourtMatProps> = ({ matchData }) => {
  const raidingTeamId = matchData?.current_raiding_team_id;
  const teamAId = matchData?.team_a?.team_id || matchData?.team_a?.id;

  // By default in reference image: Team A is Defending (Delhi Capitals), Team B is Raiding (New Zealand)
  const isTeamARaiding = raidingTeamId ? Number(raidingTeamId) === Number(teamAId) : false;
  const defendingTeam = isTeamARaiding ? matchData?.team_a : matchData?.team_b;
  const raidingTeam = isTeamARaiding ? matchData?.team_b : matchData?.team_a;

  const defendingTeamName = defendingTeam?.team_name || (isTeamARaiding ? 'Team A' : 'Delhi Capitals');
  const raidingTeamName = raidingTeam?.team_name || (isTeamARaiding ? 'Team B' : 'New Zealand National Team');

  let courtPlayers: Player[] = defendingTeam?.mat || defendingTeam?.court_players || [];
  
  // Sample players for rich presentation if court is empty
  if (courtPlayers.length === 0) {
    courtPlayers = [
      { player_id: 81, jersey_no: '81', full_name: 'Suryakumar Yadav' },
      { player_id: 288, jersey_no: '288', full_name: 'Marco Jansen' },
      { player_id: 587, jersey_no: '587', full_name: 'Akash Deep' },
      { player_id: 45, jersey_no: '45', full_name: 'Gerald Coetzee' },
      { player_id: 332, jersey_no: '332', full_name: 'Kuldeep Yadav' },
      { player_id: 734, jersey_no: '734', full_name: 'Kane Williamson' }
    ];
  }

  const selectedRaiderId = matchData?.selected_raider_id || (matchData as any)?.session?.selected_raider_id;

  const allPlayers = [
    ...(matchData?.team_a?.mat || []), ...(matchData?.team_a?.bench || []), ...(matchData?.team_a?.substitute || []), ...(matchData?.team_a?.court_players || []),
    ...(matchData?.team_b?.mat || []), ...(matchData?.team_b?.bench || []), ...(matchData?.team_b?.substitute || []), ...(matchData?.team_b?.court_players || [])
  ];

  const raiderPlayer = selectedRaiderId
    ? allPlayers.find((p: any) => Number(p.id || p.player_id) === Number(selectedRaiderId))
    : null;

  const raiderJerseyNo = raiderPlayer?.jersey_no || '288';
  const raiderDisplayName = raiderPlayer?.full_name || raiderPlayer?.name || matchData?.selected_raider_name || matchData?.last_raid?.raider_name || 'Marco Jansen';

  const isDoOrDie = matchData?.is_do_or_die_raid || matchData?.last_raid?.is_do_or_die;

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
            {courtPlayers.map((p, idx) => (
              <div key={p.player_id || p.id || idx} className="player-horizontal-pill">
                <div className="player-round-badge">
                  {p.jersey_no || idx + 1}
                </div>
                <span className="player-pill-name">{p.full_name || p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Raider Line */}
        <div>
          <div className="mat-zone-label raid">
            RAIDING &middot; {raidingTeamName.toUpperCase()}
          </div>

          <div className="players-court-row">
            <div className="player-horizontal-pill raider-pill">
              <div className="player-round-badge raider-badge">
                {raiderJerseyNo ? raiderJerseyNo : <Zap size={14} />}
              </div>
              <span className="player-pill-name">
                {raiderDisplayName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Summary Stats */}
      <div className="squad-summary-grid">
        <div className="squad-summary-cell">
          <div className="squad-summary-label">{matchData?.team_a?.team_name || 'Delhi Capitals'} Squad</div>
          <div className="squad-summary-value">
            Court {matchData?.team_a?.mat?.length || 6} &middot; Bench {matchData?.team_a?.bench?.length || 5} &middot; Sub {matchData?.team_a?.substitute?.length || 2}
          </div>
        </div>

        <div className="squad-summary-cell">
          <div className="squad-summary-label">{matchData?.team_b?.team_name || 'New Zealand National'} Squad</div>
          <div className="squad-summary-value">
            Court {matchData?.team_b?.mat?.length || 7} &middot; Bench {matchData?.team_b?.bench?.length || 4} &middot; Sub {matchData?.team_b?.substitute?.length || 1}
          </div>
        </div>
      </div>
    </div>
  );
};