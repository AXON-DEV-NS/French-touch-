import React from 'react';

interface RestaurantLogoProps {
  className?: string;
  light?: boolean;
}

export default function RestaurantLogo({ className = '', light = false }: RestaurantLogoProps) {
  // Deep charcoal/black for light backgrounds, warm cream for dark footers/headers
  const textColor = light ? '#FDFBF7' : '#1C1917';
  const strokeColor = light ? '#FDFBF7' : '#1C1917';
  const inlineStrokeColor = light ? '#1C1917' : '#FDFBF7';

  return (
    <div 
      className={`inline-flex items-center select-none ${className}`} 
      id="restaurant-logo-container"
      dir="ltr"
      style={{ direction: 'ltr' }}
    >
      <svg
        viewBox="0 0 320 95"
        className="w-full h-auto max-w-[200px] md:max-w-[240px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        dir="ltr"
        style={{ direction: 'ltr' }}
      >
        {/* Slanted French Flag Tricolor + Black accent line on the left */}
        <g transform="translate(10, 15)" id="logo-flag-group">
          {/* Blue Stripe */}
          <path
            d="M 10,45 L 20,10 L 28,10 L 18,45 Z"
            fill="#2B3E8C"
            id="logo-flag-blue"
          />
          {/* White Stripe */}
          <path
            d="M 18,45 L 28,10 L 36,10 L 26,45 Z"
            fill="#FFFFFF"
            stroke={light ? 'none' : '#E5E7EB'}
            strokeWidth="0.5"
            id="logo-flag-white"
          />
          {/* Red Stripe */}
          <path
            d="M 26,45 L 36,10 L 44,10 L 34,45 Z"
            fill="#ED2939"
            id="logo-flag-red"
          />
          {/* Black Slanted Accent Line (Parallel to flag) */}
          <path
            d="M 39,45 L 49,10"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            id="logo-flag-accent-line"
          />
        </g>

        {/* Word: FRENCH */}
        <g transform="translate(64, 12)" id="logo-french-group">
          {/* Thicker Base Text */}
          <text
            x="0"
            y="38"
            fill={textColor}
            stroke={textColor}
            strokeWidth="2"
            strokeLinejoin="round"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="40"
            letterSpacing="2"
            textAnchor="start"
            dir="ltr"
            style={{ direction: 'ltr' }}
            id="logo-text-french-base"
          >
            FRENCH
          </text>
          
          {/* Overlaid Thin Stroke to achieve the precise inline gap look with 100% reliability */}
          <text
            x="0"
            y="38"
            fill="none"
            stroke={inlineStrokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="40"
            letterSpacing="2"
            textAnchor="start"
            dir="ltr"
            style={{ direction: 'ltr' }}
            id="logo-text-french-inline"
          >
            FRENCH
          </text>
        </g>

        {/* Elegant Swoosh Separator (Underlines the brand beautifully) */}
        <path
          d="M 64,56 L 245,56 C 260,56 265,68 245,70 C 215,72 150,72 120,72"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          id="logo-swoosh-path"
        />

        {/* Word: TOUCH */}
        <g transform="translate(118, 12)" id="logo-touch-group">
          <text
            x="0"
            y="76"
            fill={textColor}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="300"
            fontSize="22"
            letterSpacing="9"
            textAnchor="start"
            dir="ltr"
            style={{ direction: 'ltr' }}
            id="logo-text-touch"
          >
            TOUCH
          </text>
        </g>
      </svg>
    </div>
  );
}
