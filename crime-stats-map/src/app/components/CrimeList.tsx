import React from "react";
import { Crime } from "../types/crime";

type CrimeListProps = {
  crimes: Crime[];
  selectedCategories: Set<string>;
};

export function CrimeList({ crimes, selectedCategories }: CrimeListProps) {
  const filteredCrimes = React.useMemo(() => {
    if (selectedCategories.size === 0) return crimes;
    return crimes.filter((crime) => selectedCategories.has(crime.category));
  }, [crimes, selectedCategories]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Crime List{" "}
        <span className="text-sm font-normal text-gray-500">
          ({filteredCrimes.length} crimes)
        </span>
      </h2>
      {filteredCrimes.length === 0 ? (
        <p className="text-gray-500 text-sm">No crimes match the selected filters.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {filteredCrimes.map((crime, index) => (
            <li
              key={crime.persistent_id || index}
              className="px-4 py-3 bg-white hover:bg-gray-50 text-sm"
            >
              <p className="font-medium text-gray-800">
                {crime.location?.street?.name ?? "Unknown location"}
              </p>
              <p className="text-gray-600 mt-0.5">
                {crime.category.replace(/-/g, " ")}
              </p>
              <p className="text-gray-500 mt-0.5">
                {crime.outcome_status?.category ?? "No outcome recorded"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
