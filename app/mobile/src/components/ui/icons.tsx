import Svg, { Circle, Path, Rect } from "react-native-svg";

import { colors } from "@/constants/theme";

export type IconProps = { color?: string; size?: number };

const STROKE = 1.6;

export const HomeIcon = ({ color = colors.ink, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Path
      d="M3 9.2 11 3l8 6.2V18a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1V9.2Z"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckinIcon = ({ color = colors.ink, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Circle cx={11} cy={11} r={8} stroke={color} strokeWidth={STROKE} />
    <Path
      d="m7.5 11.2 2.4 2.4 4.6-4.8"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const WodIcon = ({ color = colors.ink, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Path
      d="M2.5 11h2M17.5 11h2M6 7.5v7M16 7.5v7M6 11h10"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

export const CalendarIcon = ({ color = colors.ink, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Rect
      x={3}
      y={4.5}
      width={16}
      height={14.5}
      rx={2.5}
      stroke={color}
      strokeWidth={STROKE}
    />
    <Path
      d="M3 9h16M7.5 2.5v4M14.5 2.5v4"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

export const ProfileIcon = ({ color = colors.ink, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Circle cx={11} cy={8} r={3.5} stroke={color} strokeWidth={STROKE} />
    <Path
      d="M4.5 18.5c1.2-3.1 3.7-4.7 6.5-4.7s5.3 1.6 6.5 4.7"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

export const ChevronLeft = ({ color = colors.ink, size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M11 3.5 5.5 9l5.5 5.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRight = ({ color = colors.ink, size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <Path
      d="M7 3.5 12.5 9 7 14.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClockIcon = ({ color = colors.ink2, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
    <Path
      d="M12 7.5V12l3 2"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckCircleIcon = ({
  color = colors.highlight,
  size = 24,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
    <Path
      d="m8 12.3 2.7 2.7L16 9.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon = ({ color = colors.ink2, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={7.2} r={3.2} stroke={color} strokeWidth={STROKE} />
    <Path
      d="M4 16.8c1.1-2.8 3.4-4.2 6-4.2s4.9 1.4 6 4.2"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

export const LockIcon = ({ color = colors.ink2, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect
      x={3.5}
      y={8.5}
      width={13}
      height={8.5}
      rx={2}
      stroke={color}
      strokeWidth={STROKE}
    />
    <Path
      d="M6.8 8.5V6.2a3.2 3.2 0 0 1 6.4 0v2.3"
      stroke={color}
      strokeWidth={STROKE}
    />
  </Svg>
);
