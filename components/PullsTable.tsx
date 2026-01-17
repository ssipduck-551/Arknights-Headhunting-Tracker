import React from 'react';
import type { ProcessedPull, Banner } from '../types';
import { BannerType } from '../types';
import { handleImageError } from '../utils/helpers';

interface PullsTableProps {
  pulls: ProcessedPull[];
  banners: Banner[];
}

const getRarityRingClass = (rarity: number) => {
    switch (rarity) {
      case 6: return 'ring-yellow-400';
      case 5: return 'ring-yellow-600';
      case 4: return 'ring-purple-500';
      case 3: return 'ring-blue-500';
      default: return 'ring-transparent';
    }
};

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

const getBannerNameColorClass = (type: BannerType): string => {
    switch (type) {
        case BannerType.STANDARD: return 'text-blue-400';
        case BannerType.LIMITED: return 'text-yellow-400';
        case BannerType.COLLAB: return 'text-purple-400';
        default: return '';
    }
};

const PullsTable: React.FC<PullsTableProps> = ({ pulls, banners }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="table-fixed w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-700 tracking-tight">
          <tr>
            <th scope="col" className="px-2 py-3 w-14">아바타</th>
            <th scope="col" className="px-2 py-3 w-28">오퍼레이터</th>
            <th scope="col" className="px-2 py-3 w-20">픽업</th>
            <th scope="col" className="px-2 py-3 w-28 text-center">날짜</th>
          </tr>
        </thead>
        <tbody>
          {pulls.map((pull, index) => {
            const bannerInfo = banners.find(b => b.name === pull.pool);

            const truncatedCharName = pull.charName.length > 8 ? `${pull.charName.substring(0, 8)}...` : pull.charName;
            const truncatedPoolName = pull.pool.length > 4 ? `${pull.pool.substring(0, 4)}...` : pull.pool;

            return (
            <tr key={`${pull.ts}-${index}-${pull.charName}`} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
              <td className="px-2 py-2 align-middle">
                <img
                  src={`https://raw.githubusercontent.com/fexli/ArknightsResource/main/avatar/ASSISTANT/${pull.charId}.png`}
                  alt={pull.charName}
                  className={`w-11 h-11 rounded-full bg-gray-700 object-cover ring-2 ${getRarityRingClass(pull.rarity)}`}
                  onError={handleImageError}
                />
              </td>
              <td className="px-2 py-2 font-semibold text-white tracking-tight align-middle">
                <div className="truncate" title={pull.charName}>{truncatedCharName}</div>
              </td>
              <td className="px-2 py-2 align-middle">
                  <div className={`hidden sm:block truncate tracking-tight font-semibold ${bannerInfo ? getBannerNameColorClass(bannerInfo.type) : ''}`} title={pull.pool}>
                    {truncatedPoolName}
                  </div>
                  <div className="sm:hidden">
                    {bannerInfo ? (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBannerTypePillClass(bannerInfo.type)}`}>
                        {translateBannerType(bannerInfo.type)}
                      </span>
                    ) : (
                      <div className="truncate tracking-tight text-xs font-semibold" title={pull.pool}>{truncatedPoolName}</div>
                    )}
                  </div>
              </td>
              <td className="px-2 py-2 whitespace-nowrap text-center align-middle">
                  <span className="hidden sm:inline">{new Date(pull.ts * 1000).toLocaleString()}</span>
                  <span className="sm:hidden font-semibold font-mono">{new Date(pull.ts * 1000).toLocaleDateString('en-CA').slice(2).replace(/-/g, '.')}</span>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
       {pulls.length === 0 && <p className="text-center py-8 text-gray-500">표시할 데이터가 없습니다.</p>}
    </div>
  );
};

export default PullsTable;