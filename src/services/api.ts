import axios from 'axios';
import type { Tournament, MatchSummary, MatchStatusData } from '../types';


// const defaultBackendUrl = "https://9dq3jmc0-4000.inc1.devtunnels.ms/"
const defaultBackendUrl = import.meta.env.VITE_BACKEND_URL || 'https://scoring-tool-backend-974618494728.asia-south1.run.app';
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
    // Try public unauthenticated endpoint first
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
    // Try public unauthenticated endpoint first
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
    // Try public unauthenticated endpoint first
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

export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
  if (res.data?.data?.token) {
    setAuthToken(res.data.data.token);
  }
  return res.data?.data || res.data;
};
