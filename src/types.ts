export interface Tournament {
  id: number;
  name: string;
  source?: string;
  status?: string;
  logo_url?: string;
  start_date?: string;
  end_date?: string;
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
