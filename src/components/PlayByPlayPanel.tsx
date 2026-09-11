import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Zap,
  Shield,
  Clock,
  RotateCw,
  Flame,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Radio,
  ArrowRight,
  Award
} from 'lucide-react';
import { fetchPlayByPlay } from '../services/api';
import { subscribeEvents } from '../services/socket';
import type { PlayByPlayData, PlayByPlayEvent } from '../types';
import { TeamLogo, PlayerAvatar } from './TeamLogo';

interface PlayByPlayPanelProps {
  matchId: number | string;
}

interface KnownPlayer {
  name: string;
  jerseyNo: number | string;
  role: 'raider' | 'defender';
}

const getRaiderJerseyNo = (
  evt: PlayByPlayEvent,
  allMatchPlayers?: Map<string, number | string>
): number | string | null | undefined => {
  if (evt.raider?.jersey_no != null && evt.raider.jersey_no !== '') {
    return evt.raider.jersey_no;
  }
  const microPlayer = evt.raid_events?.find(
    (m) => (m.player?.id === evt.raider?.id || m.type === 'raid_start') && m.player?.jersey_no != null
  );
  if (microPlayer?.player?.jersey_no != null && microPlayer.player.jersey_no !== '') {
    return microPlayer.player.jersey_no;
  }
  if (evt.raider?.name && allMatchPlayers) {
    const trimmed = evt.raider.name.trim();
    if (allMatchPlayers.has(trimmed)) return allMatchPlayers.get(trimmed);
    const lower = trimmed.toLowerCase();
    for (const [k, v] of allMatchPlayers.entries()) {
      if (k.toLowerCase() === lower) return v;
    }
  }
  return null;
};

const getEventPlayers = (
  evt: PlayByPlayEvent,
  micro?: any,
  allMatchPlayers?: Map<string, number | string>
): KnownPlayer[] => {
  const map = new Map<string, KnownPlayer>();

  const add = (
    p?: { name?: string; jersey_no?: number | string | null; id?: number | string } | null,
    role: 'raider' | 'defender' = 'defender'
  ) => {
    if (!p?.name) return;
    const name = p.name.trim();
    if (!name) return;

    let jerseyNo = p.jersey_no;
    if (jerseyNo == null || jerseyNo === '') {
      if (allMatchPlayers) {
        jerseyNo = allMatchPlayers.get(name);
        if (jerseyNo == null) {
          const lower = name.toLowerCase();
          for (const [k, v] of allMatchPlayers.entries()) {
            if (k.toLowerCase() === lower) {
              jerseyNo = v;
              break;
            }
          }
        }
      }
    }

    if (jerseyNo != null && jerseyNo !== '') {
      map.set(name.toLowerCase(), {
        name,
        jerseyNo,
        role
      });
    }
  };

  // 1. Raider
  const rJersey = getRaiderJerseyNo(evt, allMatchPlayers);
  if (evt.raider?.name) {
    add({ name: evt.raider.name, jersey_no: rJersey }, 'raider');
  }

  // 2. Event defenders
  (evt.tacklers || []).forEach((d) => add(d, 'defender'));
  (evt.touched_defenders || []).forEach((d) => add(d, 'defender'));
  (evt.self_out_defenders || []).forEach((d) => add(d, 'defender'));

  const defGroup = (evt as any).defenders;
  if (defGroup) {
    (defGroup.tacklers || []).forEach((d: any) => add(d, 'defender'));
    (defGroup.touched_defenders || []).forEach((d: any) => add(d, 'defender'));
    (defGroup.self_out_defenders || []).forEach((d: any) => add(d, 'defender'));
  }

  // 3. Raid micro events
  (evt.raid_events || []).forEach((m: any) => {
    (m.defenders || []).forEach((d: any) => add(d, 'defender'));
    (m.tacklers || []).forEach((d: any) => add(d, 'defender'));
    if (m.player) {
      const isRaider =
        m.player.id === evt.raider?.id ||
        (evt.raider?.name && m.player.name?.trim().toLowerCase() === evt.raider.name.trim().toLowerCase()) ||
        m.type === 'raid_start';
      add(m.player, isRaider ? 'raider' : 'defender');
    }
  });

  // 4. Current micro event if specified
  if (micro) {
    (micro.defenders || []).forEach((d: any) => add(d, 'defender'));
    (micro.tacklers || []).forEach((d: any) => add(d, 'defender'));
    if (micro.player) {
      const isRaider =
        micro.player.id === evt.raider?.id ||
        (evt.raider?.name && micro.player.name?.trim().toLowerCase() === evt.raider.name.trim().toLowerCase()) ||
        micro.type === 'raid_start';
      add(micro.player, isRaider ? 'raider' : 'defender');
    }
  }

  // 5. Fallback: all match players mapped to role in this event
  if (allMatchPlayers) {
    for (const [knownName, jNo] of allMatchPlayers.entries()) {
      const lower = knownName.toLowerCase();
      if (!map.has(lower)) {
        const isRaider = evt.raider?.name && lower === evt.raider.name.trim().toLowerCase();
        map.set(lower, {
          name: knownName,
          jerseyNo: jNo,
          role: isRaider ? 'raider' : 'defender'
        });
      }
    }
  }

  return Array.from(map.values());
};

const renderTextWithPlayerJerseys = (text: string, players: KnownPlayer[]) => {
  if (!text) return null;
  if (!players || players.length === 0) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const relevant = players.filter((p) => lowerText.includes(p.name.toLowerCase()));
  if (relevant.length === 0) {
    return <>{text}</>;
  }

  // Sort by length descending to match longer names first
  relevant.sort((a, b) => b.name.length - a.name.length);

  const escapedNames = relevant.map((p) => p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = new RegExp(`((?:#\\s*\\d+\\s+)?\\b(?:${escapedNames})\\b)`, 'gi');

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, idx) => {
        const cleanName = part.replace(/^#\s*\d+\s+/, '').trim().toLowerCase();
        const matched = relevant.find((p) => p.name.toLowerCase() === cleanName);
        if (matched) {
          const isRaider = matched.role === 'raider';
          return (
            <span key={`p-${idx}`} className="pbp-micro-player-wrap">
              <span className={isRaider ? 'pbp-raider-jersey' : 'pbp-defender-jersey'}>
                #{matched.jerseyNo}
              </span>
              {matched.name}
            </span>
          );
        }
        return <React.Fragment key={`t-${idx}`}>{part}</React.Fragment>;
      })}
    </>
  );
};

const renderRaiderTitle = (evt: PlayByPlayEvent, allMatchPlayers?: Map<string, number | string>) => {
  const title = evt.title || '';
  const players = getEventPlayers(evt, undefined, allMatchPlayers);
  const lowerTitle = title.toLowerCase();
  const hasPlayerInTitle = players.some((p) => lowerTitle.includes(p.name.toLowerCase()));

  if (hasPlayerInTitle) {
    return renderTextWithPlayerJerseys(title, players);
  }

  const jerseyNo = getRaiderJerseyNo(evt, allMatchPlayers);
  if (jerseyNo != null && jerseyNo !== '' && !title.trim().startsWith('#') && !title.includes(`#${jerseyNo}`)) {
    return (
      <>
        <span className="pbp-raider-jersey">#{jerseyNo}</span>
        {title}
      </>
    );
  }

  return <>{title}</>;
};

const renderEventSubtitle = (evt: PlayByPlayEvent, allMatchPlayers?: Map<string, number | string>) => {
  const subtitle = evt.subtitle;
  if (!subtitle) return null;

  const players = getEventPlayers(evt, undefined, allMatchPlayers);
  const defendersPrefix = 'Defenders: ';
  if (subtitle.startsWith(defendersPrefix)) {
    const listStr = subtitle.slice(defendersPrefix.length);
    return (
      <>
        <span className="pbp-subtitle-label">Defenders: </span>
        {renderTextWithPlayerJerseys(listStr, players)}
      </>
    );
  }

  return renderTextWithPlayerJerseys(subtitle, players);
};

const renderMicroEventDesc = (
  micro: any,
  evt: PlayByPlayEvent,
  allMatchPlayers?: Map<string, number | string>
) => {
  const desc = micro.description || '';
  if (!desc) return null;

  const players = getEventPlayers(evt, micro, allMatchPlayers);
  return renderTextWithPlayerJerseys(desc, players);
};

export const PlayByPlayPanel: React.FC<PlayByPlayPanelProps> = ({ matchId }) => {
  const [data, setData] = useState<PlayByPlayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'raid' | 'substitution' | 'card' | 'timeout' | 'review'>('all');
  const [teamFilter, setTeamFilter] = useState<'all' | 'team_a' | 'team_b'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEventIds, setExpandedEventIds] = useState<Set<number>>(new Set());
  const [hasNewEventsPulse, setHasNewEventsPulse] = useState<boolean>(false);

  // Fetch Play-by-Play Data
  const loadPlayByPlay = useCallback(async (isSilent = false) => {
    if (!matchId) return;
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetchPlayByPlay(matchId, {
        order
      });
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('[PlayByPlayPanel] Failed to fetch play-by-play:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [matchId, order]);

  // Initial load & order change
  useEffect(() => {
    loadPlayByPlay();
  }, [loadPlayByPlay]);

  // Reactive Socket Updates
  useEffect(() => {
    const unsub = subscribeEvents((event: string) => {
      if (['RAID_RECORDED', 'RAID_EDITED', 'MATCH_SESSION_UPDATED', 'GAME_PHASE_CHANGED', 'SUBSTITUTION_RECORDED'].includes(event)) {
        console.log(`[PlayByPlayPanel] Live event triggered reload: ${event}`);
        setHasNewEventsPulse(true);
        loadPlayByPlay(true);
        setTimeout(() => setHasNewEventsPulse(false), 3000);
      }
    });

    return () => {
      unsub();
    };
  }, [loadPlayByPlay]);

  // Toggle individual card accordion
  const toggleExpand = (eventId: number) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  // Toggle expand/collapse all
  const toggleExpandAll = (allIds: number[]) => {
    if (expandedEventIds.size === allIds.length) {
      setExpandedEventIds(new Set());
    } else {
      setExpandedEventIds(new Set(allIds));
    }
  };

  // Match-wide player jersey lookup
  const allMatchPlayers = useMemo(() => {
    const map = new Map<string, number | string>();
    if (!data?.events) return map;

    const add = (p?: { name?: string; jersey_no?: number | string | null } | null) => {
      if (p?.name && p.jersey_no != null && p.jersey_no !== '') {
        map.set(p.name.trim(), p.jersey_no);
      }
    };

    data.events.forEach((evt) => {
      add(evt.raider);
      add(evt.in_player);
      add(evt.out_player);
      add(evt.target_player);
      (evt.tacklers || []).forEach(add);
      (evt.touched_defenders || []).forEach(add);
      (evt.self_out_defenders || []).forEach(add);
      const defGroup = (evt as any).defenders;
      if (defGroup) {
        (defGroup.tacklers || []).forEach(add);
        (defGroup.touched_defenders || []).forEach(add);
        (defGroup.self_out_defenders || []).forEach(add);
      }
      (evt.raid_events || []).forEach((m: any) => {
        add(m.player);
        (m.defenders || []).forEach(add);
        (m.tacklers || []).forEach(add);
      });
    });

    return map;
  }, [data]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!data || !data.events) return [];

    return data.events.filter((evt) => {
      // Phase Filter
      if (phaseFilter !== 'all') {
        const p = evt.game_phase?.toLowerCase() || '';
        if (phaseFilter === 'first_half' && p !== 'first_half') return false;
        if (phaseFilter === 'second_half' && !(p === 'second_half' || p === 'half_time')) return false;
        if (phaseFilter === 'extra_time' && !p.includes('extra_time')) return false;
        if (phaseFilter === 'five_raids' && p !== 'five_raids') return false;
        if (phaseFilter === 'golden_raid' && p !== 'golden_raid') return false;
      }

      // Event Type Filter
      if (eventTypeFilter !== 'all') {
        if (evt.event_type !== eventTypeFilter) return false;
      }

      // Team Filter
      if (teamFilter !== 'all' && data.match?.teams) {
        const teamAId = data.match.teams.team_a?.id;
        const teamBId = data.match.teams.team_b?.id;
        const targetTeamId = teamFilter === 'team_a' ? teamAId : teamBId;

        if (evt.event_type === 'raid') {
          const raidingId = evt.raiding_team?.id;
          if (raidingId && targetTeamId && Number(raidingId) !== Number(targetTeamId)) {
            return false;
          }
        } else if (evt.team?.id) {
          if (targetTeamId && Number(evt.team.id) !== Number(targetTeamId)) {
            return false;
          }
        }
      }

      // Search query (raider name, defenders, titles, jersey)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanQ = q.replace(/^#/, '');
        const matchTitle = evt.title?.toLowerCase().includes(q);
        const matchSubtitle = evt.subtitle?.toLowerCase().includes(q);
        const matchRaider = evt.raider?.name?.toLowerCase().includes(q);
        const matchJersey = evt.raider?.jersey_no != null && String(evt.raider.jersey_no).toLowerCase().includes(cleanQ);
        const evtPlayers = getEventPlayers(evt, undefined, allMatchPlayers);
        const matchPlayerName = evtPlayers.some((p) => p.name.toLowerCase().includes(q));
        const matchPlayerJersey = evtPlayers.some((p) => String(p.jerseyNo).toLowerCase().includes(cleanQ));
        const matchNumber = evt.raid_number ? String(evt.raid_number).includes(cleanQ) : false;
        return matchTitle || matchSubtitle || matchRaider || matchJersey || matchPlayerName || matchPlayerJersey || matchNumber;
      }

      return true;
    });
  }, [data, phaseFilter, eventTypeFilter, teamFilter, searchQuery, allMatchPlayers]);

  // Phase Statistics
  const phaseStats = useMemo(() => {
    if (!data?.phases) return { first: 0, second: 0, extra: 0, tiebreaker: 0, total: 0 };
    const first = (data.phases.first_half || []).length;
    const second = (data.phases.second_half || []).length;
    const extra = (data.phases.extra_time_first_half || []).length + (data.phases.extra_time_second_half || []).length;
    const tiebreaker = (data.phases.five_raids || []).length + (data.phases.golden_raid || []).length;
    const total = data.events?.length || 0;
    return { first, second, extra, tiebreaker, total };
  }, [data]);

  // Event Type Counts
  const typeCounts = useMemo(() => {
    if (!data?.events) return { raids: 0, subs: 0, cards: 0, timeouts: 0, reviews: 0 };
    let raids = 0, subs = 0, cards = 0, timeouts = 0, reviews = 0;
    for (const e of data.events) {
      if (e.event_type === 'raid') raids++;
      else if (e.event_type === 'substitution') subs++;
      else if (e.event_type === 'card') cards++;
      else if (e.event_type === 'timeout') timeouts++;
      else if (e.event_type === 'review') reviews++;
    }
    return { raids, subs, cards, timeouts, reviews };
  }, [data]);

  if (isLoading && !data) {
    return (
      <div className="pbp-loading-container">
        <RotateCw className="spin-icon text-amber" size={28} />
        <div className="pbp-loading-text">Hydrating Live Play-by-Play Timeline...</div>
        <div className="pbp-loading-sub">Fetching raids, micro-events & running score progression</div>
      </div>
    );
  }

  if (!data || !data.events) {
    return (
      <div className="pbp-empty-container">
        <Clock size={36} className="pbp-empty-icon" />
        <div className="pbp-empty-title">No Play-by-Play Events Recorded Yet</div>
        <div className="pbp-empty-desc">
          Events will appear here as soon as the first raid is recorded on court.
        </div>
        <button className="pbp-refresh-btn" onClick={() => loadPlayByPlay()}>
          <RotateCw size={14} /> Refresh Match
        </button>
      </div>
    );
  }

  const { match } = data;
  const teamA = match.teams?.team_a;
  const teamB = match.teams?.team_b;
  const allFilteredIds = filteredEvents.map((e) => e.id);
  const isAllExpanded = filteredEvents.length > 0 && expandedEventIds.size === filteredEvents.length;

  return (
    <div className="pbp-wrapper">
      {/* 1. Header Banner & Match Recap Card */}
      <div className="pbp-banner-card">
        <div className="pbp-banner-top">
          <div className="pbp-banner-info">
            <span className="pbp-banner-tag">PLAY-BY-PLAY FEED</span>
            {hasNewEventsPulse && (
              <span className="pbp-pulse-tag">
                <span className="pbp-pulse-dot" /> NEW EVENT LIVE
              </span>
            )}
            <span className="pbp-phase-badge">
              {match.game_phase?.replace(/_/g, ' ').toUpperCase() || 'LIVE'}
            </span>
          </div>

          <div className="pbp-banner-actions">
            <button
              className="pbp-icon-action-btn"
              onClick={() => setOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              title={`Switch to ${order === 'desc' ? 'Chronological (Ascending)' : 'Latest First (Descending)'}`}
            >
              <ArrowUpDown size={14} />
              <span>{order === 'desc' ? 'Latest First' : 'Chronological'}</span>
            </button>

            <button
              className={`pbp-icon-action-btn ${isRefreshing ? 'refreshing' : ''}`}
              onClick={() => loadPlayByPlay(true)}
              title="Refresh timeline"
              disabled={isRefreshing}
            >
              <RotateCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Summary text */}
        <h2 className="pbp-summary-text">{match.summary_text}</h2>

        {/* Mini Scoreboard Bar */}
        <div className="pbp-mini-scorebug">
          <div className="pbp-team-cell left">
            <TeamLogo
              logoUrl={teamA?.logo_url}
              teamName={teamA?.name}
              className="pbp-mini-logo"
              fallbackClassName="pbp-mini-fallback-logo"
            />
            <div className="pbp-team-name-col">
              <span className="pbp-team-name">{teamA?.name || 'Team A'}</span>
              <span className="pbp-team-sub">Home</span>
            </div>
            <span className="pbp-team-score left">{teamA?.score ?? 0}</span>
          </div>

          <div className="pbp-scorebug-divider">
            <div className="pbp-vs-text">VS</div>
            <div className="pbp-clock-live">
              <Clock size={12} />
              <span>{match.status === 'completed' ? 'FINAL' : 'LIVE'}</span>
            </div>
          </div>

          <div className="pbp-team-cell right">
            <span className="pbp-team-score right">{teamB?.score ?? 0}</span>
            <div className="pbp-team-name-col right">
              <span className="pbp-team-name">{teamB?.name || 'Team B'}</span>
              <span className="pbp-team-sub">Away</span>
            </div>
            <TeamLogo
              logoUrl={teamB?.logo_url}
              teamName={teamB?.name}
              className="pbp-mini-logo"
              fallbackClassName="pbp-mini-fallback-logo"
            />
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="pbp-kpi-strip">
          <div className="pbp-kpi-item">
            <span className="pbp-kpi-label">TOTAL RAIDS</span>
            <span className="pbp-kpi-val text-amber">{typeCounts.raids}</span>
          </div>
          <div className="pbp-kpi-divider" />
          <div className="pbp-kpi-item">
            <span className="pbp-kpi-label">SUBSTITUTIONS</span>
            <span className="pbp-kpi-val text-defend">{typeCounts.subs}</span>
          </div>
          <div className="pbp-kpi-divider" />
          <div className="pbp-kpi-item">
            <span className="pbp-kpi-label">CARDS</span>
            <span className="pbp-kpi-val text-raid">{typeCounts.cards}</span>
          </div>
          <div className="pbp-kpi-divider" />
          <div className="pbp-kpi-item">
            <span className="pbp-kpi-label">TIMEOUTS</span>
            <span className="pbp-kpi-val text-dim">{typeCounts.timeouts}</span>
          </div>
          {typeCounts.reviews > 0 && (
            <>
              <div className="pbp-kpi-divider" />
              <div className="pbp-kpi-item">
                <span className="pbp-kpi-label">REVIEWS</span>
                <span className="pbp-kpi-val text-purple">{typeCounts.reviews}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Interactive Filter & Controls Toolbar */}
      <div className="pbp-toolbar">
        {/* Phase Filter Pills */}
        <div className="pbp-phase-pills">
          <button
            className={`pbp-phase-pill ${phaseFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPhaseFilter('all')}
          >
            All Phases <span className="pill-count">{phaseStats.total}</span>
          </button>
          <button
            className={`pbp-phase-pill ${phaseFilter === 'first_half' ? 'active' : ''}`}
            onClick={() => setPhaseFilter('first_half')}
          >
            1st Half <span className="pill-count">{phaseStats.first}</span>
          </button>
          <button
            className={`pbp-phase-pill ${phaseFilter === 'second_half' ? 'active' : ''}`}
            onClick={() => setPhaseFilter('second_half')}
          >
            2nd Half <span className="pill-count">{phaseStats.second}</span>
          </button>
          {phaseStats.extra > 0 && (
            <button
              className={`pbp-phase-pill ${phaseFilter === 'extra_time' ? 'active' : ''}`}
              onClick={() => setPhaseFilter('extra_time')}
            >
              Extra Time <span className="pill-count">{phaseStats.extra}</span>
            </button>
          )}
          {phaseStats.tiebreaker > 0 && (
            <button
              className={`pbp-phase-pill ${phaseFilter === 'five_raids' ? 'active' : ''}`}
              onClick={() => setPhaseFilter('five_raids')}
            >
              Tiebreaker <span className="pill-count">{phaseStats.tiebreaker}</span>
            </button>
          )}
        </div>

        {/* Secondary Filter Row */}
        <div className="pbp-filter-row">
          {/* Event Type Dropdown / Buttons */}
          <div className="pbp-type-pills">
            <button
              className={`pbp-subpill ${eventTypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setEventTypeFilter('all')}
            >
              All Events
            </button>
            <button
              className={`pbp-subpill ${eventTypeFilter === 'raid' ? 'active' : ''}`}
              onClick={() => setEventTypeFilter('raid')}
            >
              <Zap size={13} /> Raids ({typeCounts.raids})
            </button>
            <button
              className={`pbp-subpill ${eventTypeFilter === 'substitution' ? 'active' : ''}`}
              onClick={() => setEventTypeFilter('substitution')}
            >
              <Users size={13} /> Subs ({typeCounts.subs})
            </button>
            {(typeCounts.cards > 0 || typeCounts.timeouts > 0) && (
              <button
                className={`pbp-subpill ${eventTypeFilter === 'card' || eventTypeFilter === 'timeout' ? 'active' : ''}`}
                onClick={() => setEventTypeFilter((prev) => (prev === 'card' ? 'timeout' : 'card'))}
              >
                <AlertTriangle size={13} /> Cards & Breaks
              </button>
            )}
          </div>

          {/* Search Input & Expand All Toggle */}
          <div className="pbp-search-and-toggle">
            <div className="pbp-search-box">
              <Search size={14} className="pbp-search-icon" />
              <input
                type="text"
                placeholder="Search raider, defender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pbp-search-input"
              />
              {searchQuery && (
                <button className="pbp-search-clear" onClick={() => setSearchQuery('')}>
                  ×
                </button>
              )}
            </div>

            <button
              className="pbp-expand-all-btn"
              onClick={() => toggleExpandAll(allFilteredIds)}
              title="Expand or collapse micro-event details"
            >
              {isAllExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Timeline Feed Stream */}
      <div className="pbp-timeline-wrapper">
        <div className="pbp-timeline-line" />

        {filteredEvents.length === 0 ? (
          <div className="pbp-no-results">
            <Filter size={24} className="text-dim" />
            <p>No events match the current filter criteria.</p>
            <button
              className="pbp-clear-filter-btn"
              onClick={() => {
                setPhaseFilter('all');
                setEventTypeFilter('all');
                setTeamFilter('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((evt, index) => {
            const isExpanded = expandedEventIds.has(evt.id);
            const isRaid = evt.event_type === 'raid';
            const isSubstitution = evt.event_type === 'substitution';
            const isCard = evt.event_type === 'card';
            const isTimeout = evt.event_type === 'timeout';
            const isReview = evt.event_type === 'review';

            // Distinct Outcome Styling for Raids
            const isSuccessful = evt.outcome === 'successful';
            const isUnsuccessful = evt.outcome === 'unsuccessful' || evt.outcome === 'tackled' || evt.outcome === 'supertackled';
            const isEmpty = evt.outcome === 'empty';

            // Badges
            const isSuperRaid = evt.badges.includes('SUPER RAID');
            const isSuperTackle = evt.badges.includes('SUPER TACKLE');
            const isDoOrDie = evt.badges.includes('DO OR DIE');
            const isAllOut = evt.badges.includes('ALL OUT');
            const isPowerPlay = evt.badges.includes('POWER PLAY');

            return (
              <div
                key={`${evt.event_type}-${evt.id}-${index}`}
                className={`pbp-event-node ${evt.event_type} ${isExpanded ? 'is-expanded' : ''} ${
                  isSuccessful ? 'outcome-success' : isUnsuccessful ? 'outcome-tackled' : isEmpty ? 'outcome-empty' : ''
                }`}
              >
                {/* Timeline Clock & Node Bullet */}
                <div className="pbp-node-marker">
                  <div className={`pbp-node-bullet ${evt.event_type}`}>
                    {isRaid ? (
                      isSuperRaid ? <Flame size={14} className="node-icon-glow-gold" /> :
                      isSuperTackle ? <Shield size={14} className="node-icon-glow-cyan" /> :
                      <Zap size={14} />
                    ) : isSubstitution ? (
                      <Users size={13} />
                    ) : isCard ? (
                      <AlertTriangle size={13} />
                    ) : isTimeout ? (
                      <Clock size={13} />
                    ) : (
                      <Radio size={13} />
                    )}
                  </div>
                  <span className="pbp-node-clock">{evt.clock_formatted || evt.clock || '00:00'}</span>
                </div>

                {/* Event Card Content */}
                <div className="pbp-card">
                  {/* Card Header */}
                  <div className="pbp-card-header" onClick={() => isRaid && toggleExpand(evt.id)}>
                    <div className="pbp-header-left">
                      {/* Event Sequence / Raid Number */}
                      {evt.raid_number && (
                        <span className="pbp-raid-no-tag">RAID #{evt.raid_number}</span>
                      )}

                      {/* Team Logo / Badge */}
                      {evt.raiding_team ? (
                        <div className="pbp-team-pill">
                          <TeamLogo
                            logoUrl={evt.raiding_team.logo_url}
                            teamName={evt.raiding_team.name}
                            className="pbp-card-team-logo"
                            fallbackClassName="pbp-card-team-fallback"
                          />
                          <span className="pbp-team-tag-name">{evt.raiding_team.short_name || evt.raiding_team.name}</span>
                        </div>
                      ) : evt.team ? (
                        <div className="pbp-team-pill">
                          <TeamLogo
                            logoUrl={evt.team.logo_url}
                            teamName={evt.team.name}
                            className="pbp-card-team-logo"
                            fallbackClassName="pbp-card-team-fallback"
                          />
                          <span className="pbp-team-tag-name">{evt.team.short_name || evt.team.name}</span>
                        </div>
                      ) : null}

                      {/* Dynamic Action Badges */}
                      <div className="pbp-badges-wrap">
                        {isDoOrDie && <span className="pbp-badge badge-dod"><Flame size={10} /> DO OR DIE</span>}
                        {isSuperRaid && <span className="pbp-badge badge-super-raid"><Award size={10} /> SUPER RAID</span>}
                        {isSuperTackle && <span className="pbp-badge badge-super-tackle"><Shield size={10} /> SUPER TACKLE</span>}
                        {isAllOut && <span className="pbp-badge badge-all-out">ALL OUT</span>}
                        {isPowerPlay && <span className="pbp-badge badge-power-play">POWER PLAY</span>}
                        {isCard && <span className={`pbp-badge badge-${evt.card_type || 'yellow'}`}>{(evt.card_type || 'YELLOW').toUpperCase()} CARD</span>}
                        {isSubstitution && <span className="pbp-badge badge-sub">SUBSTITUTION</span>}
                        {isTimeout && <span className="pbp-badge badge-timeout">TIMEOUT</span>}
                        {isReview && <span className="pbp-badge badge-review">REVIEW</span>}
                      </div>
                    </div>

                    {/* Running Score Pill */}
                    {evt.score && (
                      <div className="pbp-running-score" title="Cumulative score after this event">
                        <span className="pbp-score-val team-a">{evt.score.team_a}</span>
                        <span className="pbp-score-dash">-</span>
                        <span className="pbp-score-val team-b">{evt.score.team_b}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="pbp-card-body" onClick={() => isRaid && toggleExpand(evt.id)}>
                    {isRaid ? (
                      <div className="pbp-raid-main">
                        <div className="pbp-raid-title-row">
                          {/* Raider Avatar & Title */}
                          <div className="pbp-raider-block">
                            <PlayerAvatar
                              imageUrl={evt.raider?.image_url}
                              playerName={evt.raider?.name}
                              jerseyNo={evt.raider?.jersey_no}
                              className="pbp-raider-avatar"
                              fallbackClassName="pbp-raider-avatar-fallback"
                            />
                            <div className="pbp-raider-meta">
                              <h3 className="pbp-event-title">{renderRaiderTitle(evt, allMatchPlayers)}</h3>
                              {evt.subtitle && <div className="pbp-event-subtitle">{renderEventSubtitle(evt, allMatchPlayers)}</div>}
                            </div>
                          </div>

                          {/* Points Summary Badge */}
                          <div className="pbp-points-badge-col">
                            {isSuccessful && (
                              <span className="pbp-point-tag success">
                                +{(evt.points?.raiding_team_points ?? (evt.points?.touch_points || 0) + (evt.points?.bonus_points || 0))} PTS
                              </span>
                            )}
                            {isUnsuccessful && (
                              <span className="pbp-point-tag tackle">
                                +{(evt.points?.defending_team_points ?? (evt.points?.tackle_points || 0) + (evt.points?.super_tackle_points || 0) + 1)} DEF PTS
                              </span>
                            )}
                            {isEmpty && (
                              <span className="pbp-point-tag empty">0 PTS</span>
                            )}
                          </div>
                        </div>

                        {/* Points breakdown bar if multiple points scored */}
                        {isRaid && (evt.points?.touch_points || evt.points?.bonus_points || evt.points?.all_out_points || evt.points?.super_tackle_points) ? (
                          <div className="pbp-points-breakdown">
                            {(evt.points?.touch_points || 0) > 0 && (
                              <span className="pbp-subpoint-item">
                                Touch: <b>+{evt.points.touch_points}</b>
                              </span>
                            )}
                            {(evt.points?.bonus_points || 0) > 0 && (
                              <span className="pbp-subpoint-item">
                                Bonus: <b>+{evt.points.bonus_points}</b>
                              </span>
                            )}
                            {(evt.points?.tackle_points || 0) > 0 && (
                              <span className="pbp-subpoint-item">
                                Tackle: <b>+{evt.points.tackle_points}</b>
                              </span>
                            )}
                            {(evt.points?.super_tackle_points || 0) > 0 && (
                              <span className="pbp-subpoint-item">
                                Super Tackle: <b>+{evt.points.super_tackle_points}</b>
                              </span>
                            )}
                            {(evt.points?.all_out_points || 0) > 0 && (
                              <span className="pbp-subpoint-item text-purple">
                                All Out: <b>+{evt.points.all_out_points}</b>
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : isSubstitution ? (
                      /* Substitution Card Presentation */
                      <div className="pbp-sub-layout">
                        <div className="pbp-sub-player in">
                          <div className="pbp-sub-indicator in">IN</div>
                          <PlayerAvatar
                            imageUrl={evt.in_player?.image_url}
                            playerName={evt.in_player?.name}
                            jerseyNo={evt.in_player?.jersey_no}
                            className="pbp-sub-avatar"
                            fallbackClassName="pbp-sub-avatar-fallback in"
                          />
                          <div className="pbp-sub-player-info">
                            <span className="pbp-sub-name">
                              {evt.in_player?.jersey_no != null && evt.in_player.jersey_no !== '' && (
                                <span className="pbp-defender-jersey">#{evt.in_player.jersey_no}</span>
                              )}
                              {evt.in_player?.name || 'In Player'}
                            </span>
                            <span className="pbp-sub-meta">Substitution IN</span>
                          </div>
                        </div>

                        <div className="pbp-sub-arrow">
                          <ArrowRight size={18} />
                        </div>

                        <div className="pbp-sub-player out">
                          <div className="pbp-sub-indicator out">OUT</div>
                          <PlayerAvatar
                            imageUrl={evt.out_player?.image_url}
                            playerName={evt.out_player?.name}
                            jerseyNo={evt.out_player?.jersey_no}
                            className="pbp-sub-avatar"
                            fallbackClassName="pbp-sub-avatar-fallback out"
                          />
                          <div className="pbp-sub-player-info">
                            <span className="pbp-sub-name">
                              {evt.out_player?.jersey_no != null && evt.out_player.jersey_no !== '' && (
                                <span className="pbp-raider-jersey">#{evt.out_player.jersey_no}</span>
                              )}
                              {evt.out_player?.name || 'Out Player'}
                            </span>
                            <span className="pbp-sub-meta">Substitution OUT</span>
                          </div>
                        </div>
                      </div>
                    ) : isCard ? (
                      /* Disciplinary Card Layout */
                      <div className="pbp-card-layout">
                        <div className={`pbp-card-graphic ${evt.card_type || 'yellow'}`} />
                        <div className="pbp-card-meta">
                          <h3 className="pbp-event-title">{renderRaiderTitle(evt, allMatchPlayers)}</h3>
                          {evt.target_player && (
                            <div className="pbp-card-target">
                              Target:{' '}
                              {evt.target_player.jersey_no != null && evt.target_player.jersey_no !== '' && (
                                <span className="pbp-defender-jersey">#{evt.target_player.jersey_no}</span>
                              )}
                              {evt.target_player.name}
                            </div>
                          )}
                          {evt.target_staff && (
                            <div className="pbp-card-target">
                              Staff: {evt.target_staff.name} ({evt.target_staff.role})
                            </div>
                          )}
                        </div>
                      </div>
                    ) : isTimeout ? (
                      /* Timeout Card Layout */
                      <div className="pbp-timeout-layout">
                        <Clock size={20} className="pbp-timeout-icon" />
                        <div>
                          <h3 className="pbp-event-title">{renderRaiderTitle(evt, allMatchPlayers)}</h3>
                          <div className="pbp-event-subtitle">Official tactical stoppage</div>
                        </div>
                      </div>
                    ) : (
                      /* Review Card Layout */
                      <div className="pbp-review-layout">
                        <Radio size={20} className="pbp-review-icon" />
                        <div>
                          <h3 className="pbp-event-title">{renderRaiderTitle(evt, allMatchPlayers)}</h3>
                          {evt.subtitle && <div className="pbp-event-subtitle">{renderEventSubtitle(evt, allMatchPlayers)}</div>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Micro-Events Accordion Trigger (For raids with detailed steps) */}
                  {isRaid && evt.raid_events && evt.raid_events.length > 0 && (
                    <div className="pbp-card-footer">
                      <button
                        className="pbp-accordion-toggle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(evt.id);
                        }}
                      >
                        <span>{isExpanded ? 'Hide Raid Micro-Events' : `View ${evt.raid_events.length} Micro-Events`}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {isExpanded && (
                        <div className="pbp-micro-events-drawer">
                          <div className="pbp-micro-events-list">
                            {evt.raid_events.map((micro, mIdx) => (
                              <div key={`micro-${evt.id}-${mIdx}`} className="pbp-micro-item">
                                <div className="pbp-micro-step-dot" />
                                <div className="pbp-micro-content">
                                  <span className="pbp-micro-desc">{renderMicroEventDesc(micro, evt, allMatchPlayers)}</span>
                                  {micro.points ? (
                                    <span className="pbp-micro-pts">+{micro.points} pt{micro.points > 1 ? 's' : ''}</span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer if total records exceed page */}
      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="pbp-pagination">
          <span className="pbp-pagination-info">
            Showing page {data.pagination.currentPage} of {data.pagination.totalPages} ({data.pagination.totalRecords} total events)
          </span>
        </div>
      )}
    </div>
  );
};
