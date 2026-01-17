
import React from 'react';
const TargetIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.025 12.025 0 01-4.252 6.164M15.59 14.37a6 6 0 00-5.84-7.38v4.82m5.84 2.56a12.025 12.025 0 004.252-6.164M12 3v2.25A6.75 6.75 0 0012 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25A6.75 6.75 0 0012 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-2.25A6.75 6.75 0 0012 21z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2.25A6.75 6.75 0 003 12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12h-2.25A6.75 6.75 0 0021 12z" />
    </svg>
);
export default TargetIcon;
