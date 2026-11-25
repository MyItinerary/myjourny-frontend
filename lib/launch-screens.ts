/**
 * iPhone screens (portrait, CSS px and pixel ratio) that get a launch image when MyJourny is
 * opened from the home screen. Without one, iOS shows a blank screen, black in dark mode.
 */
const IPHONES = [
  { width: 440, height: 956, dpr: 3 }, // 16/17 Pro Max
  { width: 420, height: 912, dpr: 3 }, // Air
  { width: 402, height: 874, dpr: 3 }, // 16 Pro, 17, 17 Pro
  { width: 430, height: 932, dpr: 3 }, // 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  { width: 393, height: 852, dpr: 3 }, // 14 Pro, 15, 15 Pro, 16
  { width: 428, height: 926, dpr: 3 }, // 12/13 Pro Max, 14 Plus
  { width: 390, height: 844, dpr: 3 }, // 12, 13, 14
  { width: 360, height: 780, dpr: 3 }, // 12/13 mini
  { width: 414, height: 896, dpr: 3 }, // XS Max, 11 Pro Max
  { width: 375, height: 812, dpr: 3 }, // X, XS, 11 Pro
  { width: 414, height: 896, dpr: 2 }, // XR, 11
  { width: 414, height: 736, dpr: 3 }, // 6/7/8 Plus
  { width: 375, height: 667, dpr: 2 }, // SE, 6/7/8
] as const;

export type LaunchScreen = { size: string; width: number; height: number; dpr: number; media: string };

export const LAUNCH_SCREENS: LaunchScreen[] = IPHONES.map(({ width, height, dpr }) => ({
  size: `${width * dpr}x${height * dpr}`,
  width: width * dpr,
  height: height * dpr,
  dpr,
  media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
}));
