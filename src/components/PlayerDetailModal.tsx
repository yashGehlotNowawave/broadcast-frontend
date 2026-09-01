import React from 'react';
import { X, Star, Shield, Zap } from 'lucide-react';
import type { PlayerStats, TopRaider, TopDefender } from '../types';
import { PlayerAvatar } from './TeamLogo';

/**
 * The stats endpoints return three slightly different player shapes
 * (full match/tournament scorecard rows vs. leaderboard cards). This
 * normalizes any of them into what the modal needs, defaulting any
 * field a given endpoint doesn't provide to 0 rather than guessing.
 */
export type PlayerDetailSource = PlayerStats | TopRaider | TopDefender;

interface PlayerDetailModalProps {
    player: PlayerDetailSource;
    onClose: () => void;
}

const num = (v: unknown): number => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);

function Donut({
    segments,
    centerValue,
    centerSub
}: {
    segments: { value: number; color: string }[];
    centerValue: number;
    centerSub: string;
}) {
    const size = 120;
    const stroke = 14;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;

    let offset = 0;
    const arcs = segments.map((seg, i) => {
        const fraction = seg.value / total;
        const dash = fraction * circumference;
        const gap = circumference - dash;
        const arc = (
            <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap={dash > 0 && dash < circumference ? 'butt' : 'round'}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        );
        offset += dash;
        return arc;
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth={stroke} />
            {total > 0 ? arcs : null}
            <text x="50%" y="46%" textAnchor="middle" className="donut-center-label">{centerValue}</text>
            <text x="50%" y="62%" textAnchor="middle" className="donut-center-sublabel">{centerSub.toUpperCase()}</text>
        </svg>
    );
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
    const raids = num((player as PlayerStats).raids ?? (player as TopRaider).raids);
    const successfulRaids = num((player as any).successful_raids);
    const unsuccessfulRaids = num((player as any).unsuccessful_raids);
    const emptyRaids = num((player as any).empty_raids);
    const touchPoints = num((player as any).touch_points);
    const bonusPoints = num((player as any).bonus_points);
    const raidPoints = num((player as any).total_raid_points);
    const superRaids = num((player as any).super_raids);
    const superTens = num((player as any).super_tens ?? (player as any).super_tens_count);

    const totalTackles = num((player as any).total_tackles);
    const successfulTackles = num((player as any).successful_tackles);
    const unsuccessfulTackles = num((player as any).unsuccessful_tackles);
    const tacklePoints = num((player as any).tackle_points);
    const superTackles = num((player as any).super_tackles);
    const highFives = num((player as any).high_fives ?? (player as any).high_fives_count);

    const totalPoints = num((player as any).total_points ?? raidPoints + tacklePoints);

    // If a raid/tackle breakdown wasn't provided but a total was, fall back
    // to a single "recorded" segment rather than drawing a fabricated split.
    const raidSegments = raids > 0
        ? [
            { value: successfulRaids, color: 'var(--pkl-orange)' },
            { value: unsuccessfulRaids, color: 'var(--pkl-red-light)' },
            { value: emptyRaids, color: 'var(--border-strong)' }
        ]
        : [];

    const tackleSegments = totalTackles > 0
        ? [
            { value: successfulTackles, color: 'var(--pkl-green)' },
            { value: unsuccessfulTackles, color: 'var(--border-strong)' }
        ]
        : [];

    return (
        <div className="player-modal-backdrop" onClick={onClose}>
            <div className="player-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="player-modal-header">
                    <button className="player-modal-close" onClick={onClose} aria-label="Close">
                        <X size={16} />
                    </button>

                    <PlayerAvatar
                        imageUrl={player.image_url}
                        playerName={player.player_name}
                        jerseyNo={player.jersey_no}
                        className="player-modal-photo"
                        fallbackClassName="player-modal-photo-placeholder"
                    />

                    <div className="player-modal-name-block">
                        <div className="player-modal-name">{player.player_name}</div>
                        <div className="player-modal-meta">
                            <span className="player-modal-team">{player.team_name}</span>
                            {player.jersey_no && <span className="player-modal-jersey">#{player.jersey_no}</span>}
                            {player.position && <span className="player-modal-position">{player.position}</span>}
                        </div>
                        <div className="player-modal-badges">
                            {superTens > 0 && (
                                <span className="badge-super10"><Star size={11} /> {superTens > 1 ? `${superTens}x ` : ''}SUPER 10</span>
                            )}
                            {highFives > 0 && (
                                <span className="badge-high5"><Shield size={11} /> {highFives > 1 ? `${highFives}x ` : ''}HIGH 5</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="player-modal-body">
                    <div className="player-modal-totals">
                        <div className="player-modal-total-box">
                            <div className="player-modal-total-val">{totalPoints}</div>
                            <div className="player-modal-total-label">Total Pts</div>
                        </div>
                        <div className="player-modal-total-box">
                            <div className="player-modal-total-val raid">{raidPoints}</div>
                            <div className="player-modal-total-label">Raid Pts</div>
                        </div>
                        <div className="player-modal-total-box">
                            <div className="player-modal-total-val defend">{tacklePoints}</div>
                            <div className="player-modal-total-label">Tackle Pts</div>
                        </div>
                    </div>

                    <div className="donut-stats-row">
                        <div className="donut-stat-block">
                            <div className="donut-stat-title"><Zap size={14} style={{ color: 'var(--pkl-orange)' }} /> Total Raids</div>
                            <Donut segments={raidSegments} centerValue={raids} centerSub="raids" />
                            <div className="donut-legend">
                                <div className="donut-legend-row">
                                    <span><span className="donut-legend-dot" style={{ background: 'var(--pkl-orange)' }} />Successful</span>
                                    <strong>{successfulRaids}</strong>
                                </div>
                                <div className="donut-legend-row">
                                    <span><span className="donut-legend-dot" style={{ background: 'var(--pkl-red-light)' }} />Unsuccessful</span>
                                    <strong>{unsuccessfulRaids}</strong>
                                </div>
                                <div className="donut-legend-row">
                                    <span><span className="donut-legend-dot" style={{ background: 'var(--border-strong)' }} />Empty</span>
                                    <strong>{emptyRaids}</strong>
                                </div>
                                <div className="donut-legend-row">
                                    <span>Touch / Bonus</span>
                                    <strong>{touchPoints} / {bonusPoints}</strong>
                                </div>
                                {superRaids > 0 && (
                                    <div className="donut-legend-row">
                                        <span>Super Raids</span>
                                        <strong>{superRaids}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="donut-stat-block">
                            <div className="donut-stat-title"><Shield size={14} style={{ color: 'var(--pkl-green)' }} /> Total Tackles</div>
                            <Donut segments={tackleSegments} centerValue={totalTackles} centerSub="tackles" />
                            <div className="donut-legend">
                                <div className="donut-legend-row">
                                    <span><span className="donut-legend-dot" style={{ background: 'var(--pkl-green)' }} />Successful</span>
                                    <strong>{successfulTackles}</strong>
                                </div>
                                <div className="donut-legend-row">
                                    <span><span className="donut-legend-dot" style={{ background: 'var(--border-strong)' }} />Unsuccessful</span>
                                    <strong>{unsuccessfulTackles}</strong>
                                </div>
                                {superTackles > 0 && (
                                    <div className="donut-legend-row">
                                        <span>Super Tackles</span>
                                        <strong>{superTackles}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="player-modal-hint">Figures reflect this {(player as any).matches_played ? 'tournament' : 'match'}.</div>
                </div>
            </div>
        </div>
    );
};