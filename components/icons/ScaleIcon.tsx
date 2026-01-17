
import React from 'react';
const ScaleIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.354-6.044-.994m10.169-11.45c-.219-.075-.438-.148-.664-.221m-13.5 0c-.226.073-.445.146-.664.221m12.168 11.45c-2.029-.64-4.138-1-6.332-1s-4.303.36-6.332 1m12.664 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.036.243c-2.132 0-4.14-.354-6.044-.994" />
    </svg>
);
export default ScaleIcon;
