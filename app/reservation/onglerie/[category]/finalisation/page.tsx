'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import OnglerieRecap from "@/app/ui/reservation/OnglerieRecap";
import { useReservation } from "@/app/context/ReservationContext";
import WeeklyTimeSlotSelector from "@/app/ui/reservation/WeeklyTimeSlotSelector";

export default function FinalisationPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<string>("Soye-en-Septaine");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter();
  const { prestationsComplementaires, setPrestationsComplementaires } = useReservation();

  const durationInMinutes = useMemo(() => {
    return prestationsComplementaires.reduce((acc, p) => acc + p.duration, 0);
  }, [prestationsComplementaires]);

  const handleFinish = async () => {
    if (selectedDate && selectedTime) {
      try {
        const prestationIds = prestationsComplementaires.map((prestation) => prestation.id);

        const response = await fetch("/api/reservation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDate,
            time: durationInMinutes.toString(), // Utiliser la durée totale comme time
            startTime: selectedTime, // Ajouter l'heure de début
            salon: selectedSalon,
            serviceId: 1,
            prestationIds,
          }),
        });

        if (response.ok) {
          setShowConfirmationModal(true);
        } else {
          const errorData = await response.json();
          alert(`Erreur lors de la réservation : ${errorData.message}`);
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
    } else {
      alert("Veuillez sélectionner une date et une heure.");
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
    router.push("/profile");
  };

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-8 flex flex-col items-center">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
        Choix de la date & heure
      </h1>

      <div className="w-full max-w-3xl bg-white p-6 shadow-lg rounded-md flex flex-col justify-between mb-6">
        <h2 className="text-green text-xl font-bold mb-4">Choix de mon salon</h2>
        <select
          value={selectedSalon}
          onChange={(e) => setSelectedSalon(e.target.value)}
          className="w-full p-2 border border-green rounded-md mb-6"
        >
          <option value="Soye-en-Septaine">Soye en septaine</option>
          <option value="Flavigny">Flavigny</option>
        </select>

        <h2 className="text-green text-xl font-bold mb-4">Mes prestations</h2>
        <OnglerieRecap 
          prestations={prestationsComplementaires} 
          onRemovePrestation={(id) => setPrestationsComplementaires((prev) => prev.filter((p) => p.id !== id))} 
        />

        <div className="mt-4 p-4 bg-green/10 rounded">
          <p className="text-center text-green font-semibold">
            Durée totale : {durationInMinutes} minutes
          </p>
        </div>

        <WeeklyTimeSlotSelector
          salon={selectedSalon}
          durationInMinutes={durationInMinutes}
          onSelect={(day, time) => {
            setSelectedDate(day);
            setSelectedTime(time);
          }}
        />

        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.back()}
            className="bg-transparent border border-green text-green hover:bg-green hover:text-white px-4 py-2 rounded-md"
          >
            <span className="mr-2">&larr;</span> Étape précédente
          </button>
          <button
            onClick={handleFinish}
            className="bg-green text-white px-4 py-2 rounded-md"
          >
            Finaliser <span className="ml-2">&rarr;</span>
          </button>
        </div>
      </div>

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
            <h2 className="text-center text-2xl font-bold text-green mb-4">Résumé du Rendez-vous</h2>
            <p className="text-center text-lg font-semibold text-green mb-2">
              {selectedDate} à {selectedTime} (Durée : {durationInMinutes} min)
            </p>
            <p className="text-center text-lg font-semibold text-green mb-4">
              Salon: {selectedSalon}
            </p>
            <h3 className="text-lg font-semibold text-green mb-2">Prestations :</h3>
            <ul className="mb-4">
              {prestationsComplementaires.map((prestation) => (
                <li key={prestation.id} className="text-green mb-1">
                  - {prestation.name} ({prestation.duration} min)
                </li>
              ))}
            </ul>
            <p className="text-center font-semibold text-green text-xl mb-4">
              Total: {prestationsComplementaires.reduce((acc, p) => acc + p.price, 0)}€
            </p>
            <button
              onClick={handleCloseModal}
              className="bg-green text-white px-4 py-2 rounded w-full font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}