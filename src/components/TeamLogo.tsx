import React, { useState, useEffect } from 'react';

export interface TeamLogoProps {
  logoUrl?: string | null;
  teamName?: string | null;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logoUrl,
  teamName,
  className = 'team-logo',
  fallbackClassName = 'team-logo-initial',
  alt,
  style
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  const initial = (teamName || '').trim().charAt(0).toUpperCase() || 'T';

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={alt || teamName || 'Team Logo'}
        className={className}
        style={style}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName} style={style}>
      {initial}
    </div>
  );
};

export interface PlayerAvatarProps {
  imageUrl?: string | null;
  playerName?: string | null;
  jerseyNo?: number | string | null;
  className?: string;
  fallbackClassName?: string;
  style?: React.CSSProperties;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  imageUrl,
  playerName,
  jerseyNo,
  className = 'p-avatar',
  fallbackClassName = 'p-avatar-placeholder',
  style
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const fallbackText = jerseyNo
    ? `#${jerseyNo}`
    : (playerName || '').trim().charAt(0).toUpperCase() || 'P';

  if (imageUrl && !hasError) {
    return (
      <img
        src={imageUrl}
        alt={playerName || 'Player'}
        className={className}
        style={style}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName} style={style}>
      {fallbackText}
    </div>
  );
};
