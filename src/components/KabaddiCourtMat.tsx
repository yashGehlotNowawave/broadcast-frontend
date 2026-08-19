import React from 'react';
import type { MatchStatusData, Player } from '../types';
import { Shield, Zap } from 'lucide-react';

interface KabaddiCourtMatProps {
  matchData: MatchStatusData | null;
}

export const KabaddiCourtMat: React.FC<KabaddiCourtMatProps> = ({ matchData }) => {
  const raidingTeamId = matchData?.current_raiding_team_id;
  const teamAId = matchData?.team_a?.team_id || matchData?.team_a?.id;

  const isTeamARaiding = Number(raidingTeamId) === Number(teamAId);
  const defendingTeam = isTeamARaiding ? matchData?.team_b : matchData?.team_a;
  const raidingTeam = isTeamARaiding ? matchData?.team_a : matchData?.team_b;

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

  return (
    <div className="court-section">
      <div className="court-header">
        <div className="court-title">
          <Shield style={{ color: 'var(--accent-gold)' }} size={20} />
          <span>ON THE MAT</span>
        </div>

        {isDoOrDie && (
          <span className="brand-badge" style={{ background: '#ff0055', animation: 'pulse-badge 1s infinite' }}>
            🚨 DO-OR-DIE RAID
          </span>
        )}
      </div>

      <div className="kabaddi-mat">
        <div className="mat-bonus-line" />
        <div className="mat-baulk-line" />
        <div className="mat-line-center" />

        {/* Defending Team Court Players */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            DEFENDING COURT ({defendingTeam?.team_name || 'Defenders'}) - {courtPlayers.length} ON MAT
          </div>

          <div className="players-court-row">
            {courtPlayers.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>No players on court</div>
            ) : (
              courtPlayers.map((p, idx) => (
                <div key={p.player_id || p.id || idx} className="player-horizontal-pill">
                  <div className="player-round-badge">
                    #{p.jersey_no || idx + 1}
                    {p.card_type && (
                      <span className="card-badge" style={{ background: p.card_type === 'red' ? '#ff3366' : '#ffc800' }}>
                        {p.card_type[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="player-pill-name">{p.full_name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Raider Line */}
        <div style={{ marginTop: '1.5rem', zIndex: 3, position: 'relative' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            RAIDING TEAM ({raidingTeam?.team_name || 'Raiders'})
          </div>

          <div className="players-court-row">
            <div className="player-horizontal-pill raider-pill">
              <div className="player-round-badge raider-badge">
                {raiderJerseyNo ? `#${raiderJerseyNo}` : <Zap size={15} />}
              </div>
              <span className="player-pill-name" style={{ color: '#fff', fontWeight: 800 }}>
                🏃💨 {raiderDisplayName} {raiderJerseyNo ? `(#${raiderJerseyNo})` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bench & Out Lists Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            {matchData?.team_a?.team_name || 'Team A'} SQUAD
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fff' }}>
            Court: {matchData?.team_a?.mat?.length || matchData?.team_a?.court_players?.length || 0} | Bench: {matchData?.team_a?.bench?.length || matchData?.team_a?.bench_players?.length || 0} | Substitute: {matchData?.team_a?.substitute?.length || matchData?.team_a?.out_players?.length || 0}
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            {matchData?.team_b?.team_name || 'Team B'} SQUAD
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fff' }}>
            Court: {matchData?.team_b?.mat?.length || matchData?.team_b?.court_players?.length || 0} | Bench: {matchData?.team_b?.bench?.length || matchData?.team_b?.bench_players?.length || 0} | Substitute: {matchData?.team_b?.substitute?.length || matchData?.team_b?.out_players?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
