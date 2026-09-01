import axios from 'axios';
import type {
  Tournament,
  MatchSummary,
  MatchStatusData,
  MatchStatsData,
  PlayerStats,
  TopPerformersData,
  TournamentStatsData
} from '../types';

const defaultBackendUrl = import.meta.env.VITE_BACKEND_URL || 'https://9dq3jmc0-4000.inc1.devtunnels.ms/';
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

export const fetchTournaments = async (): Promise<Tournament[]> => {
  const client = getClient();
  try {
    const res = await client.get('/api/public/tournaments');
    return res.data?.data || [];
  } catch (err) {
    console.warn('Public tournaments endpoint failed, trying scorer endpoint...', err);
    try {
      const res = await client.get('/api/scorer/tournaments');
      return res.data?.data || [];
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
    return res.data?.data || [];
  } catch (err) {
    console.warn(`Public matches endpoint failed for tournament ${tournamentId}, trying scorer endpoint...`, err);
    try {
      const res = await client.get(`/api/scorer/tournaments/${tournamentId}/matches`);
      return res.data?.data || [];
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
