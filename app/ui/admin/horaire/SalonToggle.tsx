// SalonToggle.tsx
import React from "react";

interface SalonToggleProps {
  isSoyeOpen: boolean;
  handleWeekToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}

const SalonToggle: React.FC<SalonToggleProps> = ({
  isSoyeOpen,
  handleWeekToggle,
  isLoading,
}) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="soye-open"
          checked={isSoyeOpen}
          onChange={handleWeekToggle}
          disabled={isLoading}
          className="w-4 h-4 text-green border-gray-300 rounded focus:ring-green"
        />
        <label
          htmlFor="soye-open"
          className="text-xs md:text-sm font-medium text-green cursor-pointer"
        >
          Soye en Septaine est ouvert cette semaine
        </label>
      </div>
    </div>
  );
};

export default SalonToggle;
