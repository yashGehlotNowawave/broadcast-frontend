import React from 'react';
import type { LastRaid } from '../types';
import { Activity } from 'lucide-react';

interface LiveTickerProps {
  lastRaid?: LastRaid | null;
  updateMessage?: string;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ lastRaid, updateMessage }) => {
  if (!lastRaid && !updateMessage) return null;

  const outcome = lastRaid?.outcome || 'raid_recorded';
  const isSuperRaid = lastRaid?.is_super_raid || (lastRaid?.points_scored && lastRaid.points_scored >= 3);

  const displayMessage = updateMessage && !updateMessage.includes('undefined')
    ? updateMessage
    : (lastRaid ? `Raid #${lastRaid?.raid_number}: ${lastRaid?.raider_name} scored ${lastRaid?.points_scored} point(s) [${outcome}]` : 'Match in progress');

  return (
    <div
      style={{
        background: isSuperRaid ? 'linear-gradient(135deg, #ff0055, #ff6000)' : 'rgba(30, 5, 45, 0.95)',
        border: '1px solid var(--border-gold)',
        borderRadius: '10px',
        padding: '0.85rem 1.2rem',
        marginTop: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
      }}
    >
      <Activity size={22} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ⚡ LIVE RAID COMMENTARY
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '0.1rem' }}>
          {displayMessage}
        </div>
      </div>

      {isSuperRaid && (
        <span className="brand-badge" style={{ background: '#ffd700', color: '#000', fontWeight: 900 }}>
          🔥 SUPER RAID!
        </span>
      )}
    </div>
  );
};
