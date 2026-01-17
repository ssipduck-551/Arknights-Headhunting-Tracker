import React from 'react';
import Modal from './Modal';
import type { Banner } from '../../types';
import { BannerType } from '../../types';

interface BannerSummaryModalProps {
  pullsByBanner: Record<string, number>;
  banners: Banner[];
  onClose: () => void;
}

const translateBannerType = (type: BannerType): string => {
    switch (type) {
        case BannerType.STANDARD: return '상시';
        case BannerType.LIMITED: return '한정';
        case BannerType.COLLAB: return '콜라보';
        default: return type;
    }
};

const getBannerTypePillClass = (type: BannerType): string => {
    switch (type) {
        case BannerType.STANDARD: return 'bg-blue-600 text-blue-100';
        case BannerType.LIMITED: return 'bg-yellow-500 text-yellow-100';
        case BannerType.COLLAB: return 'bg-purple-600 text-purple-100';
        default: return 'bg-gray-600 text-gray-100';
    }
};

const BannerSummaryModal: React.FC<BannerSummaryModalProps> = ({ pullsByBanner, banners, onClose }) => {
  const bannerData = Object.entries(pullsByBanner)
    .map(([name, count]) => {
      const bannerInfo = banners.find(b => b.name === name);
      return {
        name,
        count,
        type: bannerInfo?.type,
      };
    })
    // FIX: Explicitly cast count to Number to resolve arithmetic operation error on non-numeric types.
    .sort((a, b) => Number(b.count) - Number(a.count));

  return (
    <Modal title="픽업별 뽑기 횟수" onClose={onClose} size="lg">
      <div className="space-y-2">
        {bannerData.map(banner => (
          <div key={banner.name} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
            <div className="flex flex-col items-start gap-1">
              <p className="font-semibold text-white">{banner.name}</p>
              {banner.type && (
                 <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getBannerTypePillClass(banner.type)}`}>
                    {translateBannerType(banner.type)}
                 </span>
              )}
            </div>
            <p className="font-bold text-lg text-white">{banner.count}회</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default BannerSummaryModal;