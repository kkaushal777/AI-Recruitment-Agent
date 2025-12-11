import React, { useEffect, useState } from 'react';

interface GaugeProps {
  score: number;
}

const Gauge: React.FC<GaugeProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // Animation duration in ms
    const startValue = 0;
    const endValue = Math.min(Math.max(score, 0), 100);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out quart function for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const current = Math.floor(startValue + (endValue - startValue) * easeProgress);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [score]);

  // Color logic based on the animating score for dynamic effect
  let color = 'text-red-500';
  if (displayScore >= 80) color = 'text-green-500';
  else if (displayScore >= 50) color = 'text-yellow-400';

  // SVG parameters
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        {/* Background Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-gray-700 opacity-20"
        />
        {/* Progress Circle with Glow Effect */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${color} transition-colors duration-300`}
          style={{ filter: `drop-shadow(0 0 4px currentColor)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${color} transition-colors duration-300 tabular-nums`}>
          {displayScore}%
        </span>
        <span className="text-xs text-gray-400 uppercase tracking-wider mt-1 font-medium">Match</span>
      </div>
    </div>
  );
};

export default Gauge;