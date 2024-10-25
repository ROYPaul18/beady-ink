// app/reservation/onglerie/layout.tsx
'use client';

import { ReactNode } from 'react';
import { ReservationProvider } from '@/app/context/ReservationContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ReservationProvider>
      {children}
    </ReservationProvider>
  );
}
