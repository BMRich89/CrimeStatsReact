export type CrimeLocation = {
  latitude: string;
  longitude: string;
  street: {
    id: number;
    name: string;
  };
};

export type OutcomeStatus = {
  category: string;
  date: string;
} | null;

export type Crime = {
  category: string;
  persistent_id: string;
  id: number;
  location: CrimeLocation;
  month: string;
  outcome_status: OutcomeStatus;
};
