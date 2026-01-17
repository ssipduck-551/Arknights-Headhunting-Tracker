
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { RawPull, ProcessedPull, Banner, SixStarStats, OperatorPity, OperatorCount } from './types';
import { BannerType } from './types';
import Header from './components/Header';
import StatCard from './components/StatCard';
import PullsTable from './components/PullsTable';
import ManageBannersModal from './components/modals/ManageBannersModal';
import DataManagementModal from './components/modals/DataManagementModal';
import AnalysisModal from './components/modals/AnalysisModal';
import Pagination from './components/Pagination';
import { processPullsData, calculateOverallStats, getPullsByBanner, calculateOperatorCounts } from './utils/helpers';

const PULLS_PER_PAGE = 10;

const App: React.FC = () => {
  const [rawPulls, setRawPulls] = useState<RawPull[]>([]);
  const [processedPulls, setProcessedPulls] = useState<ProcessedPull[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filter, setFilter] = useState({
    type: 'All',
    rarity: 'All',
    bannerName: 'All'
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [isManageBannersModalOpen, setManageBannersModalOpen] = useState(false);
  const [isDataManagementModalOpen, setDataManagementModalOpen] = useState(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);

  useEffect(() => {
    const savedPulls = localStorage.getItem('arknights-pulls');
    const savedBanners = localStorage.getItem('arknights-banners');
    if (savedPulls) {
      const parsedPulls: RawPull[] = JSON.parse(savedPulls);
      setRawPulls(parsedPulls);
      const processed = processPullsData(parsedPulls);
      setProcessedPulls(processed);
    }
    if (savedBanners) {
      setBanners(JSON.parse(savedBanners));
    }
  }, []);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleDataLoad = useCallback((data: RawPull[]) => {
    setRawPulls(prevRawPulls => {
      const combinedPulls = [...prevRawPulls, ...data];
      
      const uniquePullsMap = new Map<number, RawPull>();
      combinedPulls.forEach(pull => {
        uniquePullsMap.set(pull.ts, pull);
      });
      
      const uniquePulls = Array.from(uniquePullsMap.values()).sort((a, b) => a.ts - b.ts);

      const processed = processPullsData(uniquePulls);
      setProcessedPulls(processed);
      localStorage.setItem('arknights-pulls', JSON.stringify(uniquePulls));
      return uniquePulls;
    });
  }, []);

  const saveBanners = useCallback((updatedBanners: Banner[]) => {
    setBanners(updatedBanners);
    localStorage.setItem('arknights-banners', JSON.stringify(updatedBanners));
  }, []);
  
  const mergeBanners = useCallback((newBanners: Banner[]) => {
    setBanners(prevBanners => {
      const bannerMap = new Map<string, Banner>();
      prevBanners.forEach(banner => bannerMap.set(banner.name, banner));
      newBanners.forEach(banner => bannerMap.set(banner.name, banner));

      const mergedBanners = Array.from(bannerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      localStorage.setItem('arknights-banners', JSON.stringify(mergedBanners));
      return mergedBanners;
    });
  }, []);

  const resetAllData = () => {
    localStorage.removeItem('arknights-pulls');
    localStorage.removeItem('arknights-banners');
    setRawPulls([]);
    setProcessedPulls([]);
    setBanners([]);
  };

  const overallStats = useMemo(() => calculateOverallStats(processedPulls), [processedPulls]);
  const pullsByBanner = useMemo(() => getPullsByBanner(processedPulls), [processedPulls]);

  const filteredPulls = useMemo(() => {
    return processedPulls.filter(pull => {
      const bannerInfo = banners.find(b => b.name === pull.pool);
      const typeMatch = filter.type === 'All' || (bannerInfo && bannerInfo.type === filter.type);
      const rarityMatch = filter.rarity === 'All' || pull.rarity === parseInt(filter.rarity, 10);
      const bannerMatch = filter.bannerName === 'All' || pull.pool === filter.bannerName;
      return typeMatch && rarityMatch && bannerMatch;
    }).sort((a,b) => b.ts - a.ts);
  }, [processedPulls, filter, banners]);
  
  const paginatedPulls = useMemo(() => {
    const startIndex = (currentPage - 1) * PULLS_PER_PAGE;
    return filteredPulls.slice(startIndex, startIndex + PULLS_PER_PAGE);
  }, [filteredPulls, currentPage]);

  const totalPages = Math.ceil(filteredPulls.length / PULLS_PER_PAGE);
  
  const handleFilterChange = (filterType: keyof typeof filter, value: string) => {
    setFilter(prev => ({
        ...prev,
        [filterType]: value,
        ...(filterType === 'type' && { bannerName: 'All' })
    }));
  };
  
  const handleResetFilters = () => {
      setFilter({
          type: 'All',
          rarity: 'All',
          bannerName: 'All'
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
          onManageBanners={() => setManageBannersModalOpen(true)}
          onDataManagement={() => setDataManagementModalOpen(true)}
          onAnalyze={() => setAnalysisModalOpen(true)}
          onResetAllData={resetAllData}
        />
        
        <main className="mt-8">
          <section>
            <h2 className="text-xl font-bold mb-4">전체 요약</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard title="총 뽑기" value={overallStats.totalPulls.toLocaleString()} />
              <StatCard title="6★ 획득" value={overallStats.sixStarCount.toLocaleString()} />
              <StatCard title="5★ 획득" value={overallStats.fiveStarCount.toLocaleString()} />
              <StatCard title="6★ 획득률" value={`${overallStats.sixStarRate.toFixed(2)}%`} />
              <StatCard title="평균 6★" value={overallStats.averagePity.toFixed(2)} />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold mb-4">상세 기록 필터</h2>
            <div className="flex flex-col sm:flex-row items-end gap-4 mb-4">
                <div className="flex gap-4 w-full sm:w-auto sm:flex-1">
                    <div className="w-1/2 sm:flex-1">
                        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-400 mb-1">픽업 유형</label>
                        <select
                            id="type-filter"
                            value={filter.type}
                            onChange={e => handleFilterChange('type', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="All">전체</option>
                            <option value={BannerType.STANDARD}>상시</option>
                            <option value={BannerType.LIMITED}>한정</option>
                            <option value={BannerType.COLLAB}>콜라보</option>
                        </select>
                    </div>
                    <div className="w-1/2 sm:flex-1">
                        <label htmlFor="rarity-filter" className="block text-sm font-medium text-gray-400 mb-1">성급 (★)</label>
                        <select
                            id="rarity-filter"
                            value={filter.rarity}
                            onChange={e => handleFilterChange('rarity', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="All">전체</option>
                            <option value="6">6★</option>
                            <option value="5">5★</option>
                            <option value="4">4★</option>
                            <option value="3">3★</option>
                        </select>
                    </div>
                </div>
                <div className="w-full sm:w-auto sm:flex-1">
                    <label htmlFor="banner-filter" className="block text-sm font-medium text-gray-400 mb-1">배너명</label>
                    <select
                        id="banner-filter"
                        value={filter.bannerName}
                        onChange={e => handleFilterChange('bannerName', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="All">전체</option>
                        {Object.keys(pullsByBanner).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="w-full sm:w-auto">
                    <button 
                        onClick={handleResetFilters}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold transition-colors"
                    >
                        필터 초기화
                    </button>
                </div>
            </div>
            <PullsTable pulls={paginatedPulls} banners={banners} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </section>
        </main>
      </div>
      
      {isManageBannersModalOpen && (
        <ManageBannersModal
          banners={banners}
          onSave={saveBanners}
          onClose={() => setManageBannersModalOpen(false)}
        />
      )}

      {isDataManagementModalOpen && (
        <DataManagementModal
          rawPulls={rawPulls}
          banners={banners}
          onDataLoad={handleDataLoad}
          onBannersLoad={mergeBanners}
          onClose={() => setDataManagementModalOpen(false)}
        />
      )}

      {isAnalysisModalOpen && (
        <AnalysisModal
          pulls={processedPulls}
          banners={banners}
          onClose={() => setAnalysisModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
