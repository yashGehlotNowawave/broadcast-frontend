import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Trophy,
  Users,
  RotateCw,
  Zap,
  Shield,
  Search,
  Award,
  Flame,
  Star
} from 'lucide-react';
import { fetchMatchStats } from '../services/api';
import { subscribeEvents } from '../services/socket';
import type { MatchStatsData } from '../types';
import { PlayerDetailModal, type PlayerDetailSource } from './PlayerDetailModal';
import { TeamLogo, PlayerAvatar } from './TeamLogo';

interface MatchStatsPanelProps {
  matchId: number | string;
}

export const MatchStatsPanel: React.FC<MatchStatsPanelProps> = ({ matchId }) => {
  const [statsData, setStatsData] = useState<MatchStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'comparison' | 'top_performers' | 'players'>('comparison');
  const [teamFilter, setTeamFilter] = useState<'all' | 'team_a' | 'team_b'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetailSource | null>(null);

  const loadStats = useCallback(async () => {
    if (!matchId) return;
    try {
      const data = await fetchMatchStats(matchId);
      if (data) {
        setStatsData(data);
      }
    } catch (err) {
      console.error('[MatchStatsPanel] Failed to load match stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    loadStats();

    // Subscribe to live socket events to update stats on raids and score changes
    const unsub = subscribeEvents((event: string) => {
      if (['RAID_RECORDED', 'RAID_EDITED', 'MATCH_STATUS_UPDATED', 'GAME_PHASE_CHANGED'].includes(event)) {
        console.log(`[MatchStatsPanel] Live update triggered by socket event [${event}]`);
        loadStats();
      }
    });

    return () => {
      unsub();
    };
  }, [loadStats]);

  if (isLoading && !statsData) {
    return (
      <div className="stats-panel-loading">
        <RotateCw className="spin-icon" size={24} />
        <span>Loading Match Statistics...</span>
      </div>
    );
  }

  if (!statsData || !statsData.team_stats) {
    return (
      <div className="stats-panel-empty">
        <BarChart3 size={32} />
        <p>No statistics recorded yet for this match.</p>
      </div>
    );
  }

  const { team_a, team_b } = statsData.team_stats;
  const topRaiders = statsData.top_performers?.top_raiders || [];
  const topDefenders = statsData.top_performers?.top_defenders || [];
  const playerStats = statsData.player_stats || [];

  // Filtered player list
  const filteredPlayers = playerStats.filter((p) => {
    if (teamFilter === 'team_a' && p.team_id !== team_a.team_id) return false;
    if (teamFilter === 'team_b' && p.team_id !== team_b.team_id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.player_name?.toLowerCase().includes(q);
      const matchJersey = String(p.jersey_no || '').includes(q);
      const matchTeam = p.team_name?.toLowerCase().includes(q);
      return matchName || matchJersey || matchTeam;
    }
    return true;
  });

  // Helper for comparison bar percentages
  const getBarPercentages = (valA: number, valB: number) => {
    const total = valA + valB;
    if (total === 0) return { pctA: 50, pctB: 50 };
    const pctA = Math.round((valA / total) * 100);
    return { pctA, pctB: 100 - pctA };
  };

  const ComparisonRow = ({
    label,
    valA,
    valB,
    highlight = false,
    subtitleA,
    subtitleB
  }: {
    label: string;
    valA: number;
    valB: number;
    highlight?: boolean;
    subtitleA?: string;
    subtitleB?: string;
  }) => {
    const { pctA, pctB } = getBarPercentages(valA, valB);
    return (
      <div className={`stats-comp-row ${highlight ? 'highlight-row' : ''}`}>
        <div className="comp-val-side left">
          <span className="comp-val">{valA}</span>
          {subtitleA && <span className="comp-sub">{subtitleA}</span>}
        </div>

        <div className="comp-bar-container">
          <div className="comp-label-bar">
            <span>{label}</span>
          </div>
          <div className="comp-bars-track">
            <div className="comp-bar-fill team-a" style={{ width: `${pctA}%` }} />
            <div className="comp-bar-fill team-b" style={{ width: `${pctB}%` }} />
          </div>
        </div>

        <div className="comp-val-side right">
          <span className="comp-val">{valB}</span>
          {subtitleB && <span className="comp-sub">{subtitleB}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="match-stats-panel-card">
      {/* Header Tabs Navigation */}
      <div className="stats-panel-header">
        <div className="stats-tab-buttons">
          <button
            className={`stats-tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <BarChart3 size={16} />
            <span>Team Comparison</span>
          </button>
          <button
            className={`stats-tab-btn ${activeTab === 'top_performers' ? 'active' : ''}`}
            onClick={() => setActiveTab('top_performers')}
          >
            <Trophy size={16} />
            <span>Top Performers</span>
          </button>
          <button
            className={`stats-tab-btn ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <Users size={16} />
            <span>Player Scorecard ({playerStats.length})</span>
          </button>
        </div>

        <button className="stats-refresh-btn" onClick={loadStats} title="Refresh Statistics">
          <RotateCw size={14} className={isLoading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TEAM COMPARISON
          ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="stats-tab-content">
          {/* Teams Banner */}
          <div className="comp-teams-banner">
            <div className="comp-team-info team-a">
              <TeamLogo
                logoUrl={team_a.team_logo}
                teamName={team_a.team_name}
                className="comp-team-logo"
                fallbackClassName="comp-team-initial"
              />
              <div className="comp-team-name">{team_a.team_name}</div>
              <div className="comp-team-score">{team_a.total_score}</div>
            </div>

            <div className="comp-vs-pill">
              <span>HEAD TO HEAD</span>
            </div>

            <div className="comp-team-info team-b">
              <div className="comp-team-score">{team_b.total_score}</div>
              <div className="comp-team-name">{team_b.team_name}</div>
              <TeamLogo
                logoUrl={team_b.team_logo}
                teamName={team_b.team_name}
                className="comp-team-logo"
                fallbackClassName="comp-team-initial"
              />
            </div>
          </div>

          {/* Section: Raiding Stats */}
          <div className="stats-section-group">
            <div className="stats-section-title">
              <Zap size={15} className="title-icon raid-icon" />
              <span>RAIDING STATISTICS</span>
            </div>
            <div className="stats-rows-list">
              <ComparisonRow
                label="Number of Raids"
                valA={team_a.number_of_raids}
                valB={team_b.number_of_raids}
              />
              <ComparisonRow
                label="Successful Raids"
                valA={team_a.successful_raids}
                valB={team_b.successful_raids}
                subtitleA={team_a.number_of_raids > 0 ? `${Math.round((team_a.successful_raids / team_a.number_of_raids) * 100)}%` : '0%'}
                subtitleB={team_b.number_of_raids > 0 ? `${Math.round((team_b.successful_raids / team_b.number_of_raids) * 100)}%` : '0%'}
              />
              <ComparisonRow
                label="Unsuccessful Raids"
                valA={team_a.unsuccessful_raids}
                valB={team_b.unsuccessful_raids}
              />
              <ComparisonRow
                label="Empty Raids"
                valA={team_a.empty_raids}
                valB={team_b.empty_raids}
              />
              <ComparisonRow
                label="Total Raid Points"
                valA={team_a.raid_points}
                valB={team_b.raid_points}
                highlight={true}
              />
              <ComparisonRow
                label="Touch Points"
                valA={team_a.touch_points}
                valB={team_b.touch_points}
              />
              <ComparisonRow
                label="Bonus Points"
                valA={team_a.bonus_points}
                valB={team_b.bonus_points}
              />
              <ComparisonRow
                label="Super Raids"
                valA={team_a.super_raids}
                valB={team_b.super_raids}
              />
            </div>
          </div>

          {/* Section: Tackling Stats */}
          <div className="stats-section-group">
            <div className="stats-section-title">
              <Shield size={15} className="title-icon defend-icon" />
              <span>DEFENSE & TACKLE STATISTICS</span>
            </div>
            <div className="stats-rows-list">
              <ComparisonRow
                label="Number of Tackles"
                valA={team_a.number_of_tackles}
                valB={team_b.number_of_tackles}
              />
              <ComparisonRow
                label="Successful Tackles"
                valA={team_a.successful_tackles}
                valB={team_b.successful_tackles}
                subtitleA={team_a.number_of_tackles > 0 ? `${Math.round((team_a.successful_tackles / team_a.number_of_tackles) * 100)}%` : '0%'}
                subtitleB={team_b.number_of_tackles > 0 ? `${Math.round((team_b.successful_tackles / team_b.number_of_tackles) * 100)}%` : '0%'}
              />
              <ComparisonRow
                label="Unsuccessful Tackles"
                valA={team_a.unsuccessful_tackles}
                valB={team_b.unsuccessful_tackles}
              />
              <ComparisonRow
                label="Total Tackle Points"
                valA={team_a.tackle_points}
                valB={team_b.tackle_points}
                highlight={true}
              />
              <ComparisonRow
                label="Super Tackles"
                valA={team_a.super_tackles}
                valB={team_b.super_tackles}
              />
            </div>
          </div>

          {/* Section: Extra & Match Points */}
          <div className="stats-section-group">
            <div className="stats-section-title">
              <Award size={15} className="title-icon" />
              <span>TEAM & EXTRAS SUMMARY</span>
            </div>
            <div className="stats-rows-list">
              <ComparisonRow
                label="All-Out Points"
                valA={team_a.all_out_points}
                valB={team_b.all_out_points}
              />
              <ComparisonRow
                label="Extras"
                valA={team_a.extras}
                valB={team_b.extras}
              />
              <ComparisonRow
                label="Total Match Score"
                valA={team_a.total_score}
                valB={team_b.total_score}
                highlight={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TOP PERFORMERS
          ========================================================================= */}
      {activeTab === 'top_performers' && (
        <div className="stats-tab-content">
          <div className="performers-grid">
            {/* Top Raiders Column */}
            <div className="performer-column">
              <div className="column-header raid-theme">
                <Flame size={18} />
                <span>TOP RAIDERS OF MATCH</span>
              </div>
              <div className="performers-cards-list">
                {topRaiders.length === 0 ? (
                  <div className="performer-empty">No raid points scored yet.</div>
                ) : (
                  topRaiders.map((raider, idx) => (
                    <div
                      key={raider.player_id}
                      className={`performer-card ${idx === 0 ? 'leader-card' : ''}`}
                      onClick={() => setSelectedPlayer(raider)}
                    >
                      <div className="performer-rank-col">
                        <span className={`rank-tag rank-${raider.rank}`}>#{raider.rank}</span>
                      </div>

                      <div className="performer-avatar-col">
                        <PlayerAvatar
                          imageUrl={raider.image_url}
                          playerName={raider.player_name}
                          jerseyNo={raider.jersey_no}
                          className="p-avatar"
                          fallbackClassName="p-avatar-placeholder"
                        />
                      </div>

                      <div className="performer-meta-col">
                        <div className="p-title-row">
                          <span className="p-name">{raider.player_name}</span>
                          {raider.super_tens > 0 && (
                            <span className="badge-super10" title="Super 10 Scored">
                              <Star size={11} /> SUPER 10
                            </span>
                          )}
                        </div>
                        <div className="p-team-sub">
                          <span>{raider.team_name}</span>
                          {raider.jersey_no && <span className="jersey-pill">#{raider.jersey_no}</span>}
                        </div>
                        <div className="p-details-row">
                          <span>Raids: <strong>{raider.raids}</strong></span>
                          <span>Touch: <strong>{raider.touch_points}</strong></span>
                          <span>Bonus: <strong>{raider.bonus_points}</strong></span>
                        </div>
                      </div>

                      <div className="performer-score-col">
                        <span className="pts-number">{raider.total_raid_points}</span>
                        <span className="pts-label">RAID PTS</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Defenders Column */}
            <div className="performer-column">
              <div className="column-header defend-theme">
                <Shield size={18} />
                <span>TOP DEFENDERS OF MATCH</span>
              </div>
              <div className="performers-cards-list">
                {topDefenders.length === 0 ? (
                  <div className="performer-empty">No tackle points scored yet.</div>
                ) : (
                  topDefenders.map((defender, idx) => (
                    <div
                      key={defender.player_id}
                      className={`performer-card ${idx === 0 ? 'leader-card' : ''}`}
                      onClick={() => setSelectedPlayer(defender)}
                    >
                      <div className="performer-rank-col">
                        <span className={`rank-tag rank-${defender.rank}`}>#{defender.rank}</span>
                      </div>

                      <div className="performer-avatar-col">
                        <PlayerAvatar
                          imageUrl={defender.image_url}
                          playerName={defender.player_name}
                          jerseyNo={defender.jersey_no}
                          className="p-avatar"
                          fallbackClassName="p-avatar-placeholder"
                        />
                      </div>

                      <div className="performer-meta-col">
                        <div className="p-title-row">
                          <span className="p-name">{defender.player_name}</span>
                          {defender.high_fives > 0 && (
                            <span className="badge-high5" title="High 5 Scored">
                              <Shield size={11} /> HIGH 5
                            </span>
                          )}
                        </div>
                        <div className="p-team-sub">
                          <span>{defender.team_name}</span>
                          {defender.jersey_no && <span className="jersey-pill">#{defender.jersey_no}</span>}
                        </div>
                        <div className="p-details-row">
                          <span>Tackles: <strong>{defender.total_tackles}</strong></span>
                          <span>Succ: <strong>{defender.successful_tackles}</strong></span>
                          <span>Super: <strong>{defender.super_tackles}</strong></span>
                        </div>
                      </div>

                      <div className="performer-score-col">
                        <span className="pts-number">{defender.tackle_points}</span>
                        <span className="pts-label">TACKLE PTS</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FULL PLAYER SCORECARD
          ========================================================================= */}
      {activeTab === 'players' && (
        <div className="stats-tab-content">
          {/* Filter Bar */}
          <div className="player-stats-toolbar">
            <div className="team-filter-pills">
              <button
                className={`filter-pill ${teamFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTeamFilter('all')}
              >
                All Players ({playerStats.length})
              </button>
              <button
                className={`filter-pill ${teamFilter === 'team_a' ? 'active' : ''}`}
                onClick={() => setTeamFilter('team_a')}
              >
                {team_a.team_name}
              </button>
              <button
                className={`filter-pill ${teamFilter === 'team_b' ? 'active' : ''}`}
                onClick={() => setTeamFilter('team_b')}
              >
                {team_b.team_name}
              </button>
            </div>

            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search by player, jersey, team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Player Scorecard Table */}
          <div className="player-table-container">
            <table className="player-stats-table">
              <thead>
                <tr>
                  <th className="sticky-col">PLAYER</th>
                  <th>TEAM</th>
                  <th title="Total Raids Attempted">RAIDS</th>
                  <th title="Successful Raids">SUCC. R</th>
                  <th title="Unsuccessful Raids">UNSUCC. R</th>
                  <th title="Touch Points">TOUCH</th>
                  <th title="Bonus Points">BONUS</th>
                  <th className="highlight-col" title="Total Raid Points (Touch + Bonus)">RAID PTS</th>
                  <th title="Total Tackles Attempted">TACKLES</th>
                  <th title="Successful Tackles">SUCC. T</th>
                  <th title="Unsuccessful Tackles">UNSUCC. T</th>
                  <th className="highlight-col" title="Total Tackle Points">TACKLE PTS</th>
                  <th title="Super Tackles">SUPER T</th>
                  <th className="total-col" title="Total Points (Raid + Tackle)">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="table-empty-row">
                      No players match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => (
                    <tr key={player.player_id} onClick={() => setSelectedPlayer(player)}>
                      <td className="sticky-col player-info-cell">
                        <div className="table-player-block">
                          <span className="table-jersey">#{player.jersey_no || '-'}</span>
                          <div className="table-name-wrapper">
                            <span className="table-player-name">{player.player_name}</span>
                            {player.super_ten && (
                              <span className="badge-mini-super10">S10</span>
                            )}
                            {player.high_five && (
                              <span className="badge-mini-high5">H5</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-team-badge">{player.team_name}</span>
                      </td>
                      <td>{player.raids}</td>
                      <td className="succ-text">{player.successful_raids}</td>
                      <td className="unsucc-text">{player.unsuccessful_raids}</td>
                      <td>{player.touch_points}</td>
                      <td>{player.bonus_points}</td>
                      <td className="highlight-col raid-pts-cell">{player.total_raid_points}</td>
                      <td>{player.total_tackles}</td>
                      <td className="succ-text">{player.successful_tackles}</td>
                      <td className="unsucc-text">{player.unsuccessful_tackles}</td>
                      <td className="highlight-col tackle-pts-cell">{player.tackle_points}</td>
                      <td>{player.super_tackles}</td>
                      <td className="total-col total-pts-cell">{player.total_points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
};