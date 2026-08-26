import React from 'react';
import type { LastRaid } from '../types';
import { Zap, Flame } from 'lucide-react';

interface LiveTickerProps {
  lastRaid?: LastRaid | null;
  updateMessage?: string;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ lastRaid, updateMessage }) => {
  const outcome = lastRaid?.outcome || 'raid_recorded';
  const isSuperRaid = lastRaid?.is_super_raid || (lastRaid?.points_scored && lastRaid.points_scored >= 3);

  const displayMessage = updateMessage && !updateMessage.includes('undefined')
    ? updateMessage
    : (lastRaid 
        ? `Raid #${lastRaid?.raid_number}: ${lastRaid?.raider_name} scored ${lastRaid?.points_scored} point(s) [${outcome}]` 
        : 'DC scores 1Pt. in last Raid.');

  return (
    <div className={`live-ticker ${isSuperRaid ? 'super' : ''}`}>
      <div className="ticker-flag">
        <Zap size={14} className="lightning-icon" />
        <span>COMMENTARY</span>
      </div>

      <div className="ticker-body">
        <span className="ticker-text">{displayMessage}</span>
      </div>

      {isSuperRaid && (
        <span className="super-raid-tag">
          <Flame size={13} style={{ marginRight: '0.3rem', verticalAlign: '-2px' }} />
          Super Raid
        </span>
      )}
    </div>
  );
};