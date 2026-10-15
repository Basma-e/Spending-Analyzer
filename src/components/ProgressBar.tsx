interface Props {
  value: number;
  color?: string;
  height?: string;
}

export function ProgressBar({ value, color = '#5a7a5a', height = 'h-2' }: Props) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`w-full ${height} bg-cream-200 rounded-full overflow-hidden`}>
      <div
        className={`${height} rounded-full transition-all duration-500`}
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}
