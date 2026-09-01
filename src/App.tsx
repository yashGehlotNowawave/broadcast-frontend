import React, { useState, useEffect, useCallback } from 'react';
import type { Tournament, MatchSummary, MatchStatusData } from './types';
import { fetchTournaments, fetchMatches, fetchMatchStatus } from './services/api';
import {
  initSocket,
  subscribeStatus,
  subscribeEvents,
  joinMatchRoom,
  leaveMatchRoom,
  joinTournamentRoom,
  leaveTournamentRoom
} from './services/socket';

import { Header } from './components/Header';
import { TournamentList } from './components/TournamentList';
import { MatchList } from './components/MatchList';
import { PKLMatchScoreboard } from './components/PKLMatchScoreboard';
import { KabaddiCourtMat } from './components/KabaddiCourtMat';
import { LiveTicker } from './components/LiveTicker';
import { SocketInspector } from './components/SocketInspector';
import { ConfigModal } from './components/ConfigModal';
import { MatchStatsPanel } from './components/MatchStatsPanel';
import { TournamentStatsPanel } from './components/TournamentStatsPanel';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'tournaments' | 'matches' | 'match_detail'>('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [matchData, setMatchData] = useState<MatchStatusData | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [tournamentViewMode, setTournamentViewMode] = useState<'matches' | 'stats'>('matches');

  // Helper to synchronize URL query parameters without reloading
  const updateUrl = (tourId?: number | string | null, matchId?: number | string | null) => {
    const url = new URL(window.location.href);
    if (tourId) {
      url.searchParams.set('tournament', String(tourId));
    } else {
      url.searchParams.delete('tournament');
    }
    if (matchId) {
      url.searchParams.set('match', String(matchId));
    } else {
      url.searchParams.delete('match');
    }
    window.history.pushState({}, '', url.pathname + url.search);
  };

  // 1. Initialize WebSocket connection on mount & subscribe to status
  useEffect(() => {
    initSocket();
    const unsubStatus = subscribeStatus((connected) => {
      setIsConnected(connected);
    });

    // Handle real-time socket updates for active match
    const unsubEvents = subscribeEvents((event, payload) => {
      console.log('App reactive event handler:', event, payload);

      if (event === 'RAID_RECORDED' || event === 'MATCH_SESSION_UPDATED') {
        if (payload) {
          setMatchData((prev) => (prev ? { ...prev, ...payload } : payload));
        }
      } else if (event === 'RAIDER_SELECTED' || event === 'raider_selected') {
        const raiderId = payload?.selectedRaiderId ?? payload?.raider_player_id ?? payload?.player_id ?? payload?.selected_raider_id ?? payload?.session?.selected_raider_id;
        const raidingTeamId = payload?.currentRaidingTeamId ?? payload?.current_raiding_team_id ?? payload?.team_id ?? payload?.session?.current_raiding_team_id;

        setMatchData((prev) => {
          let raiderName = payload?.raider_name || payload?.selected_raider_name;
          let jerseyNo = payload?.jersey_no || payload?.jerseyNo;
          if (raiderId && prev) {
            const allPlayers = [
              ...(prev.team_a?.mat || []), ...(prev.team_a?.bench || []), ...(prev.team_a?.substitute || []), ...(prev.team_a?.court_players || []),
              ...(prev.team_b?.mat || []), ...(prev.team_b?.bench || []), ...(prev.team_b?.substitute || []), ...(prev.team_b?.court_players || [])
            ];
            const p = allPlayers.find((player: any) => Number(player.id || player.player_id) === Number(raiderId));
            if (p) {
              if (!raiderName) raiderName = p.full_name || p.name;
              if (!jerseyNo) jerseyNo = p.jersey_no;
            }
          }

          let displayRaiderName = raiderName || 'Active Raider';

          if (!prev) {
            return {
              match_id: payload?.matchId || payload?.match_id,
              current_raiding_team_id: raidingTeamId,
              selected_raider_id: raiderId ? Number(raiderId) : undefined,
              selected_raider_name: displayRaiderName,
              update_message: `Raider Selected: ${displayRaiderName}`
            } as any;
          }

          return {
            ...prev,
            current_raiding_team_id: raidingTeamId ?? prev.current_raiding_team_id,
            selected_raider_id: raiderId ? Number(raiderId) : prev.selected_raider_id,
            selected_raider_name: displayRaiderName,
            update_message: `Raider Selected: ${displayRaiderName}`
          };
        });
      }
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, []);

  // 2. Restore state from URL on load & handle browser back/forward
  const restoreFromUrl = useCallback(async () => {
    setIsLoading(true);
    try {
      const allTournaments = await fetchTournaments();
      setTournaments(allTournaments);

      const params = new URLSearchParams(window.location.search);
      const urlTournamentId = params.get('tournament');
      const urlMatchId = params.get('match');

      if (urlTournamentId) {
        const matchedTournament = allTournaments.find(
          (t) => String(t.id) === String(urlTournamentId)
        ) || { id: Number(urlTournamentId), name: `Tournament #${urlTournamentId}` };

        setSelectedTournament(matchedTournament);
        joinTournamentRoom(matchedTournament.id);

        const tourMatches = await fetchMatches(matchedTournament.id);
        setMatches(tourMatches);

        if (urlMatchId) {
          const matchedMatch = tourMatches.find(
            (m) => String(m.id || m.external_fixture_id) === String(urlMatchId)
          ) || ({ id: Number(urlMatchId), tournament_id: matchedTournament.id, team_a_placeholder: 'Team A', team_b_placeholder: 'Team B', status: 'live' } as MatchSummary);

          setSelectedMatch(matchedMatch);
          setActiveView('match_detail');
          joinMatchRoom(urlMatchId);

          try {
            const data = await fetchMatchStatus(urlMatchId);
            if (data) {
              const sId = data.selected_raider_id || (data as any)?.session?.selected_raider_id;
              if (sId) {
                const allPlayers = [
                  ...(data.team_a?.mat || []), ...(data.team_a?.bench || []), ...(data.team_a?.substitute || []), ...(data.team_a?.court_players || []),
                  ...(data.team_b?.mat || []), ...(data.team_b?.bench || []), ...(data.team_b?.substitute || []), ...(data.team_b?.court_players || [])
                ];
                const p = allPlayers.find((player: any) => (player.id || player.player_id) === Number(sId));
                if (p) {
                  data.selected_raider_name = p.full_name || p.name;
                }
              }
              if (data.update_message && data.update_message.includes('undefined')) {
                delete data.update_message;
              }
            }
            setMatchData(data);
          } catch (err) {
            console.error(`Failed to load match status for ${urlMatchId}:`, err);
          }
        } else {
          setTournamentViewMode('matches');
    setActiveView('matches');
        }
      } else {
        setActiveView('tournaments');
      }
    } catch (err) {
      console.error('Failed in restoreFromUrl:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreFromUrl();

    const handlePopState = () => {
      restoreFromUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [restoreFromUrl]);

  const handleSelectTournament = async (t: Tournament) => {
    setSelectedTournament(t);
    setSelectedMatch(null);
    setMatchData(null);
    setActiveView('matches');
    updateUrl(t.id, null);
    setIsLoading(true);

    // Subscribe to tournament stream room
    joinTournamentRoom(t.id);

    try {
      const data = await fetchMatches(t.id);
      setMatches(data);
    } catch (err) {
      console.error(`Failed to load matches for tournament ${t.id}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMatch = async (m: MatchSummary) => {
    setSelectedMatch(m);
    setActiveView('match_detail');
    const matchId = m.id || m.external_fixture_id;
    updateUrl(selectedTournament?.id || m.tournament_id, matchId);
    setIsLoading(true);

    if (matchId) {
      // Subscribe to match stream room
      joinMatchRoom(matchId);

      try {
        const data = await fetchMatchStatus(matchId);
        
        if (data) {
          const sId = data.selected_raider_id || (data as any)?.session?.selected_raider_id;
          if (sId) {
            const allPlayers = [
              ...(data.team_a?.mat || []), ...(data.team_a?.bench || []), ...(data.team_a?.substitute || []), ...(data.team_a?.court_players || []),
              ...(data.team_b?.mat || []), ...(data.team_b?.bench || []), ...(data.team_b?.substitute || []), ...(data.team_b?.court_players || [])
            ];
            const p = allPlayers.find((player: any) => (player.id || player.player_id) === Number(sId));
            if (p) {
              data.selected_raider_name = p.full_name || p.name;
            }
          }
          if (data.update_message && data.update_message.includes('undefined')) {
            delete data.update_message;
          }
        }

        setMatchData(data);
      } catch (err) {
        console.error(`Failed to load current status for match ${matchId}:`, err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleNavigate = (view: 'tournaments' | 'matches') => {
    if (view === 'tournaments') {
      if (selectedTournament) leaveTournamentRoom(selectedTournament.id);
      if (selectedMatch) leaveMatchRoom(selectedMatch.id || selectedMatch.external_fixture_id || '');
      setSelectedTournament(null);
      setSelectedMatch(null);
      setMatchData(null);
      updateUrl(null, null);
    } else if (view === 'matches' && selectedTournament) {
      if (selectedMatch) leaveMatchRoom(selectedMatch.id || selectedMatch.external_fixture_id || '');
      setSelectedMatch(null);
      setMatchData(null);
      updateUrl(selectedTournament.id, null);
    }
    setActiveView(view);
  };

  return (
    <div className="app-container">
      <Header
        activeView={activeView}
        selectedTournamentName={selectedTournament?.name}
        onNavigate={handleNavigate}
        isConnected={isConnected}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <main className="main-content">
        {activeView === 'tournaments' && (
          <TournamentList
            tournaments={tournaments}
            onSelectTournament={handleSelectTournament}
            isLoading={isLoading}
          />
        )}

        {activeView === 'matches' && selectedTournament && (
          <div>
            <div className="tour-view-switcher">
              <button
                className={'tour-view-btn ' + (tournamentViewMode === 'matches' ? 'active' : '')}
                onClick={() => setTournamentViewMode('matches')}
              >
                Matches ({matches.length})
              </button>
              <button
                className={'tour-view-btn ' + (tournamentViewMode === 'stats' ? 'active' : '')}
                onClick={() => setTournamentViewMode('stats')}
              >
                Tournament Statistics & Leaders
              </button>
            </div>

            {tournamentViewMode === 'matches' ? (
              <MatchList
                tournamentName={selectedTournament.name}
                matches={matches}
                onSelectMatch={handleSelectMatch}
                isLoading={isLoading}
                onBack={() => handleNavigate('tournaments')}
              />
            ) : (
              <TournamentStatsPanel
                tournamentId={selectedTournament.id}
                tournamentName={selectedTournament.name}
              />
            )}
          </div>
        )}

        {activeView === 'match_detail' && (
          <div>
            <PKLMatchScoreboard
              matchSummary={selectedMatch}
              matchData={matchData}
              onBack={() => handleNavigate('matches')}
            />

            <LiveTicker
              lastRaid={matchData?.last_raid}
              updateMessage={matchData?.update_message}
            />

            <KabaddiCourtMat matchData={matchData} />

            {/* Live Match & Player Statistics Suite */}
            {selectedMatch && (
              <MatchStatsPanel
                matchId={selectedMatch.id || selectedMatch.external_fixture_id || ''}
              />
            )}
          </div>
        )}
      </main>

      {/* Live Socket Debugger Inspector Drawer */}
      <SocketInspector />

      {/* Backend & Auth Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default App;
