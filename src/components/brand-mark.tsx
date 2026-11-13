import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
export function BrandMark({ size = 42 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 42 42" accessible={false}>
      <Rect width="42" height="42" rx="13" fill="#4a36a5" />
      <Path
        d="m9 26 7-13 7 13M15 22h5M27 13v13"
        fill="none"
        stroke="#fff"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <Circle cx="32" cy="24" r="2" fill="#ffad72" />
    </Svg>
  );
}
