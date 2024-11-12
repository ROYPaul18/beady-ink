// app/reservation/tatouage/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import TattooForm from '../../ui/reservation/TattooForm';

export default function TattooInformationPage() {
  const router = useRouter();

  const handleFormSubmit = (data: {
    availability: string;
    size: string;
    placement: string;
    referenceImages: string[];
  }) => {
    // Stocker les données du tatouage dans localStorage
    localStorage.setItem('tattooData', JSON.stringify(data));
    // Naviguer vers le questionnaire de santé
    router.push('/reservation/tatouage/questionnaire-sante');
  };

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover flex items-start justify-center">
      <TattooForm onSubmit={handleFormSubmit} />
    </div>
  );
}
