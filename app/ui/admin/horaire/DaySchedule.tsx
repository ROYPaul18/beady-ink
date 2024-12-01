// // DaySchedule.tsx
// import React from "react";
// import { formatTimeTo24Hour } from "@/lib/formatTimeTo24Hour"; // Utilisation d'un utilitaire pour la conversion d'heure
// import { OpeningHour } from "@/lib/types";

// interface DayScheduleProps {
//   day: string;
//   formattedDate: string;
//   isPast: boolean;
//   dayHours: OpeningHour | undefined;
//   activeSalon: string;
//   setEditingDay: (day: string) => void;
// }

// const DaySchedule: React.FC<DayScheduleProps> = ({
//   day,
//   formattedDate,
//   isPast,
//   dayHours,
//   activeSalon,
//   setEditingDay,
// }) => {
//   return (
//     <div className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 border rounded-lg ${isPast ? "bg-gray-100 text-gray-500" : "bg-white"}`}>
//       <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
//         <div className="flex items-center justify-between md:justify-start gap-2">
//           <span className="font-medium capitalize text-sm md:text-base">
//             {day}
//           </span>
//           <span className="text-xs md:text-sm text-gray-500">
//             {formattedDate}
//           </span>
//         </div>

//         {dayHours && !dayHours.isClosed && (
//           <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
//             <span className="text-green font-bold">
//               {formatTimeTo24Hour(dayHours.startTime)}
//             </span>

//             {dayHours.breaks?.map((breakTime, index) => (
//               <div key={index}>
//                 <span className="text-gray-600 mx-1">-</span>
//                 <span className="text-green font-bold">
//                   {formatTimeTo24Hour(breakTime.startTime)}
//                 </span>
//                 <span className="text-gray-600 mx-1">/</span>
//                 <span className="text-green font-bold">
//                   {formatTimeTo24Hour(breakTime.endTime)}
//                 </span>
//               </div>
//             ))}

//             <span className="text-gray-600 mx-1">-</span>
//             <span className="text-green font-bold">
//               {formatTimeTo24Hour(dayHours.endTime)}
//             </span>
//           </div>
//         )}
//       </div>

//       <div className="flex items-center justify-between mt-3 md:mt-0 md:gap-4">
//         <div className="flex items-center gap-2">
//           <div
//             className={`px-2 py-1 text-xs md:text-sm rounded-full ${
//               dayHours?.isClosed ? "bg-gray-300" : "bg-green text-white"
//             }`}
//           >
//             {dayHours?.isClosed ? "Fermé" : "Ouvert"}
//           </div>
//           <span className="px-2 py-1 text-xs md:text-sm rounded-full bg-green text-white">
//             {activeSalon}
//           </span>
//         </div>

//         <button
//           onClick={() => setEditingDay(day)}
//           className={`text-green underline text-xs md:text-sm ${isPast ? "opacity-50 pointer-events-none" : ""}`}
//         >
//           Modifier
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DaySchedule;
