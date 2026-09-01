import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Users,
  RotateCw,
  Zap,
  Shield,
  Search,
  Award,
  Flame,
  Star,
  Activity
} from 'lucide-react';
import { fetchTournamentStats, fetchTournamentPlayerStats } from '../services/api';
import type { TournamentStatsData, PlayerStats } from '../types';
import { PlayerDetailModal, type PlayerDetailSource } from './PlayerDetailModal';
import { TeamLogo, PlayerAvatar } from './TeamLogo';

interface TournamentStatsPanelProps {
  tournamentId: number | string;
  tournamentName?: string;
}

export const TournamentStatsPanel: React.FC<TournamentStatsPanelProps> = ({
  tournamentId,
  tournamentName
}) => {
  const [statsData, setStatsData] = useState<TournamentStatsData | null>(null);
  const [playerList, setPlayerList] = useState<PlayerStats[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaders' | 'teams' | 'players'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetailSource | null>(null);

  const loadData = useCallback(async () => {
    if (!tournamentId) return;
    setIsLoading(true);
    try {
      const [tourData, playersData] = await Promise.all([
        fetchTournamentStats(tournamentId),
        fetchTournamentPlayerStats(tournamentId, { limit: 100 })
      ]);
      if (tourData) setStatsData(tourData);
      if (playersData?.player_stats) setPlayerList(playersData.player_stats);
    } catch (err) {
      console.error('[TournamentStatsPanel] Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading && !statsData) {
    return (
      <div className="stats-panel-loading">
        <RotateCw className="spin-icon" size={24} />
        <span>Loading Tournament Statistics...</span>
      </div>
    );
  }

  if (!statsData || !statsData.tournament_stats) {
    return (
      <div className="stats-panel-empty">
        <Trophy size={32} />
        <p>No statistics available yet for this tournament.</p>
      </div>
    );
  }

  const totals = statsData.tournament_stats;
  const topRaiders = statsData.top_performers?.top_raiders || [];
  const topDefenders = statsData.top_performers?.top_defenders || [];
  const teams = statsData.team_stats || [];

  const filteredPlayers = playerList.filter((p) => {
    if (selectedTeamFilter !== 'all' && String(p.team_id) !== selectedTeamFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.player_name?.toLowerCase().includes(q) ||
        p.team_name?.toLowerCase().includes(q) ||
        String(p.jersey_no || '').includes(q)
      );
    }
    return true;
  });

  return (
    <div className="tournament-stats-container">
      {tournamentName && (
        <div className="tournament-stats-title-bar">
          <h2>{tournamentName}</h2>
          <span>STATISTICS & LEADERBOARD</span>
        </div>
      )}
      {/* Tournament Overview Stats Cards */}
      <div className="tour-kpi-grid">
        <div className="tour-kpi-card">
          <div className="kpi-icon-wrap raid">
            <Zap size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">TOTAL RAIDS</span>
            <span className="kpi-val">{totals.total_raids.toLocaleString()}</span>
            <span className="kpi-sub">{totals.total_successful_raids} successful</span>
          </div>
        </div>

        <div className="tour-kpi-card">
          <div className="kpi-icon-wrap raid">
            <Flame size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">TOTAL RAID POINTS</span>
            <span className="kpi-val highlight-raid">{totals.total_raid_points.toLocaleString()}</span>
            <span className="kpi-sub">{totals.total_touch_points} Touch / {totals.total_bonus_points} Bonus</span>
          </div>
        </div>

        <div className="tour-kpi-card">
          <div className="kpi-icon-wrap defend">
            <Shield size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">TOTAL TACKLES</span>
            <span className="kpi-val">{totals.total_tackles.toLocaleString()}</span>
            <span className="kpi-sub">{totals.total_successful_tackles} successful</span>
          </div>
        </div>

        <div className="tour-kpi-card">
          <div className="kpi-icon-wrap defend">
            <Award size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">TOTAL TACKLE POINTS</span>
            <span className="kpi-val highlight-defend">{totals.total_tackle_points.toLocaleString()}</span>
            <span className="kpi-sub">{totals.total_super_tackles} Super Tackles</span>
          </div>
        </div>

        <div className="tour-kpi-card">
          <div className="kpi-icon-wrap match">
            <Activity size={20} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">MATCHES PLAYED</span>
            <span className="kpi-val">{totals.total_matches}</span>
            <span className="kpi-sub">{totals.total_points.toLocaleString()} total pts</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="tournament-stats-nav">
        <div className="stats-tab-buttons">
          <button
            className={`stats-tab-btn ${activeTab === 'overview' || activeTab === 'leaders' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaders')}
          >
            <Trophy size={16} />
            <span>Top Performers</span>
          </button>
          <button
            className={`stats-tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <Award size={16} />
            <span>Team Summaries ({teams.length})</span>
          </button>
          <button
            className={`stats-tab-btn ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <Users size={16} />
            <span>Player Leaderboard ({playerList.length})</span>
          </button>
        </div>

        <button className="stats-refresh-btn" onClick={loadData} title="Refresh">
          <RotateCw size={14} className={isLoading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* =========================================================================
          TAB: TOP PERFORMERS (LEADERS)
          ========================================================================= */}
      {(activeTab === 'overview' || activeTab === 'leaders') && (
        <div className="stats-tab-content">
          <div className="performers-grid">
            {/* Top Raiders Column */}
            <div className="performer-column">
              <div className="column-header raid-theme">
                <Flame size={18} />
                <span>TOURNAMENT TOP RAIDERS</span>
              </div>
              <div className="performers-cards-list">
                {topRaiders.length === 0 ? (
                  <div className="performer-empty">No raid points recorded yet.</div>
                ) : (
                  topRaiders.map((raider) => (
                    <div
                      key={raider.player_id}
                      className={`performer-card ${raider.rank === 1 ? 'leader-card' : ''}`}
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
                            <span className="badge-super10">
                              <Star size={11} /> {raider.super_tens}x S10
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
                <span>TOURNAMENT TOP DEFENDERS</span>
              </div>
              <div className="performers-cards-list">
                {topDefenders.length === 0 ? (
                  <div className="performer-empty">No tackle points recorded yet.</div>
                ) : (
                  topDefenders.map((defender) => (
                    <div
                      key={defender.player_id}
                      className={`performer-card ${defender.rank === 1 ? 'leader-card' : ''}`}
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
                            <span className="badge-high5">
                              <Shield size={11} /> {defender.high_fives}x H5
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
          TAB: TEAM SUMMARIES
          ========================================================================= */}
      {activeTab === 'teams' && (
        <div className="stats-tab-content">
          <div className="player-table-container">
            <table className="player-stats-table">
              <thead>
                <tr>
                  <th className="sticky-col">TEAM</th>
                  <th>MATCHES</th>
                  <th>RAIDS</th>
                  <th>SUCC. RAIDS</th>
                  <th>RAID PTS</th>
                  <th>TACKLES</th>
                  <th>SUCC. TACKLES</th>
                  <th>TACKLE PTS</th>
                  <th>SUPER TACKLES</th>
                  <th>ALL OUT</th>
                  <th>EXTRAS</th>
                  <th className="total-col">TOTAL POINTS</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="table-empty-row">No team statistics recorded.</td>
                  </tr>
                ) : (
                  teams.map((t) => (
                    <tr key={t.team_id}>
                      <td className="sticky-col player-info-cell">
                        <div className="table-player-block">
                          <TeamLogo
                            logoUrl={t.team_logo}
                            teamName={t.team_name}
                            className="table-team-logo"
                            fallbackClassName="table-team-initial"
                          />
                          <span className="table-player-name">{t.team_name}</span>
                        </div>
                      </td>
                      <td>{t.matches_played}</td>
                      <td>{t.number_of_raids}</td>
                      <td className="succ-text">{t.successful_raids}</td>
                      <td className="highlight-col raid-pts-cell">{t.raid_points}</td>
                      <td>{t.number_of_tackles}</td>
                      <td className="succ-text">{t.successful_tackles}</td>
                      <td className="highlight-col tackle-pts-cell">{t.tackle_points}</td>
                      <td>{t.super_tackles}</td>
                      <td>{t.all_out_points}</td>
                      <td>{t.extras}</td>
                      <td className="total-col total-pts-cell">{t.total_points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: PLAYER LEADERBOARD
          ========================================================================= */}
      {activeTab === 'players' && (
        <div className="stats-tab-content">
          <div className="player-stats-toolbar">
            <div className="team-filter-pills">
              <button
                className={`filter-pill ${selectedTeamFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedTeamFilter('all')}
              >
                All Teams
              </button>
              {teams.map((t) => (
                <button
                  key={t.team_id}
                  className={`filter-pill ${selectedTeamFilter === String(t.team_id) ? 'active' : ''}`}
                  onClick={() => setSelectedTeamFilter(String(t.team_id))}
                >
                  {t.team_name}
                </button>
              ))}
            </div>

            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search player or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="player-table-container">
            <table className="player-stats-table">
              <thead>
                <tr>
                  <th className="sticky-col">PLAYER</th>
                  <th>TEAM</th>
                  <th>MATCHES</th>
                  <th>RAIDS</th>
                  <th>SUCC. R</th>
                  <th>UNSUCC. R</th>
                  <th>TOUCH</th>
                  <th>BONUS</th>
                  <th className="highlight-col">RAID PTS</th>
                  <th>TACKLES</th>
                  <th>SUCC. T</th>
                  <th>UNSUCC. T</th>
                  <th className="highlight-col">TACKLE PTS</th>
                  <th>SUPER T</th>
                  <th className="total-col">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="table-empty-row">No players found.</td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => (
                    <tr key={p.player_id} onClick={() => setSelectedPlayer(p)}>
                      <td className="sticky-col player-info-cell">
                        <div className="table-player-block">
                          <span className="table-jersey">#{p.jersey_no || '-'}</span>
                          <span className="table-player-name">{p.player_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="table-team-badge">{p.team_name}</span>
                      </td>
                      <td>{p.matches_played || 1}</td>
                      <td>{p.raids}</td>
                      <td className="succ-text">{p.successful_raids}</td>
                      <td className="unsucc-text">{p.unsuccessful_raids}</td>
                      <td>{p.touch_points}</td>
                      <td>{p.bonus_points}</td>
                      <td className="highlight-col raid-pts-cell">{p.total_raid_points}</td>
                      <td>{p.total_tackles}</td>
                      <td className="succ-text">{p.successful_tackles}</td>
                      <td className="unsucc-text">{p.unsuccessful_tackles}</td>
                      <td className="highlight-col tackle-pts-cell">{p.tackle_points}</td>
                      <td>{p.super_tackles}</td>
                      <td className="total-col total-pts-cell">{p.total_points}</td>
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