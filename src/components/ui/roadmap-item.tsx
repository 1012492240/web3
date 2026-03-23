import React from 'react';

interface RoadmapItemProps {
  date: string;
  title: string;
  className?: string;
}

export const RoadmapItem = ({ date, title, className = '' }: RoadmapItemProps) => {
  return (
    <div 
      className={`relative min-h-[120px] md:min-h-[140px] rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        boxShadow: '0 0 15px rgba(108, 73, 254, 0.3)',
        border: '1px solid rgba(108, 73, 254, 0.3)'
      }}
    >
      {/* Top-left corner decoration */}
      <div 
        className="absolute top-0 left-0 w-8 h-8"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          background: 'linear-gradient(135deg, rgba(186, 91, 255, 0.5), rgba(113, 75, 255, 0.3))'
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-center h-full">
        <div className="text-[#BA5BFF] mb-2 text-sm md:text-base">{date}</div>
        <div className="text-base md:text-lg text-[#E2E2E2] md:pr-4">{title}</div>
      </div>
    </div>
  );
};
