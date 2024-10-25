// app/context/ReservationContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Prestation } from '@/lib/types';

interface ReservationContextProps {
  prestationsComplementaires: Prestation[];
  setPrestationsComplementaires: (prestations: Prestation[]) => void;
}

const ReservationContext = createContext<ReservationContextProps | undefined>(undefined);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prestationsComplementaires, setPrestationsComplementaires] = useState<Prestation[]>([]);

  return (
    <ReservationContext.Provider
      value={{
        prestationsComplementaires,
        setPrestationsComplementaires,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
