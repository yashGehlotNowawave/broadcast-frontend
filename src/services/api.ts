import axios from 'axios';
import type {
  Tournament,
  MatchSummary,
  MatchStatusData,
  MatchStatsData,
  PlayerStats,
  TopPerformersData,
  TournamentStatsData,
  PlayByPlayData
} from '../types';

// 'https://scoring-tool-backend-974618494728.asia-south1.run.app'
// 'https://services-kbdtracker.elev8sportz.com/';
const defaultBackendUrl = import.meta.env.VITE_BACKEND_URL || 'https://services-kbdtracker.elev8sportz.com/';

const savedUrl = localStorage.getItem('backend_base_url');
let BASE_URL = savedUrl || defaultBackendUrl;

export const getBaseUrl = () => BASE_URL;

export const setBaseUrl = (url: string) => {
  BASE_URL = url.replace(/\/$/, '');
  localStorage.setItem('backend_base_url', BASE_URL);
};

export const getAuthToken = () => localStorage.getItem('auth_token') || '';

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

const getClient = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

const filterActiveTournaments = (list: any[]): Tournament[] => {
  if (!Array.isArray(list)) return [];
  return list.filter((t: any) => {
    // Exclude if explicitly marked inactive
    if (t.is_active === false || t.is_active === 0 || t.is_active === 'false' || t.is_active === '0') {
      return false;
    }
    // Exclude if soft-deleted
    if (t.is_deleted === true || t.is_deleted === 1 || t.is_deleted === 'true' || t.is_deleted === '1') {
      return false;
    }
    // Exclude if status is deleted, inactive, or archived
    if (typeof t.status === 'string') {
      const lower = t.status.trim().toLowerCase();
      if (lower === 'deleted' || lower === 'inactive' || lower === 'archived') {
        return false;
      }
    }
    return true;
  });
};

export const fetchTournaments = async (): Promise<Tournament[]> => {
  const client = getClient();
  try {
    const res = await client.get('/api/public/tournaments');
    const rawList = res.data?.data ?? res.data?.result ?? (Array.isArray(res.data) ? res.data : []);
    return filterActiveTournaments(rawList);
  } catch (err) {
    console.warn('Public tournaments endpoint failed, trying scorer endpoint...', err);
    try {
      const res = await client.get('/api/scorer/tournaments');
      const rawList = res.data?.data ?? res.data?.result ?? (Array.isArray(res.data) ? res.data : []);
      return filterActiveTournaments(rawList);
    } catch (fallbackErr) {
      console.error('Error fetching tournaments:', fallbackErr);
      throw fallbackErr;
    }
  }
};

export const fetchMatches = async (tournamentId: number | string): Promise<MatchSummary[]> => {
  const client = getClient();
  try {
    const res = await client.get(`/api/public/tournaments/${tournamentId}/matches`);
    const rawList = res.data?.data ?? res.data?.result ?? (Array.isArray(res.data) ? res.data : []);
    return Array.isArray(rawList) ? rawList : [];
  } catch (err) {
    console.warn(`Public matches endpoint failed for tournament ${tournamentId}, trying scorer endpoint...`, err);
    try {
      const res = await client.get(`/api/scorer/tournaments/${tournamentId}/matches`);
      const rawList = res.data?.data ?? res.data?.result ?? (Array.isArray(res.data) ? res.data : []);
      return Array.isArray(rawList) ? rawList : [];
    } catch (fallbackErr) {
      console.error(`Error fetching matches for tournament ${tournamentId}:`, fallbackErr);
      throw fallbackErr;
    }
  }
};

export const fetchMatchStatus = async (matchId: number | string): Promise<MatchStatusData> => {
  const client = getClient();
  try {
    const res = await client.get(`/api/public/matches/${matchId}/status`);
    return res.data?.data || res.data;
  } catch (err) {
    console.warn(`Public match status endpoint failed for match ${matchId}, trying scorer endpoint...`, err);
    try {
      const res = await client.get(`/api/scorer/matches/${matchId}/raid/current-status`);
      return res.data?.data || res.data;
    } catch (fallbackErr) {
      console.error(`Error fetching match status for match ${matchId}:`, fallbackErr);
      throw fallbackErr;
    }
  }
};

// --------------------------------------------------------------------------
// Detailed Statistics APIs (Public - No Auth Required)
// --------------------------------------------------------------------------

/**
 * Fetch full match statistics (team stats, player stats, top performers)
 */
export const fetchMatchStats = async (matchId: number | string): Promise<MatchStatsData> => {
  const client = getClient();
  const res = await client.get(`/api/public/matches/${matchId}/stats`);
  return res.data?.data;
};

/**
 * Fetch match player statistics with optional filtering
 */
export const fetchMatchPlayerStats = async (
  matchId: number | string,
  params?: { team_id?: number; player_id?: number }
): Promise<PlayerStats[]> => {
  const client = getClient();
  const res = await client.get(`/api/public/matches/${matchId}/player-stats`, { params });
  return res.data?.data?.player_stats || [];
};

/**
 * Fetch top performers (raiders and defenders) for a match
 */
export const fetchMatchTopPerformers = async (
  matchId: number | string,
  limit: number = 5
): Promise<TopPerformersData> => {
  const client = getClient();
  const res = await client.get(`/api/public/matches/${matchId}/top-performers`, {
    params: { limit }
  });
  return res.data?.data || { top_raiders: [], top_defenders: [] };
};

/**
 * Fetch Play-by-Play match timeline events (raids, substitutions, timeouts, cards, reviews)
 */
export const fetchPlayByPlay = async (
  matchId: number | string,
  options?: {
    order?: 'asc' | 'desc';
    game_phase?: string;
    page?: number;
    limit?: number;
  }
): Promise<PlayByPlayData> => {
  const client = getClient();
  const res = await client.get(`/api/public/matches/${matchId}/play-by-play`, {
    params: options
  });
  return res.data?.data;
};

/**
 * Fetch Raid-by-Raid match timeline (alias for play-by-play)
 */
export const fetchRaidByRaid = async (
  matchId: number | string,
  options?: {
    order?: 'asc' | 'desc';
    game_phase?: string;
    page?: number;
    limit?: number;
  }
): Promise<PlayByPlayData> => {
  const client = getClient();
  const res = await client.get(`/api/public/matches/${matchId}/raid-by-raid`, {
    params: options
  });
  return res.data?.data;
};

/**
 * Fetch full tournament statistics (totals, team summaries, top performers)
 */
export const fetchTournamentStats = async (
  tournamentId: number | string
): Promise<TournamentStatsData> => {
  const client = getClient();
  const res = await client.get(`/api/public/tournaments/${tournamentId}/stats`);
  return res.data?.data;
};

/**
 * Fetch tournament-wide player statistics with pagination
 */
export const fetchTournamentPlayerStats = async (
  tournamentId: number | string,
  params?: { team_id?: number; player_id?: number; limit?: number; offset?: number }
): Promise<{ total: number; player_stats: PlayerStats[] }> => {
  const client = getClient();
  const res = await client.get(`/api/public/tournaments/${tournamentId}/player-stats`, { params });
  return res.data?.data || { total: 0, player_stats: [] };
};

/**
 * Fetch top performers for the tournament
 */
export const fetchTournamentTopPerformers = async (
  tournamentId: number | string,
  limit: number = 5
): Promise<TopPerformersData> => {
  const client = getClient();
  const res = await client.get(`/api/public/tournaments/${tournamentId}/top-performers`, {
    params: { limit }
  });
  return res.data?.data || { top_raiders: [], top_defenders: [] };
};

export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
  if (res.data?.data?.token) {
    setAuthToken(res.data.data.token);
  }
  return res.data?.data || res.data;
};
