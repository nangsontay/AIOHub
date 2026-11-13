export const colors = {
  ink: '#201d2c',
  muted: '#605c6c',
  indigo: '#4a36a5',
  line: '#ddd9e4',
  paper: '#fffeff',
  soft: '#f5f3fa',
  err: '#9d293a',
  lav: '#eae5ff',
  tonal: '#efebfa',
  video: { accent: '#a43f37', tint: '#f9e6e1' },
  music: { accent: '#285c52', tint: '#deeee6' },
  news: { accent: '#473a8e', tint: '#e9e4fc' },
  game: { accent: '#865522', tint: '#f8e9d4' },
  covers: ['#6d598f', '#967142', '#497969', '#62528d', '#546e60', '#995d51'],
} as const;
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
export const radii = { sm: 8, md: 13, lg: 20, pill: 999 } as const;
export const typography = {
  small: 12,
  body: 16,
  title: 32,
  heading: 22,
} as const;
