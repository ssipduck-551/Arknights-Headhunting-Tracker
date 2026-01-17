
import React, { useState, useEffect, useRef } from 'react';
import TrashIcon from './icons/TrashIcon';
import ChartIcon from './icons/ChartIcon';
import CogIcon from './icons/CogIcon';
import DatabaseIcon from './icons/DatabaseIcon';

interface HeaderProps {
  onManageBanners: () => void;
  onDataManagement: () => void;
  onAnalyze: () => void;
  onResetAllData: () => void;
}

const HeaderButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition-colors duration-200 ${className}`}
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ onManageBanners, onDataManagement, onAnalyze, onResetAllData }) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup timeout on component unmount
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleResetClick = () => {
    if (confirmingReset) {
      onResetAllData();
      setConfirmingReset(false);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    } else {
      setConfirmingReset(true);
      resetTimeoutRef.current = window.setTimeout(() => {
        setConfirmingReset(false);
      }, 3000); // 3 seconds to confirm
    }
  };


  return (
    <header>
      <h1 className="text-3xl font-bold text-white">명일방주 헤드헌팅 분석기</h1>
      <p className="text-gray-400 mt-1">가챠 기록 JSON 파일을 업로드하여 통계를 확인하세요.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <HeaderButton onClick={onDataManagement}>
          <DatabaseIcon /> 데이터 관리
        </HeaderButton>
        <HeaderButton onClick={onManageBanners}>
          <CogIcon /> 픽업 데이터 관리
        </HeaderButton>
         <HeaderButton onClick={onAnalyze} className="bg-blue-600 hover:bg-blue-500">
          <ChartIcon /> 분석
        </HeaderButton>
        <HeaderButton
          onClick={handleResetClick}
          className={confirmingReset ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-red-600 hover:bg-red-500'}
        >
          <TrashIcon /> {confirmingReset ? '확인을 위해 다시 클릭' : '모든 데이터 초기화'}
        </HeaderButton>
      </div>
    </header>
  );
};

export default Header;