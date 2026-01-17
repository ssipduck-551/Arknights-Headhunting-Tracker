// FIX: Import React to resolve the "Cannot find namespace 'React'" error.
import React from 'react';
import type { RawPull, ProcessedPull, OverallStats, SixStarStats, Banner, UserRawPull, OperatorCount } from '../types';
import { BannerType } from '../types';

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%234a5568'%3E%3Crect width='100' height='100' fill='%232d3748'/%3E%3Ctext x='50' y='55' font-size='40' text-anchor='middle' alignment-baseline='middle' fill='%23718096'%3E?%3C/text%3E%3C/svg%3E`;
  e.currentTarget.onerror = null;
};

export const transformUserData = (data: UserRawPull[]): RawPull[] => {
  const groupedByTimestamp = data.reduce((acc, pull) => {
    const key = pull.at;
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(pull);
    return acc;
  }, new Map<number, UserRawPull[]>());

  const transformedData: RawPull[] = [];
  for (const [timestamp, pulls] of groupedByTimestamp.entries()) {
    if (pulls.length > 0) {
      transformedData.push({
        pool: pulls[0].poolName,
        ts: Math.floor(timestamp / 1000),
        chars: pulls.map(p => ({
          name: p.charName,
          rarity: parseInt(p.star, 10),
          isNew: false,
          charId: p.charId,
        }))
      });
    }
  }
  
  return transformedData.sort((a, b) => a.ts - b.ts);
};

export const processPullsData = (rawPulls: RawPull[]): ProcessedPull[] => {
  if (!rawPulls || rawPulls.length === 0) {
    return [];
  }

  const flattenedPulls = rawPulls
    .flatMap(p => p.chars.map(char => ({
      charName: char.name,
      rarity: char.rarity,
      pool: p.pool,
      ts: p.ts,
      charId: char.charId
    })))
    .sort((a, b) => a.ts - b.ts);

  let pityCounter = 0;
  return flattenedPulls.map(pull => {
    pityCounter++;
    const processedPull: ProcessedPull = { ...pull, pity: 0 };
    if (pull.rarity === 6) {
      processedPull.pity = pityCounter;
      pityCounter = 0;
    }
    return processedPull;
  });
};

export const calculateOverallStats = (pulls: ProcessedPull[]): OverallStats => {
  const totalPulls = pulls.length;
  if (totalPulls === 0) {
    return { totalPulls: 0, sixStarCount: 0, fiveStarCount: 0, sixStarRate: 0, averagePity: 0 };
  }

  const sixStarPulls = pulls.filter(p => p.rarity === 6);
  const sixStarCount = sixStarPulls.length;
  const fiveStarCount = pulls.filter(p => p.rarity === 5).length;
  const sixStarRate = (sixStarCount / totalPulls) * 100;
  
  const totalPity = sixStarPulls.reduce((sum, p) => sum + p.pity, 0);
  const averagePity = sixStarCount > 0 ? totalPity / sixStarCount : 0;

  return {
    totalPulls,
    sixStarCount,
    fiveStarCount,
    sixStarRate,
    averagePity
  };
};

export const getPullsByBanner = (pulls: ProcessedPull[]): Record<string, number> => {
  return pulls.reduce((acc, pull) => {
    acc[pull.pool] = (acc[pull.pool] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const analyzeBannerPulls = (pulls: ProcessedPull[], bannerInfo: Banner | undefined) => {
  if (!bannerInfo) return null;

  const bannerPulls = pulls.filter(p => p.pool === bannerInfo.name);
  const sixStarsOnBanner = bannerPulls.filter(p => p.rarity === 6);

  if (bannerInfo.type === BannerType.LIMITED || bannerInfo.type === BannerType.COLLAB || bannerInfo.type === BannerType.STANDARD) {
    const mainRateUp = bannerInfo.rateUp6Stars; 
    const standardRateUp = bannerInfo.standardRateUp6Stars || [];
    
    const mainRateUpPulls = sixStarsOnBanner.filter(p => mainRateUp.includes(p.charName));
    const standardPulls = sixStarsOnBanner.filter(p => standardRateUp.includes(p.charName));
    const offBannerPulls = sixStarsOnBanner.filter(p => !mainRateUp.includes(p.charName) && !standardRateUp.includes(p.charName));

    const avgPity = (pulls: ProcessedPull[]) => pulls.length > 0 ? pulls.reduce((sum, p) => sum + p.pity, 0) / pulls.length : 0;
    
    return {
      mainRateUpPulls,
      standardPulls,
      offBannerPulls,
      avgMainRateUpPity: avgPity(mainRateUpPulls),
      avgStandardPity: avgPity(standardPulls),
      avgOffBannerPity: avgPity(offBannerPulls),
    };
  }

  return null;
};

export const calculateOperatorCounts = (pulls: ProcessedPull[], rarity: number): OperatorCount[] => {
    const rarityPulls = pulls.filter(p => p.rarity === rarity);
    const counts = rarityPulls.reduce((acc, pull) => {
        if (!acc[pull.charName]) {
            acc[pull.charName] = { name: pull.charName, charId: pull.charId, count: 0 };
        }
        acc[pull.charName].count++;
        return acc;
    }, {} as Record<string, OperatorCount>);

    return Object.values(counts).sort((a, b) => b.count - a.count);
};