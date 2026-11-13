import React from 'react';
import Svg, { Path } from 'react-native-svg';

const paths = {
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  forward: 'M5 12h14m-6-6 6 6-6 6',
  right: 'm9 6 6 6-6 6',
  left: 'm15 6-6 6 6 6',
  x: 'm6 6 12 12M18 6 6 18',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2',
  video: 'M4 5h16v14H4zM10 9l5 3-5 3z',
  music:
    'M9 17V6l10-2v11M9 17c0 3-6 4-6 1 0-3 6-4 6-1zm10-2c0 3-6 4-6 1 0-3 6-4 6-1z',
  news: 'M4 4h13v15a2 2 0 0 0 4 0V8h-4M4 4v15a2 2 0 0 0 2 2h13M7 8h7M7 12h7M7 16h4',
  game: 'M7 7h10c3 0 4 3 5 9 0 3-2 4-4 2l-2-2H8l-2 2c-2 2-4 1-4-2 1-6 2-9 5-9zM6 11h4m-2-2v4m7-2h.01m3 2h.01',
  play: 'm8 4 12 8-12 8z',
  pause: 'M8 5v14M16 5v14',
  warn: 'm12 3 10 17H2zM12 9v4m0 3h.01',
  empty: 'M3 8l4-5h10l4 5v12H3zM3 12h5l2 3h4l2-3h5',
  offline:
    'm3 3 18 18M2 9a16 16 0 0 1 4-2m5-1a17 17 0 0 1 11 3M5 13a12 12 0 0 1 5-2m5 1 3 1M9 17a6 6 0 0 1 5-1M12 20h.01',
  device:
    'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
  reset: 'M3 10a9 9 0 1 1 1 7M3 4v6h6',
  settings: 'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M9 15v6',
  check: 'm5 12 4 4 10-11',
  signout: 'M9 3H4v18h5m0-9h12m-5-5 5 5-5 5',
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 24,
  color = '#201d2c',
  strokeWidth,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d={paths[name]}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth ?? (name === 'more' ? 3.5 : 1.8)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
