// app/ui/reservation/ReservationActions.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useReservation } from '@/app/context/ReservationContext';

export default function ReservationActions() {
  const router = useRouter();
  const { prestationsComplementaires } = useReservation();

  const handleContinue = () => {
    if (prestationsComplementaires.length > 0) {
      router.push('/reservation/onglerie/calendar');
    } else {
      alert('Veuillez sélectionner au moins une prestation.');
    }
  };

  const handleBack = () => {
    router.back(); // Revenir à la page précédente
  };

  return (
    <div className="flex justify-between mt-4 space-x-4">
      <button
        onClick={handleBack}
        className="bg-transparent border border-green text-green hover:bg-green hover:text-white px-4 py-2 rounded-md"
      >
        <span className="mr-2">&larr;</span> Retour
      </button>
      <button
        onClick={handleContinue}
        className="bg-green text-white px-4 py-2 rounded-md"
      >
        Continuer <span className="ml-2">&rarr;</span>
      </button>
    </div>
  );
}
