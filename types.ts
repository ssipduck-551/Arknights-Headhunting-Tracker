
export interface RawPull {
  pool: string;
  chars: {
    name: string;
    rarity: number;
    isNew: boolean;
    charId: string;
  }[];
  ts: number;
}

export interface UserRawPull {
  charId: string;
  charName: string;
  poolName: string;
  star: string;
  at: number;
}

export interface ProcessedPull {
  charId:string;
  charName: string;
  rarity: number;
  pool: string;
  ts: number;
  pity: number;
}

export enum BannerType {
  STANDARD = 'Standard',
  LIMITED = 'Limited',
  COLLAB = 'Collaboration',
}

export interface Banner {
  name: string;
  type: BannerType;
  rateUp6Stars: string[];
  standardRateUp6Stars?: string[]; // Only for Limited and Collab banners
}

export interface OverallStats {
  totalPulls: number;
  sixStarCount: number;
  fiveStarCount: number;
  sixStarRate: number;
  averagePity: number;
}

export interface OperatorPity {
    name: string;
    count: number;
    pities: number[];
    charId: string;
}

export interface SixStarStats {
    total: number;
    averagePity: number;
    rate: number;
    operators: OperatorPity[];
}

export interface OperatorCount {
    name: string;
    charId: string;
    count: number;
}