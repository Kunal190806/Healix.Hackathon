import * as React from "react"

function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="200"
      height="200"
      {...props}
    >
      <defs>
        <linearGradient id="healix-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <g fill="url(#healix-grad)">
        <path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Z" />
        <path d="M168 88h-24.3a40.24 40.24 0 0 0-71.4 0H48a8 8 0 0 0 0 16h24.3a40.24 40.24 0 0 0 71.4 0H168a8 8 0 0 0 0-16Z" />
        <path d="M208 152H88a8 8 0 0 0 0 16h120a8 8 0 0 0 0-16Z" />
      </g>
    </svg>
  );
}

export default Logo;
