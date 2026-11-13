export type Cat = 'Video' | 'Music' | 'News' | 'Game';
export const cats: Record<Cat, string> = {
  Video: 'YouTube',
  Music: 'Spotify',
  News: 'VnExpress',
  Game: '2048',
};
export const serviceUrls: Record<string, string> = {
  VnExpress: 'https://vnexpress.net/',
  'Tuổi Trẻ': 'https://tuoitre.vn/',
  'Thanh Niên': 'https://thanhnien.vn/',
  '2048': 'https://play2048.co/',
};
export const descriptions: Record<Cat, string> = {
  Video: 'Explore videos',
  Music: 'Listen to music',
  News: 'Read the news',
  Game: 'Play games',
};
export const videoServices = [
  { name: 'YouTube', detail: 'Everyday videos' },
  { name: 'Vimeo', detail: 'Creative films' },
  { name: 'Twitch', detail: 'Live stream replays' },
  { name: 'Dailymotion', detail: 'Videos and stories' },
];
export const musicServices = [
  { name: 'Spotify', detail: 'Playlists and tracks' },
  { name: 'SoundCloud', detail: 'New artists and mixes' },
  { name: 'Bandcamp', detail: 'Independent music' },
];
export const newsServices = [
  { name: 'VnExpress', detail: 'News and features' },
  { name: 'Tuổi Trẻ', detail: 'Stories from Vietnam' },
  { name: 'Thanh Niên', detail: 'News and culture' },
];
export const gameServices = [{ name: '2048', detail: 'Merge number tiles' }];
export const servicesByCategory = {
  Video: videoServices,
  Music: musicServices,
  News: newsServices,
  Game: gameServices,
};
export const demos = {
  a: { name: 'Avery', email: 'avery@example.test' },
  b: { name: 'Blair', email: 'blair@example.test' },
};
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
export const videoCollections = {
  YouTube: videos,
  Vimeo: [
    { name: 'Paper Skies', by: 'Studio Lumen', time: 176, color: '#526d84' },
    {
      name: 'The Maker’s Table',
      by: 'Craft Stories',
      time: 202,
      color: '#77628a',
    },
    {
      name: 'After the Light',
      by: 'Small Frame Films',
      time: 155,
      color: '#a27164',
    },
  ],
  Twitch: [
    {
      name: 'Cozy game night replay',
      by: 'Pixel Corner',
      time: 198,
      color: '#7653a1',
    },
    {
      name: 'Art stream highlights',
      by: 'Draw Along',
      time: 184,
      color: '#9a647e',
    },
    {
      name: 'Indie game session',
      by: 'The Game Room',
      time: 213,
      color: '#5b7392',
    },
  ],
  Dailymotion: [
    {
      name: 'Morning city guide',
      by: 'Everyday Places',
      time: 170,
      color: '#557c80',
    },
    {
      name: 'Weekend cooking ideas',
      by: 'Home Table',
      time: 189,
      color: '#a27255',
    },
    {
      name: 'A walk through old streets',
      by: 'City Notes',
      time: 161,
      color: '#69768e',
    },
  ],
};
export const tracks = [
  { name: 'Violet Hours', by: 'Mira Vale', time: 189, color: '#62528d' },
  { name: 'Side B', by: 'The Quiet Room', time: 212, color: '#546e60' },
  { name: 'Night Bus Home', by: 'June Signal', time: 173, color: '#995d51' },
];
export const musicCollections = {
  Spotify: tracks,
  SoundCloud: [
    { name: 'Cloudline', by: 'Nova Lane', time: 178, color: '#a86d52' },
    { name: 'Late Train Mix', by: 'Low Tide', time: 205, color: '#695f9b' },
    { name: 'Open Window', by: 'Rue Field', time: 166, color: '#4e807e' },
  ],
  Bandcamp: [
    { name: 'First Light', by: 'Fern Studio', time: 191, color: '#5d7869' },
    {
      name: 'Small Hours',
      by: 'The Evening Club',
      time: 201,
      color: '#8a6383',
    },
    { name: 'Slow River', by: 'Moss & Moon', time: 174, color: '#9a755c' },
  ],
};
export const formatTime = (time: number) =>
  Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0');
