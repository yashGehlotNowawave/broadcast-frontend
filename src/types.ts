export interface Tournament {
  id: number;
  name: string;
  source?: string;
  status?: string;
  logo_url?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_deleted?: boolean;
}

export interface MatchSessionSummary {
  id: number;
  status: string;
  game_phase: string;
  toss_winner_team_id?: number;
  toss_choice?: string;
  toss_court_choice?: string;
  completed_squad_selected?: boolean;
  toss_completed?: boolean;
  raid_started?: boolean;
  team_a_score: number;
  team_b_score: number;
  extra_time_team_a_score?: number;
  extra_time_team_b_score?: number;
  five_raids_team_a_score: number;
  five_raids_team_b_score: number;
  golden_raid_team_a_score: number;
  golden_raid_team_b_score: number;
  total_team_a_score: number;
  total_team_b_score: number;
  selected_raider_id?: number | null;
  current_raiding_team_id?: number | null;
}

export interface MatchSummary {
  id: number;
  external_fixture_id?: number | null;
  match_number?: number | null;
  source?: string;
  tournament_id: number;
  team_a_id: number;
  team_b_id: number;
  team_a_placeholder: string;
  team_b_placeholder: string;
  round_number?: number;
  round_name?: string | null;
  stage?: string;
  group_number?: number;
  scheduled_at?: string;
  venue_name?: string;
  status: string;
  team1_logo?: string | null;
  team2_logo?: string | null;
  final_team_a_score?: number | null;
  final_team_b_score?: number | null;
  session?: MatchSessionSummary | null;
}

export interface Player {
  id?: number;
  player_id?: number;
  full_name?: string;
  name?: string;
  jersey_no?: string;
  position?: string;
  image_url?: string;
  player_pool?: string;
  card_type?: 'green' | 'yellow' | 'red' | string | null;
  suspended_until?: string | null;
  suspension_remaining_seconds?: number | null;
}

export interface TeamScoreState {
  id?: number;
  team_id?: number;
  name?: string;
  team_name?: string;
  team_code?: string;
  logo_url?: string;
  score?: number;
  regulation_score?: number;
  extra_time_score?: number;
  five_raids_score?: number;
  golden_raid_score?: number;
  total_score?: number;
  timeouts_remaining?: number;
  reviews_remaining?: number;
  mat?: Player[];
  bench?: Player[];
  substitute?: Player[];
  court_players?: Player[];
  bench_players?: Player[];
  out_players?: Player[];
  suspended_players?: Player[];
}

export interface LastRaid {
  raid_number: number;
  raider_id?: number;
  raider_name?: string;
  outcome?: string;
  points_scored?: number;
  touch_points?: number;
  bonus_points?: number;
  tackle_points?: number;
  super_tackle_points?: number;
  all_out_points?: number;
  is_do_or_die?: boolean;
  is_super_raid?: boolean;
}

export interface MatchStatusData {
  match_id?: number | string;
  tournament_id?: number;
  game_phase?: string;
  status?: string;
  current_raiding_team_id?: number | null;
  selected_raider_id?: number | null;
  selected_raider_name?: string | null;
  is_do_or_die_raid?: boolean;
  session?: MatchSessionSummary | null;
  team_a?: TeamScoreState;
  team_b?: TeamScoreState;
  last_raid?: LastRaid | null;
  update_message?: string;
  clock?: string;
  remaining_time?: string;
  match_time?: string;
}

export interface SocketLog {
  id: string;
  timestamp: string;
  event: string;
  payload: any;
  direction: 'in' | 'out';
}

// --------------------------------------------------------------------------
// Detailed Statistics Interfaces for Live Broadcasting Pilot
// --------------------------------------------------------------------------

export interface PlayerStats {
  player_id: number;
  player_name: string;
  jersey_no: number | null;
  position: string | null;
  image_url: string | null;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  raids: number;
  successful_raids: number;
  unsuccessful_raids: number;
  empty_raids: number;
  touch_points: number;
  bonus_points: number;
  total_raid_points: number;
  total_tackles: number;
  successful_tackles: number;
  unsuccessful_tackles: number;
  tackle_points: number;
  super_tackles: number;
  total_points: number;
  super_raids?: number;
  super_ten?: boolean;
  high_five?: boolean;
  matches_played?: number;
  super_tens_count?: number;
  high_fives_count?: number;
  green_cards?: number;
  yellow_cards?: number;
  red_cards?: number;
}

export interface TeamMatchStats {
  team_id: number;
  team_name: string;
  team_logo: string | null;
  number_of_raids: number;
  number_of_tackles: number;
  raid_points: number;
  tackle_points: number;
  extras: number;
  touch_points: number;
  bonus_points: number;
  successful_raids: number;
  unsuccessful_raids: number;
  empty_raids: number;
  super_raids: number;
  successful_tackles: number;
  unsuccessful_tackles: number;
  super_tackles: number;
  all_out_points: number;
  total_score: number;
}

export interface TopRaider {
  rank: number;
  player_id: number;
  player_name: string;
  jersey_no: number | null;
  position?: string | null;
  image_url: string | null;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  matches_played?: number;
  raids: number;
  successful_raids: number;
  unsuccessful_raids: number;
  empty_raids?: number;
  touch_points: number;
  bonus_points: number;
  total_raid_points: number;
  super_raids: number;
  super_tens: number;
}

export interface TopDefender {
  rank: number;
  player_id: number;
  player_name: string;
  jersey_no: number | null;
  position?: string | null;
  image_url: string | null;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  matches_played?: number;
  total_tackles: number;
  successful_tackles: number;
  unsuccessful_tackles: number;
  tackle_points: number;
  super_tackles: number;
  high_fives: number;
}

export interface TopPerformersData {
  top_raiders: TopRaider[];
  top_defenders: TopDefender[];
}

export interface MatchStatsData {
  match_id: number;
  external_fixture_id: number | null;
  tournament_id: number;
  match_number: number | null;
  status: string;
  game_phase: string;
  scheduled_at: string | null;
  venue_name: string | null;
  team_stats: {
    team_a: TeamMatchStats;
    team_b: TeamMatchStats;
  };
  player_stats: PlayerStats[];
  top_performers: TopPerformersData;
}

export interface TournamentTeamStats {
  team_id: number;
  team_name: string;
  team_logo: string | null;
  matches_played: number;
  number_of_raids: number;
  number_of_tackles: number;
  raid_points: number;
  tackle_points: number;
  extras: number;
  successful_raids: number;
  unsuccessful_raids: number;
  empty_raids: number;
  successful_tackles: number;
  unsuccessful_tackles: number;
  super_tackles: number;
  super_raids: number;
  all_out_points: number;
  total_points: number;
}

export interface TournamentStatsData {
  tournament_id: number;
  external_tournament_id: number | null;
  tournament_name: string;
  status: string;
  tournament_stats: {
    total_raids: number;
    total_tackles: number;
    total_raid_points: number;
    total_tackle_points: number;
    total_matches: number;
    total_points: number;
    total_successful_raids: number;
    total_unsuccessful_raids: number;
    total_empty_raids: number;
    total_touch_points: number;
    total_bonus_points: number;
    total_successful_tackles: number;
    total_unsuccessful_tackles: number;
    total_super_tackles: number;
    total_super_raids: number;
    total_all_out_points: number;
    total_extras: number;
  };
  team_stats: TournamentTeamStats[];
  top_performers: TopPerformersData;
}

// --------------------------------------------------------------------------
// Play-by-Play and Raid-by-Raid Timeline Types
// --------------------------------------------------------------------------

export interface PlayByPlayPlayerInfo {
  id: number;
  name: string;
  jersey_no?: number | string | null;
  image_url?: string | null;
  role?: string;
  position?: string | null;
}

export interface PlayByPlayTeamInfo {
  id: number;
  name: string;
  short_name?: string;
  logo_url?: string | null;
  score?: number;
}

export interface PlayByPlayMicroEvent {
  type: string;
  description: string;
  points?: number;
  player?: {
    id: number;
    name: string;
    jersey_no?: number | string | null;
  } | null;
  defenders?: Array<{
    id: number;
    name: string;
    jersey_no?: number | string | null;
  }>;
  tacklers?: Array<{
    id: number;
    name: string;
    jersey_no?: number | string | null;
    role?: string;
  }>;
  team?: {
    id: number;
    name: string;
  } | null;
  is_super_tackle?: boolean;
}

export interface PlayByPlayPoints {
  touch_points?: number;
  bonus_points?: number;
  tackle_points?: number;
  super_tackle_points?: number;
  all_out_points?: number;
  power_play_points?: number;
  technical_points?: number;
  raiding_team_points?: number;
  defending_team_points?: number;
  team_a_points: number;
  team_b_points: number;
}

export interface PlayByPlayEvent {
  event_type: 'raid' | 'substitution' | 'timeout' | 'card' | 'review';
  id: number;
  sequence_number?: number | null;
  game_phase: string;
  clock: string;
  clock_seconds: number;
  clock_formatted: string;
  created_at: number;
  score: {
    team_a: number;
    team_b: number;
  };
  formatted_score?: string | null;
  title: string;
  subtitle?: string | null;
  badges: string[];
  points: PlayByPlayPoints;

  // Raid specific fields
  raid_number?: number;
  raiding_team?: PlayByPlayTeamInfo;
  defending_team?: PlayByPlayTeamInfo;
  raider?: PlayByPlayPlayerInfo;
  outcome?: 'successful' | 'unsuccessful' | 'empty' | string;
  raid_type?: 'normal' | 'do_or_die' | string;
  touched_defenders?: PlayByPlayPlayerInfo[];
  tacklers?: PlayByPlayPlayerInfo[];
  self_out_defenders?: PlayByPlayPlayerInfo[];
  raid_events?: PlayByPlayMicroEvent[];

  // Substitution specific fields
  in_player?: PlayByPlayPlayerInfo;
  out_player?: PlayByPlayPlayerInfo;
  team?: PlayByPlayTeamInfo;

  // Card specific fields
  card_type?: string;
  target_player?: PlayByPlayPlayerInfo;
  target_staff?: { id: number; name: string; role: string } | null;

  // Review specific fields
  review_outcome?: string;
}

export interface PlayByPlayMatchInfo {
  id: number;
  external_fixture_id?: number | string | null;
  match_number?: number | null;
  tournament_id: number;
  tournament_name?: string | null;
  status: string;
  game_phase: string;
  scheduled_at?: string | null;
  venue_name?: string | null;
  summary_text: string;
  teams: {
    team_a: PlayByPlayTeamInfo;
    team_b: PlayByPlayTeamInfo;
  };
  current_score: {
    team_a: number;
    team_b: number;
  };
}

export interface PlayByPlayPhases {
  first_half: PlayByPlayEvent[];
  second_half: PlayByPlayEvent[];
  extra_time_first_half: PlayByPlayEvent[];
  extra_time_second_half: PlayByPlayEvent[];
  five_raids: PlayByPlayEvent[];
  golden_raid: PlayByPlayEvent[];
  other: PlayByPlayEvent[];
  [key: string]: PlayByPlayEvent[];
}

export interface PlayByPlayPagination {
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface PlayByPlayData {
  match: PlayByPlayMatchInfo;
  events: PlayByPlayEvent[];
  phases: PlayByPlayPhases;
  pagination?: PlayByPlayPagination;
}

