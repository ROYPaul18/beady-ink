'use client';

import { useRouter } from 'next/navigation';
import TattooForm from '../../ui/reservation/TattooForm';

export default function TattooInformationPage() {
  const router = useRouter();

  const handleFormSubmit = (data: {
    availability: string;
    size: string;
    placement: string;
    referenceImages: File[];
  }) => {
    console.log(data);
    router.push('/reservation/tatouage/questionnaire-sante');
  };

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover flex items-center justify-center p-6">
      <TattooForm onSubmit={handleFormSubmit} />
    </div>
  );
}