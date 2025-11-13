export function PdfScanningLoader({ className = "" }) {
  return (
    <div
      className={`w-full min-h-96 h-full flex flex-col items-center justify-center gap-8 ${className}`}
    >
      <svg
        width="320"
        height="420"
        viewBox="0 0 320 420"
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full drop-shadow-2xl"
      >
        <defs>
          {/* Document Shadow */}
          <filter id="docShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
            <feOffset dx="0" dy="8" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Scanning Gradient */}
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            <stop
              offset="30%"
              stopColor="rgb(59, 130, 246)"
              stopOpacity="0.1"
            />
            <stop
              offset="50%"
              stopColor="rgb(59, 130, 246)"
              stopOpacity="0.4"
            />
            <stop
              offset="70%"
              stopColor="rgb(59, 130, 246)"
              stopOpacity="0.1"
            />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </linearGradient>

          {/* Glow Effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Page Gradient */}
          <linearGradient id="pageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(255, 255, 255)" stopOpacity="1" />
            <stop
              offset="100%"
              stopColor="rgb(249, 250, 251)"
              stopOpacity="1"
            />
          </linearGradient>
        </defs>

        {/* Document Shadow Base */}
        <rect
          x="50"
          y="30"
          width="220"
          height="340"
          rx="6"
          fill="black"
          opacity="0.1"
          filter="url(#docShadow)"
        />

        {/* Main Document Body */}
        <rect
          x="50"
          y="20"
          width="220"
          height="340"
          rx="6"
          fill="url(#pageGradient)"
          stroke="rgb(226, 232, 240)"
          strokeWidth="2"
        />

        {/* Invoice Title Area */}
        <rect
          x="70"
          y="90"
          width="120"
          height="12"
          rx="2"
          fill="rgb(71, 85, 105)"
          opacity="0.9"
        />
        <rect
          x="200"
          y="90"
          width="50"
          height="12"
          rx="2"
          fill="rgb(100, 116, 139)"
          opacity="0.5"
        />

        {/* Invoice Details - Table Header */}
        <rect
          x="70"
          y="120"
          width="180"
          height="8"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.4"
        />

        {/* Table Rows with varying lengths */}
        <rect
          x="70"
          y="140"
          width="85"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.3"
        />
        <rect
          x="165"
          y="140"
          width="50"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.3"
        />
        <rect
          x="225"
          y="140"
          width="25"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.3"
        />

        <rect
          x="70"
          y="155"
          width="85"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.25"
        />
        <rect
          x="165"
          y="155"
          width="50"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.25"
        />
        <rect
          x="225"
          y="155"
          width="25"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.25"
        />

        <rect
          x="70"
          y="170"
          width="85"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.3"
        />
        <rect
          x="165"
          y="170"
          width="50"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.3"
        />
        <rect
          x="225"
          y="170"
          width="25"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.3"
        />

        <rect
          x="70"
          y="185"
          width="85"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.25"
        />
        <rect
          x="165"
          y="185"
          width="50"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.25"
        />
        <rect
          x="225"
          y="185"
          width="25"
          height="6"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.25"
        />

        {/* Separator Line */}
        <line
          x1="70"
          y1="205"
          x2="250"
          y2="205"
          stroke="rgb(203, 213, 225)"
          strokeWidth="1"
        />

        {/* Summary Section */}
        <rect
          x="70"
          y="220"
          width="100"
          height="8"
          rx="1"
          fill="rgb(100, 116, 139)"
          opacity="0.4"
        />
        <rect
          x="180"
          y="220"
          width="70"
          height="8"
          rx="1"
          fill="rgb(100, 116, 139)"
          opacity="0.3"
        />

        <rect
          x="70"
          y="240"
          width="100"
          height="8"
          rx="1"
          fill="rgb(100, 116, 139)"
          opacity="0.4"
        />
        <rect
          x="180"
          y="240"
          width="70"
          height="8"
          rx="1"
          fill="rgb(100, 116, 139)"
          opacity="0.3"
        />

        {/* Total Section - Highlighted */}
        <rect
          x="65"
          y="265"
          width="190"
          height="22"
          rx="3"
          fill="rgb(59, 130, 246)"
          opacity="0.1"
        />
        <rect
          x="70"
          y="270"
          width="80"
          height="10"
          rx="2"
          fill="rgb(59, 130, 246)"
          opacity="0.8"
        />
        <rect
          x="180"
          y="270"
          width="70"
          height="10"
          rx="2"
          fill="rgb(59, 130, 246)"
          opacity="0.6"
        />

        {/* Footer Text Lines */}
        <rect
          x="70"
          y="310"
          width="140"
          height="4"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.2"
        />
        <rect
          x="70"
          y="320"
          width="110"
          height="4"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.2"
        />
        <rect
          x="70"
          y="330"
          width="130"
          height="4"
          rx="1"
          fill="rgb(148, 163, 184)"
          opacity="0.2"
        />

        {/* Scanning Effect */}
        <clipPath id="docClip">
          <rect x="50" y="70" width="220" height="290" rx="4" />
        </clipPath>

        {/* Animated Scanning Beam */}
        <rect
          x="50"
          y="70"
          width="220"
          height="60"
          fill="url(#scanGradient)"
          clipPath="url(#docClip)"
        >
          <animate
            attributeName="y"
            values="70;300;70"
            dur="3s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </rect>

        {/* Scanning Line */}
        <line
          x1="50"
          y1="100"
          x2="270"
          y2="100"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2"
          filter="url(#glow)"
          opacity="0.8"
        >
          <animate
            attributeName="y1"
            values="70;360;70"
            dur="3s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <animate
            attributeName="y2"
            values="70;360;70"
            dur="3s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </line>

        {/* Corner Page Fold Effect */}
        <path
          d="M 260 20 L 270 20 L 270 30 Z"
          fill="rgb(226, 232, 240)"
          stroke="rgb(203, 213, 225)"
          strokeWidth="1"
        />
        <path d="M 260 20 L 270 30 L 260 30 Z" fill="rgb(241, 245, 249)" />
      </svg>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-medium text-muted-foreground">
            Processing Invoice Document
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
