// app/ui/reservation/ClientOnglerieReservation.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useReservation } from '@/app/context/ReservationContext';
import OnglerieRecap from '@/app/ui/reservation/OnglerieRecap';
import ReservationPrestationList from '@/app/ui/reservation/ReservationPrestationList';
import ReservationActions from '@/app/ui/reservation/ReservationAction';
import { PrestationWithImages } from '@/lib/types';

interface ClientOnglerieReservationProps {
  prestations: PrestationWithImages[];
  isAuthenticated: boolean;
}

const ClientOnglerieReservation: React.FC<ClientOnglerieReservationProps> = ({
  prestations,
  isAuthenticated,
}) => {
  const {
    prestationsComplementaires,
    setPrestationsComplementaires,
  } = useReservation();

  const handleRemovePrestation = (id: number) => {
    const updatedPrestations = prestationsComplementaires.filter(
      (p) => p.id !== id
    );
    setPrestationsComplementaires(updatedPrestations);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="lg:col-span-2">
        <ReservationPrestationList
          prestations={prestations}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <div className="bg-white p-6 shadow-lg rounded-md">
        <h2 className="text-green text-xl font-bold mb-4">Mes prestations</h2>
        <OnglerieRecap 
          prestations={prestationsComplementaires} 
          onRemovePrestation={handleRemovePrestation} 
        />
        <div className="flex justify-between mt-4">
          <ReservationActions />
        </div>
      </div>
    </div>
  );
};

export default ClientOnglerieReservation;
