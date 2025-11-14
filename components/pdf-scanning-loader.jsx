export function PdfScanningLoader({ className = "" }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-6 py-8 ${className}`}
    >
      <svg
        width="180"
        height="220"
        viewBox="0 0 180 220"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full"
      >
        <defs>
          {/* Subtle Shadow */}
          <filter id="docShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.15" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Scanning Gradient */}
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>

          <style>{`
            @media (prefers-color-scheme: dark) {
              #scanGradient stop[offset="50%"] {
                stop-opacity: 0.6 !important;
              }
            }
            .dark #scanGradient stop[offset="50%"] {
              stop-opacity: 0.6 !important;
            }
          `}</style>

          {/* Subtle Glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Document */}
        <rect
          x="30"
          y="20"
          width="120"
          height="160"
          rx="4"
          className="fill-background stroke-border"
          strokeWidth="1.5"
          filter="url(#docShadow)"
        />

        {/* Document Header */}
        <rect
          x="45"
          y="35"
          width="60"
          height="6"
          rx="1"
          className="fill-foreground"
          opacity="0.6"
        />
        <rect
          x="115"
          y="35"
          width="20"
          height="6"
          rx="1"
          className="fill-foreground"
          opacity="0.3"
        />

        {/* Content Lines */}
        <rect
          x="45"
          y="55"
          width="90"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.25"
        />
        <rect
          x="45"
          y="65"
          width="85"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />
        <rect
          x="45"
          y="75"
          width="90"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.25"
        />

        {/* Table-like structure */}
        <rect
          x="45"
          y="90"
          width="90"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.3"
        />
        <rect
          x="45"
          y="100"
          width="50"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />
        <rect
          x="100"
          y="100"
          width="35"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />
        <rect
          x="45"
          y="110"
          width="50"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />
        <rect
          x="100"
          y="110"
          width="35"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />
        <rect
          x="45"
          y="120"
          width="50"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />
        <rect
          x="100"
          y="120"
          width="35"
          height="3"
          rx="0.5"
          className="fill-muted-foreground"
          opacity="0.2"
        />

        {/* Separator */}
        <line
          x1="45"
          y1="135"
          x2="135"
          y2="135"
          className="stroke-border"
          strokeWidth="0.5"
        />

        {/* Total Section */}
        <rect
          x="42"
          y="145"
          width="96"
          height="16"
          rx="2"
          className="fill-primary"
          opacity="0.08"
        />
        <rect
          x="45"
          y="150"
          width="45"
          height="5"
          rx="1"
          className="fill-primary"
          opacity="0.5"
        />
        <rect
          x="100"
          y="150"
          width="35"
          height="5"
          rx="1"
          className="fill-primary"
          opacity="0.4"
        />

        {/* Scanning Effect Clip */}
        <clipPath id="docClip">
          <rect x="30" y="35" width="120" height="145" rx="4" />
        </clipPath>

        {/* Animated Scanning Beam */}
        <rect
          x="30"
          y="35"
          width="120"
          height="40"
          fill="url(#scanGradient)"
          clipPath="url(#docClip)"
        >
          <animate
            attributeName="y"
            values="35;140;35"
            dur="2.5s"
            repeatCount="indefinite"
            calcMode="ease-in-out"
          />
        </rect>

        {/* Scanning Line */}
        <line
          x1="30"
          y1="55"
          x2="150"
          y2="55"
          className="stroke-primary"
          strokeWidth="2"
          filter="url(#glow)"
          opacity="0.9"
        >
          <animate
            attributeName="y1"
            values="35;180;35"
            dur="2.5s"
            repeatCount="indefinite"
            calcMode="ease-in-out"
          />
          <animate
            attributeName="y2"
            values="35;180;35"
            dur="2.5s"
            repeatCount="indefinite"
            calcMode="ease-in-out"
          />
        </line>
      </svg>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Processing document...
        </p>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1 w-1 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1 w-1 rounded-full bg-primary/70 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
