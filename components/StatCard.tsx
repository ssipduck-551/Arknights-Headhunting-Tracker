
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
    </div>
  );
};

export default StatCard;
