type PerfumeBottleSilhouetteProps = {
  width?: number;
  height?: number;
  opacity?: number;
  className?: string;
};

export function PerfumeBottleSilhouette({
  width = 90,
  height = 135,
  opacity = 1,
  className,
}: PerfumeBottleSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 120 180"
      width={width}
      height={height}
      fill="none"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <rect x="30" y="70" width="60" height="90" rx="8" fill="rgba(172,125,69,1)" />
      <rect x="44" y="44" width="32" height="28" rx="4" fill="rgba(172,125,69,1)" />
      <rect x="36" y="22" width="48" height="24" rx="5" fill="rgba(172,125,69,1)" />
      <rect x="38" y="90" width="44" height="50" rx="3" fill="rgba(0,0,0,0.4)" />
      <rect x="46" y="104" width="28" height="2" rx="1" fill="rgba(172,125,69,0.6)" />
      <rect x="50" y="112" width="20" height="1.5" rx="1" fill="rgba(172,125,69,0.4)" />
      <rect x="48" y="122" width="24" height="1.5" rx="1" fill="rgba(172,125,69,0.4)" />
      <circle cx="98" cy="150" r="14" fill="rgba(172,125,69,0.15)" />
      <circle cx="98" cy="150" r="6" fill="rgba(172,125,69,0.25)" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <ellipse
          key={i}
          cx={98 + Math.cos((deg * Math.PI) / 180) * 10}
          cy={150 + Math.sin((deg * Math.PI) / 180) * 10}
          rx="4"
          ry="7"
          transform={`rotate(${deg} ${98 + Math.cos((deg * Math.PI) / 180) * 10} ${150 + Math.sin((deg * Math.PI) / 180) * 10})`}
          fill="rgba(172,125,69,0.2)"
        />
      ))}
      <ellipse cx="18" cy="130" rx="6" ry="14" transform="rotate(-30 18 130)" fill="rgba(172,125,69,0.15)" />
      <ellipse cx="110" cy="100" rx="4" ry="10" transform="rotate(20 110 100)" fill="rgba(172,125,69,0.12)" />
    </svg>
  );
}
