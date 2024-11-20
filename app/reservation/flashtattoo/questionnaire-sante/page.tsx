'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HealthQuestionnaireForm from '../../../ui/reservation/HealthQuestionnaireForm';

interface HealthData {
  [key: string]: string;
}

interface FlashTattooData {
  flashTattooId: number;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function HealthQuestionnairePage() {
  const router = useRouter();
  const [flashTattooData, setFlashTattooData] = useState<FlashTattooData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Vérifier si les données du flash tattoo existent dans localStorage
    const storedTattooData = localStorage.getItem('flashTattooData');
    if (storedTattooData) {
      const parsedData = JSON.parse(storedTattooData);
      if (parsedData.flashTattooId && parsedData.name && parsedData.price) {
        setFlashTattooData(parsedData);
      } else {
        console.error("Données du flash tattoo invalides");
        router.push('/reservation/flashtattoo'); // Rediriger vers la page de réservation si les données sont invalides
      }
    } else {
      console.error("Pas de données de flash tattoo trouvées");
      router.push('/reservation/flashtattoo'); // Si aucune donnée, rediriger vers la page de réservation
    }
  }, [router]);

  const handleFormSubmit = (data: { healthData: HealthData }) => {
    if (!flashTattooData) {
      console.error('Aucune donnée de flash tattoo disponible');
      return;
    }

    // Stocker les données de santé
    setHealthData(data.healthData);

    // Ouvrir la modale de confirmation
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!flashTattooData || !healthData) {
      console.error('Données manquantes');
      return;
    }

    const requestData = {
      ...flashTattooData,
      healthData: healthData,
    };

    try {
      const response = await fetch('/api/reservation/flashTattoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // Supprimer les données du flash tattoo de localStorage
        localStorage.removeItem('flashTattooData');
        setIsModalOpen(false);
        router.push('/');  // Rediriger vers la page de confirmation après la soumission
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la soumission', errorData);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover flex items-start justify-center">
      <HealthQuestionnaireForm onSubmit={handleFormSubmit} />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirmer la demande</h2>
            <p className="mb-4">Elle va vous recontacter par téléphone.</p>
            <div className="flex justify-end">
              <button
                onClick={handleCancel}
                className="mr-4 px-4 py-2 bg-gray-300 text-gray-700 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={!flashTattooData || !healthData} // Désactiver le bouton si les données sont manquantes
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
