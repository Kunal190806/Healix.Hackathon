import * as React from "react"

function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width="200"
      height="200"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      
      <g transform="translate(100,100)">
        <g transform="rotate(-15)">
          <path d="M-30,-70 C-30,-90 30,-90 30,-70 S-30,-50 30,-50" stroke="#a3e635" strokeWidth="6" fill="none" />
          <path d="M-30,70 C-30,90 30,90 30,70 S-30,50 30,50" stroke="#a3e635" strokeWidth="6" fill="none" />
          <line x1="-30" y1="0" x2="30" y2="0" stroke="#a3e635" strokeWidth="6" />
          
          <path d="M-30, -70 L-30, 70" stroke="#a3e635" strokeWidth="6" fill="none" />
          <path d="M30, -70 L30, 70" stroke="#a3e635" strokeWidth="6" fill="none" />

          <g transform="translate(0, 0) scale(1.2)">
            <path
              d="M-35,35 C-60,10 -50,-40 -20,-50 C10,-60 40,-45 45,-20 C50,5 25,30 0,35 C-25,40 -30,35 -35,35 Z"
              fill="url(#grad2)"
              transform="translate(15, -55) rotate(-20) scale(0.9)"
            >
                <animateTransform attributeName="transform" type="rotate" from="-5 0 0" to="5 0 0" dur="4s" repeatCount="indefinite" additive="sum" />
            </path>
            
            <path
              d="M35,-35 C60,-10 50,40 20,50 C-10,60 -40,45 -45,20 C-50,-5 -25,-30 0,-35 C25,-40 30,-35 35,-35 Z"
              fill="url(#grad1)"
              transform="translate(-15, 55) rotate(160) scale(0.9)"
            >
                <animateTransform attributeName="transform" type="rotate" from="5 0 0" to="-5 0 0" dur="4s" repeatCount="indefinite" additive="sum" />
            </path>
            
            <path
              d="M0,0 C-20,-15 -10,-35 15,-40 C40,-45 50,-25 40,-5 C30,15 15,25 0,20 C-15,15 -10,5 0,0 Z"
              fill="currentColor"
              opacity="0.8"
              transform="translate(0,0) rotate(20)"
            >
              <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="6s" repeatCount="indefinite" />
            </path>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default Logo;
