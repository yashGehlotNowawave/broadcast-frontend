import { io, Socket } from 'socket.io-client';
import { getBaseUrl, getAuthToken } from './api';
import type { SocketLog } from '../types';

let socket: Socket | null = null;
let currentJoinedMatchId: string | null = null;
let currentJoinedTournamentId: string | null = null;

type LogListener = (log: SocketLog) => void;
type StatusListener = (connected: boolean) => void;
type EventListener = (event: string, payload: any) => void;

const logListeners = new Set<LogListener>();
const statusListeners = new Set<StatusListener>();
const eventListeners = new Set<EventListener>();

export const getSocket = (): Socket | null => socket;

export const initSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const url = getBaseUrl();
  const token = getAuthToken();

  socket = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected to', url, 'Socket ID:', socket?.id);
    notifyStatus(true);
    addLog('system', 'Connected to WebSocket Server', { socketId: socket?.id, url });

    // Re-join active rooms if reconnecting
    if (currentJoinedMatchId) {
      joinMatchRoom(currentJoinedMatchId);
    }
    if (currentJoinedTournamentId) {
      joinTournamentRoom(currentJoinedTournamentId);
    }
  });

  socket.on('disconnect', (reason) => {
    console.warn('🔌 Socket disconnected:', reason);
    notifyStatus(false);
    addLog('system', 'Disconnected from WebSocket Server', { reason });
  });

  socket.on('connect_error', (err) => {
    console.error('🔌 Socket connection error:', err);
    notifyStatus(false);
    addLog('error', 'Connection Error', { message: err.message });
  });

  // Attach generic wildcard event logger for incoming events
  const broadcastEvents = [
    'RAID_RECORDED',
    'RAIDER_SELECTED',
    'raider_selected',
    'MATCH_SESSION_UPDATED',
    'FIVE_RAIDS_TOSS_RECORDED',
    'GOLDEN_RAID_TOSS_RECORDED',
    'GOLDEN_RAID_TEAM_UPDATED',
    'takeover_permission_requested',
    'takeover_permission_granted',
    'takeover_permission_denied'
  ];

  broadcastEvents.forEach((eventName) => {
    socket?.on(eventName, (payload) => {
      console.log(`📢 Socket Event Received [${eventName}]:`, payload);
      addLog(eventName, `Received ${eventName}`, payload, 'in');
      notifyEventListeners(eventName, payload);
    });
  });

  return socket;
};

export const joinMatchRoom = (matchId: number | string) => {
  const matchIdStr = String(matchId);
  const s = initSocket();
  if (currentJoinedMatchId && currentJoinedMatchId !== matchIdStr) {
    leaveMatchRoom(currentJoinedMatchId);
  }
  currentJoinedMatchId = matchIdStr;
  s.emit('JOIN_MATCH', { match_id: matchIdStr });
  addLog('JOIN_MATCH', `Subscribed to match_${matchIdStr}`, { match_id: matchIdStr }, 'out');
};

export const leaveMatchRoom = (matchId: number | string) => {
  const matchIdStr = String(matchId);
  if (socket && socket.connected) {
    socket.emit('LEAVE_MATCH', { match_id: matchIdStr });
    addLog('LEAVE_MATCH', `Unsubscribed from match_${matchIdStr}`, { match_id: matchIdStr }, 'out');
  }
  if (currentJoinedMatchId === matchIdStr) {
    currentJoinedMatchId = null;
  }
};

export const joinTournamentRoom = (tournamentId: number | string) => {
  const tourIdStr = String(tournamentId);
  const s = initSocket();
  if (currentJoinedTournamentId && currentJoinedTournamentId !== tourIdStr) {
    leaveTournamentRoom(currentJoinedTournamentId);
  }
  currentJoinedTournamentId = tourIdStr;
  s.emit('JOIN_TOURNAMENT', { tournament_id: tourIdStr });
  addLog('JOIN_TOURNAMENT', `Subscribed to tournament_${tourIdStr}`, { tournament_id: tourIdStr }, 'out');
};

export const leaveTournamentRoom = (tournamentId: number | string) => {
  const tourIdStr = String(tournamentId);
  if (socket && socket.connected) {
    socket.emit('LEAVE_TOURNAMENT', { tournament_id: tourIdStr });
    addLog('LEAVE_TOURNAMENT', `Unsubscribed from tournament_${tourIdStr}`, { tournament_id: tourIdStr }, 'out');
  }
  if (currentJoinedTournamentId === tourIdStr) {
    currentJoinedTournamentId = null;
  }
};

export const joinGlobalMatches = () => {
  const s = initSocket();
  s.emit('JOIN_GLOBAL_MATCHES');
  addLog('JOIN_GLOBAL_MATCHES', 'Subscribed to global live matches ticker', {}, 'out');
};

export const subscribeLogs = (listener: LogListener) => {
  logListeners.add(listener);
  return () => {
    logListeners.delete(listener);
  };
};

export const subscribeStatus = (listener: StatusListener) => {
  statusListeners.add(listener);
  if (socket) {
    listener(socket.connected);
  }
  return () => {
    statusListeners.delete(listener);
  };
};

export const subscribeEvents = (listener: EventListener) => {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
};

const notifyStatus = (connected: boolean) => {
  statusListeners.forEach((l) => l(connected));
};

const notifyEventListeners = (event: string, payload: any) => {
  eventListeners.forEach((l) => l(event, payload));
};

const addLog = (event: string, title: string, payload: any, direction: 'in' | 'out' = 'in') => {
  const log: SocketLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString(),
    event: event || title,
    payload,
    direction
  };
  logListeners.forEach((l) => l(log));
};
