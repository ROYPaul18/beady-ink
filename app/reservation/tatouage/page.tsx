'use client';

import { useRouter } from 'next/navigation';
import TattooForm from '../../ui/reservation/TattooForm';

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function TattooInformationPage() {
  const router = useRouter();

  const handleFormSubmit = async (data: FormData) => {
    // Extraire les données nécessaires du FormData
    const availability = data.get('availability')?.toString() || '';
    const size = data.get('size')?.toString() || '';
    const placement = data.get('placement')?.toString() || '';
    const files = data.getAll('referenceImages') as File[];

    // Convertir les fichiers en base64
    const base64Images = await Promise.all(files.map(convertFileToBase64));

    // Préparer un objet structuré pour la soumission
    const structuredData = {
      availability,
      size,
      placement,
      referenceImages: base64Images,
    };

    // Stocker les données du tatouage dans localStorage
    localStorage.setItem('tattooData', JSON.stringify(structuredData));

    // Naviguer vers le questionnaire de santé
    router.push('/reservation/tatouage/questionnaire-sante');
  };

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover flex items-start justify-center p-8">
      <TattooForm onSubmit={handleFormSubmit} />
    </div>
  );
}
