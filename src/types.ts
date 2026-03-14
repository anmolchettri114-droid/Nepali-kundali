export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  nakshatra?: string;
}

export interface DashaEntry {
  planet: string;
  endDate: string;
}

export interface Rajyoga {
  name: string;
  description: string;
}

export interface KundaliData {
  id?: string;
  uid: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  planets: PlanetaryPosition[];
  navamshaPlanets?: PlanetaryPosition[];
  moonPlanets?: PlanetaryPosition[];
  ascendant: string;
  dasha?: DashaEntry[];
  rajyogas?: Rajyoga[];
  createdAt: string;
}

export interface MatchmakingResult {
  score: number;
  compatibility: string;
  details: {
    varna: string;
    vashya: string;
    tara: string;
    yoni: string;
    maitri: string;
    gana: string;
    bhakoot: string;
    nadi: string;
  };
  summary: string;
}

export interface PanchangData {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rashi: string;
}
