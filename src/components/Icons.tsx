// The small line icons of the design. All are decorative: the text next to them says what they mean.

type IconProps = { size?: number; className?: string };

const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const WhistleIcon = ({ size = 28 }: IconProps) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" {...line} strokeWidth={2.2}>
    <path d="M3 12h9a4 4 0 1 0 0-1M12 11V7h4M8 12v3" />
  </svg>
);

export const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg aria-hidden="true" width={14} height={14} viewBox="0 0 24 24" {...line} strokeWidth={2.6} className={open ? "chevron open" : "chevron"}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const ExternalIcon = () => (
  <svg aria-hidden="true" width={14} height={14} viewBox="0 0 24 24" {...line} strokeWidth={2.4}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);

export const CameraIcon = () => (
  <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" {...line} strokeWidth={2.2}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const PlayIcon = () => (
  <svg aria-hidden="true" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round">
    <path d="M7 5l12 7-12 7z" />
  </svg>
);

export const SpeakerIcon = () => (
  <svg aria-hidden="true" width={26} height={26} viewBox="0 0 24 24" {...line} strokeWidth={2}>
    <path d="M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const CheckIcon = () => (
  <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" {...line} strokeWidth={3}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);

export const ArrowIcon = ({ direction }: { direction: "previous" | "next" }) => (
  <svg aria-hidden="true" width={22} height={22} viewBox="0 0 24 24" {...line} strokeWidth={2.8}>
    <path d={direction === "previous" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);
