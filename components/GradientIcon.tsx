import React from 'react';

interface GradientIconProps {
  children: React.ReactElement; // Oczekuje jednego elementu <path> lub podobnego
}

export const GradientIcon: React.FC<GradientIconProps> = ({ children }) => {
  const gradientId = `icon-gradient-${React.useId()}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill={`url(#${gradientId})`}>
      <defs>
        <linearGradient id={gradientId} x1="-1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#38bdf8" /> 
          <stop offset="100%" stopColor="#3b82f6" />
          <animate attributeName="x1" from="-1" to="1" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="x2" from="0" to="2" dur="1.5s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
};