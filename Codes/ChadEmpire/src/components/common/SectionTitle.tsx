import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 
      className={`text-3xl md:text-4xl font-bold mb-4 ${className}`}
      style={{ fontFamily: "'Game Of Squids', sans-serif" }}
    >
      {children}
    </h2>
  );
};

export default SectionTitle;
