import React, { useState, useMemo } from 'react';
import type { ProcessedPull, Banner, OperatorCount } from '../../types';
import { getPullsByBanner, calculateOperatorCounts, calculateOverallStats, handleImageError } from '../../utils/helpers';
import Modal from './Modal';
import LuckAnalysis from '../luck/LuckAnalysis';
import DuplicateOperatorsModal from './DuplicateOperatorsModal';
import BannerSummaryModal from './BannerSummaryModal';

interface AnalysisModalProps {
  pulls: ProcessedPull[];
  banners: Banner[];
  onClose: () => void;
}

const PityAvatar: React.FC<{ pull: ProcessedPull; isRateUp: boolean }> = ({ pull, isRateUp }) => {
    const borderClass = isRateUp ? 'ring-red-500' : 'ring-gray-500';
    
    return (
        <div className="relative flex-shrink-0" title={`${pull.charName} - ${pull.pity} 스택`}>
            <img
                src={`https://raw.githubusercontent.com/fexli/ArknightsResource/main/avatar/ASSISTANT/${pull.charId}.png`}
                alt={pull.charName}
                className={`w-16 h-16 rounded-full ring-2 object-cover bg-gray-700 ${borderClass}`}
                onError={handleImageError}
            />
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full px-1.5 py-0.5 text-xs font-bold text-white border-2 border-gray-800">
                {pull.pity}
            </div>
        </div>
    );
};


const AnalysisModal: React.FC<AnalysisModalProps> = ({ pulls, banners, onClose }) => {
  const [selectedBanner, setSelectedBanner] = useState<string>('All');
  const [isDuplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [isBannerSummaryModalOpen, setBannerSummaryModalOpen] = useState(false);

  const pullsByBanner = useMemo(() => getPullsByBanner(pulls), [pulls]);

  const displayData = useMemo(() => {
    const isAll = selectedBanner === 'All';
    const targetPulls = isAll ? pulls : pulls.filter(p => p.pool === selectedBanner);

    let pullsForStats: ProcessedPull[];
    
    if (isAll) {
      pullsForStats = targetPulls;
    } else {
      let localPityCounter = 0;
      pullsForStats = targetPulls.map(pull => {
        localPityCounter++;
        const newPull = { ...pull };
        if (pull.rarity === 6) {
          newPull.pity = localPityCounter;
          localPityCounter = 0;
        }
        return newPull;
      });
    }

    const stats = calculateOverallStats(pullsForStats);
    const sixStars = pullsForStats.filter(p => p.rarity === 6).sort((a,b) => b.ts - a.ts)
    .map(pull => {
        const bannerForPull = banners.find(b => b.name === pull.pool);
        const rateUpNames = bannerForPull ? [...bannerForPull.rateUp6Stars, ...(bannerForPull.standardRateUp6Stars || [])] : [];
        return {
            ...pull,
            isRateUp: rateUpNames.includes(pull.charName)
        };
    });
    
    const bannerInfo = isAll ? undefined : banners.find(b => b.name === selectedBanner);
    
    return {
        stats,
        sixStars,
        fiveCounts: calculateOperatorCounts(targetPulls, 5),
        sixCounts: calculateOperatorCounts(targetPulls, 6),
        bannerInfo,
        targetPulls,
    };
  }, [selectedBanner, pulls, banners]);
  
  return (
    <>
      <Modal title="분석" onClose={onClose} size="3xl">
        <div className="mb-4">
          <label htmlFor="banner-selector" className="block text-sm font-medium mb-1">분석 대상 픽업:</label>
          <select 
              id="banner-selector" 
              value={selectedBanner}
              onChange={e => setSelectedBanner(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Banners</option>
            {Object.keys(pullsByBanner).map(banner => <option key={banner} value={banner}>{banner}</option>)}
          </select>
        </div>

        <div className="space-y-6">
          {/* 1. 요약 */}
          <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">요약</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg text-center"><p className="text-xs sm:text-sm text-gray-400">총 뽑기</p><p className="text-xl sm:text-2xl font-bold mt-1">{displayData.stats.totalPulls}</p></div>
                  <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg text-center"><p className="text-xs sm:text-sm text-gray-400">6★ 획득률</p><p className="text-xl sm:text-2xl font-bold mt-1">{displayData.stats.sixStarRate.toFixed(2)}%</p></div>
                  <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg text-center"><p className="text-xs sm:text-sm text-gray-400">평균 6★ 스택</p><p className="text-xl sm:text-2xl font-bold mt-1">{displayData.stats.averagePity.toFixed(2)}</p></div>
              </div>
          </div>

          {/* 2. 6★ 획득 기록 */}
          <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">6★ 획득 기록 ({displayData.sixStars.length}개)</h3>
              <div className="bg-gray-800 p-4 rounded-lg min-h-[112px]">
                {displayData.sixStars.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {displayData.sixStars.map(pull => (
                            <PityAvatar key={`${pull.ts}-${pull.charId}`} pull={pull} isRateUp={pull.isRateUp} />
                        ))}
                    </div>
                ) : <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-center py-4">데이터 없음</p></div>}
              </div>
          </div>
          
          {selectedBanner === 'All' && (
             <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">픽업별 요약</h3>
                <button
                    onClick={() => setBannerSummaryModalOpen(true)}
                    className="w-full bg-gray-700/50 hover:bg-gray-700 rounded-md font-semibold text-lg transition-colors py-4"
                >
                    픽업별 뽑기 횟수 보기
                </button>
            </div>
          )}

          {/* 3. 운의 척도 */}
          <div className="mt-6">
              <LuckAnalysis
                  pulls={pulls}
                  bannerPulls={displayData.targetPulls}
                  stats={displayData.stats}
                  bannerInfo={displayData.bannerInfo}
                  banners={banners}
              />
          </div>

          {/* 4. 중복 획득 분석 버튼 */}
          <div className="mt-6">
             <h3 className="text-lg font-semibold text-yellow-400 mb-3">중복 획득 분석</h3>
             <button
                onClick={() => setDuplicateModalOpen(true)}
                className="w-full bg-gray-700/50 hover:bg-gray-700 rounded-md font-semibold text-lg transition-colors py-4"
              >
                중복 획득 오퍼레이터 보기
              </button>
          </div>
        </div>
      </Modal>
      {isDuplicateModalOpen && (
        <DuplicateOperatorsModal
          sixStarCounts={displayData.sixCounts}
          fiveStarCounts={displayData.fiveCounts}
          showFiveStars={selectedBanner !== 'All'}
          onClose={() => setDuplicateModalOpen(false)}
        />
      )}
       {isBannerSummaryModalOpen && (
        <BannerSummaryModal
          pullsByBanner={pullsByBanner}
          banners={banners}
          onClose={() => setBannerSummaryModalOpen(false)}
        />
      )}
    </>
  );
};

export default AnalysisModal;