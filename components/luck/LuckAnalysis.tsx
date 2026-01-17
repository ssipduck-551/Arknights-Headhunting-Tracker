
import React from 'react';
import type { ProcessedPull, Banner, OverallStats } from '../../types';
import { BannerType } from '../../types';
import BellIcon from '../icons/BellIcon';
import GiftIcon from '../icons/GiftIcon';
import CashIcon from '../icons/CashIcon';

interface LuckAnalysisProps {
  pulls: ProcessedPull[];
  bannerPulls: ProcessedPull[];
  stats: OverallStats;
  bannerInfo: Banner | undefined;
  banners: Banner[];
}

const LuckStat: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-gray-700/50 p-3 sm:p-4 rounded-lg flex items-start gap-3 sm:gap-4 min-h-0 sm:min-h-[90px]">
    <div className="flex-shrink-0 text-yellow-400 mt-1">{icon}</div>
    <div>
      <h5 className="font-semibold text-gray-300 text-xs sm:text-base">{title}</h5>
      <div className="text-white mt-1">{children}</div>
    </div>
  </div>
);

const CompactLuckStat: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-700/50 p-3 rounded-lg text-center flex flex-col justify-center min-h-[70px]">
        <h5 className="font-semibold text-gray-300 text-sm">{title}</h5>
        <div className="text-white text-base mt-1">{children}</div>
    </div>
);


const LuckAnalysis: React.FC<LuckAnalysisProps> = ({ pulls, bannerPulls, stats, bannerInfo, banners }) => {
  const renderSixStarRateValue = () => {
    if (stats.totalPulls === 0) {
      return null;
    }
    const GAME_RATE = 2.0;
    const userRate = stats.sixStarRate;
    const luckScore = Math.min(50, Math.max(-50, (userRate / GAME_RATE - 1) * 50));
    const luckTier = 50 - luckScore;
    const displayTier = Math.max(1, Math.round(luckTier));
    return (
      <>
        <span className="font-bold text-base block sm:inline">{userRate.toFixed(2)}%</span>
        <span className="text-gray-400 text-xs block sm:inline sm:ml-2">(상위 {displayTier}%)</span>
      </>
    );
  };

  const calculateRateUpLuckValue = (
    targetOperatorNames: string[] | undefined,
    rateUpChance: number
  ): React.ReactNode => {
    if (!targetOperatorNames || targetOperatorNames.length === 0) {
      return <span className="text-gray-500">-</span>;
    }
    const expectedPulls = Math.round((1 / rateUpChance) * 34.5);
    const acquisitionPull = bannerPulls.find(p => targetOperatorNames.includes(p.charName));
    if (!acquisitionPull) {
      return <span className="text-gray-500">-</span>;
    }
    const acquisitionPulls = bannerPulls.indexOf(acquisitionPull) + 1;
    const luckScore = Math.min(50, Math.max(-50, (expectedPulls / acquisitionPulls - 1) * 50));
    const luckTier = 50 - luckScore;
    const displayTier = Math.max(1, Math.round(luckTier));
    return (
      <>
        <span className="font-bold text-base block sm:inline">{acquisitionPulls}회</span>
        <span className="text-gray-400 text-xs block sm:inline sm:ml-2">(상위 {displayTier}%)</span>
      </>
    );
  };

  const renderPityNotification = () => {
    if (!bannerInfo) return null;
    let pullsForPityCalc: ProcessedPull[];
    if (bannerInfo.type === BannerType.LIMITED || bannerInfo.type === BannerType.COLLAB) {
      pullsForPityCalc = bannerPulls;
    } else {
      const standardBannerNames = banners.filter(b => b.type === BannerType.STANDARD).map(b => b.name);
      pullsForPityCalc = pulls.filter(p => standardBannerNames.includes(p.pool));
    }
    const lastSixStarIndex = pullsForPityCalc.map(p => p.rarity === 6).lastIndexOf(true);
    const currentPity = lastSixStarIndex === -1 ? pullsForPityCalc.length : pullsForPityCalc.length - 1 - lastSixStarIndex;
    const pullsToSoftPity = 50 - currentPity;
    if (currentPity >= 50) {
      return <p className="text-xs sm:text-sm">현재 <span className="font-bold text-red-400">{currentPity}</span> 스택, 확률 보정 적용 중!</p>;
    }
    return (
      <p className="text-xs sm:text-sm">
        다음 보정까지 <span className="font-bold text-base sm:text-lg">{pullsToSoftPity > 0 ? pullsToSoftPity : 0}</span>회 (현재 {currentPity} 스택)
      </p>
    );
  };

  const renderSparkCounter = () => {
    if (!bannerInfo) return null;
    let sparkTarget = 0;
    if (bannerInfo.type === BannerType.LIMITED) sparkTarget = 300;
    else if (bannerInfo.type === BannerType.COLLAB) sparkTarget = 120;
    else if (bannerInfo.type === BannerType.STANDARD) sparkTarget = 150;
    if (sparkTarget === 0) {
      return <p className="text-xs sm:text-sm">이 픽업 유형은 천장이 없습니다.</p>;
    }
    if (bannerInfo.type === BannerType.STANDARD) {
      const rateUpNames = bannerInfo.rateUp6Stars;
      let lastRateUpIndex = -1;
      for (let i = bannerPulls.length - 1; i >= 0; i--) {
        if (bannerPulls[i].rarity === 6 && rateUpNames.includes(bannerPulls[i].charName)) {
          lastRateUpIndex = i;
          break;
        }
      }
      const pullsSinceLastRateUp = lastRateUpIndex === -1 ? bannerPulls.length : bannerPulls.length - 1 - lastRateUpIndex;
      const remaining = 150 - pullsSinceLastRateUp;
      return (
        <p className="text-xs sm:text-sm">
          천장까지 <span className="font-bold text-base sm:text-lg">{remaining > 0 ? remaining : 0}</span>회 남음 ({pullsSinceLastRateUp}/150)
        </p>
      );
    }
    const remaining = sparkTarget - bannerPulls.length;
    return (
      <p className="text-xs sm:text-sm">
        천장까지 <span className="font-bold text-base sm:text-lg">{remaining > 0 ? remaining : 0}</span>회 남음 ({bannerPulls.length}/{sparkTarget})
      </p>
    );
  };

  const renderTotalOrundumUsed = () => {
    const ORUNDUM_PER_PULL = 600;
    const totalOrundum = stats.totalPulls * ORUNDUM_PER_PULL;
    return (
      <p className="text-xs sm:text-sm">
        <span className="font-bold text-base sm:text-lg">{totalOrundum.toLocaleString()}</span> 합성옥
      </p>
    );
  };

  const renderOverallLuck = () => {
    if (bannerInfo?.type === BannerType.LIMITED) {
      const limitedNames = bannerInfo.rateUp6Stars;
      const standardNames = bannerInfo.standardRateUp6Stars;
      let firstLimitedPullIndex = -1;
      let firstStandardPullIndex = -1;
      if (limitedNames?.length && standardNames?.length) {
        for (let i = 0; i < bannerPulls.length; i++) {
          const pull = bannerPulls[i];
          if (firstLimitedPullIndex === -1 && limitedNames.includes(pull.charName)) firstLimitedPullIndex = i;
          if (firstStandardPullIndex === -1 && standardNames.includes(pull.charName)) firstStandardPullIndex = i;
          if (firstLimitedPullIndex !== -1 && firstStandardPullIndex !== -1) break;
        }
      }
      let bothLuckData;
      if (firstLimitedPullIndex !== -1 && firstStandardPullIndex !== -1) {
        const acquisitionPulls = Math.max(firstLimitedPullIndex, firstStandardPullIndex) + 1;
        const expectedPulls = 141.2;
        const luckScore = Math.min(50, Math.max(-50, (expectedPulls / acquisitionPulls - 1) * 50));
        const luckTier = 50 - luckScore;
        const displayTier = Math.max(1, Math.round(luckTier));
        bothLuckData = (
          <>
            <span className="font-bold text-base block sm:inline">{acquisitionPulls}회</span>
            <span className="text-gray-400 text-xs block sm:inline sm:ml-2">(상위 {displayTier}%)</span>
          </>
        );
      } else {
        bothLuckData = <span className="text-gray-500">-</span>;
      }

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CompactLuckStat title="6성 획득률">{renderSixStarRateValue()}</CompactLuckStat>
          <CompactLuckStat title="전체 픽업">{bothLuckData}</CompactLuckStat>
          <CompactLuckStat title="한정 오퍼">{calculateRateUpLuckValue(bannerInfo.rateUp6Stars, 0.35)}</CompactLuckStat>
          <CompactLuckStat title="통상 픽업">{calculateRateUpLuckValue(bannerInfo.standardRateUp6Stars, 0.35)}</CompactLuckStat>
        </div>
      );
    }

    return (
       <div className="grid grid-cols-2 gap-3">
          <CompactLuckStat title="6성 획득률">{renderSixStarRateValue()}</CompactLuckStat>
          {bannerInfo && (
              <CompactLuckStat title="픽업 획득률">
                  {calculateRateUpLuckValue(
                      bannerInfo.rateUp6Stars,
                      bannerInfo.type === BannerType.STANDARD ? 0.5 : 0.7
                  )}
              </CompactLuckStat>
          )}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-yellow-400 mb-3">운의 척도</h3>
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-300 mb-2">운 종합</h4>
        {renderOverallLuck()}
      </div>
      <div>
        <h4 className="text-md font-semibold text-gray-300 mb-2">재화 및 스택</h4>
        <div className={bannerInfo ? "grid grid-cols-1 sm:grid-cols-3 gap-3" : ""}>
          <LuckStat title="총 사용 합성옥" icon={<CashIcon className="w-6 h-6 sm:w-8 sm:h-8" />}>{renderTotalOrundumUsed()}</LuckStat>
          {bannerInfo && <LuckStat title="스택 알림" icon={<BellIcon className="w-6 h-6 sm:w-8 sm:h-8" />}>{renderPityNotification()}</LuckStat>}
          {bannerInfo && <LuckStat title="천장 카운트" icon={<GiftIcon className="w-6 h-6 sm:w-8 sm:h-8" />}>{renderSparkCounter()}</LuckStat>}
        </div>
      </div>
    </div>
  );
};

export default LuckAnalysis;
