'use client';

import { useRouter } from 'next/navigation';
import TattooForm from '../../ui/reservation/TattooForm';

export default function FlashTattooInformationPage() {
  const router = useRouter();

  const handleFormSubmit = (data: {
    availability: string;
    size: string;
    placement: string;
    referenceImages: File[];
  }) => {
    console.log(data);
    router.push('/reservation/flashtattoo/questionnaire-sante');
  };

  return (
    <div className="bg-[url('/img/bg-fleur.jpg')] min-h-screen bg-cover flex items-center justify-center p-6">
      <TattooForm onSubmit={handleFormSubmit} />
    </div>
  );
}
