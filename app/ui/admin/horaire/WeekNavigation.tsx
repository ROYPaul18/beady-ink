// WeekNavigation.tsx
import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";

interface WeekNavigationProps {
  currentWeek: Date;
  navigateWeek: (direction: "prev" | "next") => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({ currentWeek, navigateWeek }) => {
  return (
    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4">
      <button
        onClick={() => navigateWeek("prev")}
        className="p-2 rounded-full"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 bg-white text-green rounded-full" />
      </button>

      <div className="flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-green md:hidden" />
        <span className="text-sm md:text-lg font-medium bg-white rounded-xl text-green p-2">
          Semaine du{" "}
          {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM/yyyy")}
        </span>
      </div>

      <button
        onClick={() => navigateWeek("next")}
        className="p-2 rounded-full"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 bg-white text-green rounded-full" />
      </button>
    </div>
  );
};

export default WeekNavigation;
