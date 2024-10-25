// "use client";
// import 'react-calendar/dist/Calendar.css';
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Calendar from "react-calendar";
// import OnglerieRecap from "@/app/ui/reservation/OnglerieRecap";
// import { Prestation } from "@/lib/types";
// import { useReservation } from '@/app/context/ReservationContext';

// interface ReservationCalendarProps {
//   prestation: Prestation;
// }

// export default function ReservationCalendar({
//   prestation,
// }: ReservationCalendarProps) {
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [selectedSalon, setSelectedSalon] = useState<string>("Soye en septaine");
//   const router = useRouter();
//   const { prestationPrincipale, prestationsComplementaires } = useReservation();

//   const times = [
//     "8h 15",
//     "8h 45",
//     "9h 15",
//     "9h 45",
//     "10h 15",
//     "10h 45",
//     "11h 15",
//     "11h 45",
//     "12h 15",
//   ];

//   const handleDateChange = (value: Date | Date[]) => {
//     if (value instanceof Date) {
//       setSelectedDate(value);
//     }
//   };

//   const handleTimeSelect = (time: string) => {
//     setSelectedTime(time);
//   };

//   const handleFinish = () => {
//     if (selectedDate && selectedTime) {
//       console.log("Réservation enregistrée pour", selectedDate, selectedTime);
//       // Naviguer vers une autre page de confirmation ou traiter la réservation ici
//     } else {
//       alert("Veuillez sélectionner une date et une heure.");
//     }
//   };

//   return (
//     <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-8">
//       <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
//         Choix d'un horaire
//       </h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
//         <div className="md:col-span-2 p-4 bg-white shadow-lg rounded-md flex flex-col md:flex-row">
//           <div className="flex-1 md:pr-4">
//             <Calendar
//               onChange={(value) => handleDateChange(value as Date)}
//               value={selectedDate}
//               minDate={new Date()}
//               className="border border-green rounded-md w-full"
//             />
//           </div>

//           <div className="flex-1 bg-gray-100 p-4 rounded-md shadow-inner md:ml-4 mt-4 md:mt-0">
//             <h2 className="text-green text-xl font-bold mb-4">
//               Créneaux disponibles
//             </h2>
//             <div className="flex flex-col gap-2">
//               {times.map((time) => (
//                 <button
//                   key={time}
//                   onClick={() => handleTimeSelect(time)}
//                   className={`p-2 rounded-md text-center ${
//                     selectedTime === time
//                       ? "bg-green text-white"
//                       : "bg-white border border-green text-green hover:bg-green hover:text-white transition"
//                   }`}
//                 >
//                   {time}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 shadow-lg rounded-md flex flex-col justify-between">
//           <div>
//             <h2 className="text-green text-xl font-bold mb-4">
//               Choix de mon salon
//             </h2>
//             <select
//               value={selectedSalon}
//               onChange={(e) => setSelectedSalon(e.target.value)}
//               className="w-full p-2 border border-green rounded-md mb-6"
//             >
//               <option value="Soye en septaine">Soye en septaine</option>
//             </select>

//             <h2 className="text-green text-xl font-bold mb-4">
//               Mes prestations
//             </h2>
//             <OnglerieRecap
//               prestationPrincipale={prestationPrincipale || prestation}
//               prestationsComplementaires={prestationsComplementaires || []}
//             />
//           </div>

//           <div className="flex justify-between mt-6">
//             <button
//               onClick={() => router.back()}
//               className="bg-transparent border border-green text-green hover:bg-green hover:text-white px-4 py-2 rounded-md"
//             >
//               <span className="mr-2">&larr;</span> Étape précédente
//             </button>
//             <button
//               onClick={handleFinish}
//               className="bg-green text-white px-4 py-2 rounded-md"
//             >
//               Finaliser <span className="ml-2">&rarr;</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
