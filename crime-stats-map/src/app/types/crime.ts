export type OutcomeStatus = {
  category: string;
  date: string;
} | null;

export type CrimeLocation = {
  street: {
    id: number;
    name: string;
  };
  latitude: string;
  longitude: string;
};

export type Crime = {
  /** Legacy numeric identifier from the UK Police API (not always present). */
  id?: string;
  /** Stable string identifier that persists across data updates. */
  persistent_id: string;
  category: string;
  location_type: string;
  location: CrimeLocation;
  context: string;
  outcome_status: OutcomeStatus;
  month: string;
};

export type CrimeSearchResponse = {
  crimes: Crime[];
  searchRadiusMetres?: number;
  searchCentreLat?: number;
  searchCentreLng?: number;
};
