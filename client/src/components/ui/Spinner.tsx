import React from 'react';

export interface SpinnerProps {
  readonly size?: number;
  readonly color?: string;
  readonly className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 20, 
  color = 'currentColor',
  className = '' 
}) => (
  <div
    style={{ 
      width: size, 
      height: size, 
      borderWidth: Math.max(1.5, size * 0.1),
      borderColor: `${color === 'currentColor' ? 'currentColor' : color}40`,
      borderTopColor: color
    }}
    className={`rounded-full animate-spin flex-shrink-0 ${className} ${color === 'currentColor' ? 'opacity-80' : ''}`}
  />
);

export default Spinner;
