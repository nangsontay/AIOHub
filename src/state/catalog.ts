export type Cat = 'Video' | 'Music' | 'News' | 'Game';
export const cats: Record<Cat, string> = {
  Video: 'YouTube',
  Music: 'Spotify',
  News: 'VnExpress',
  Game: '2048',
};
export const serviceUrls = {
  News: 'https://vnexpress.net/',
  Game: 'https://play2048.co/',
} as const;
export const demos = {
  a: { name: 'Avery', email: 'avery@example.test' },
  b: { name: 'Blair', email: 'blair@example.test' },
} as const;
export const videos = [
  {
    name: 'Saigon after the rain',
    by: 'City Frames',
    time: 164,
    color: '#6d598f',
  },
  {
    name: 'Inside a cassette deck',
    by: 'Tape Notes',
    time: 208,
    color: '#967142',
  },
  {
    name: 'A walk along the river',
    by: 'Field Journal',
    time: 112,
    color: '#497969',
  },
];
export const tracks = [
  { name: 'Violet Hours', by: 'Mira Vale', time: 189, color: '#62528d' },
  { name: 'Side B', by: 'The Quiet Room', time: 212, color: '#546e60' },
  { name: 'Night Bus Home', by: 'June Signal', time: 173, color: '#995d51' },
];
export const formatTime = (time: number) =>
  Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0');
