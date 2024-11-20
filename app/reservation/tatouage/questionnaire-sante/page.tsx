'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HealthQuestionnaireForm from '../../../ui/reservation/HealthQuestionnaireForm';

interface HealthData {
  [key: string]: string;
}

interface TattooData {
  availability: string;
  size: string;
  placement: string;
  referenceImages: string[];
}

export default function HealthQuestionnairePage() {
  const router = useRouter();
  const [tattooData, setTattooData] = useState<TattooData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Nouvel état pour gérer les erreurs

  useEffect(() => {
    // Récupérer les données du tatouage depuis localStorage
    const storedTattooData = localStorage.getItem('tattooData');
    if (storedTattooData) {
      const parsedTattooData = JSON.parse(storedTattooData);

      // Filtrer les valeurs null ou undefined de referenceImages
      parsedTattooData.referenceImages = parsedTattooData.referenceImages?.filter((img: string | undefined) => img) || [];

      setTattooData(parsedTattooData);
    } else {
      // Si pas de données, rediriger vers le formulaire initial
      router.push('/reservation/tatouage');
    }
  }, []);

  const handleFormSubmit = (data: { healthData: HealthData }) => {
    if (!tattooData) {
      console.error('Aucune donnée de tatouage disponible');
      return;
    }

    // Stocker les données de santé
    setHealthData(data.healthData);

    // Ouvrir la modale de confirmation
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!tattooData || !healthData) {
      console.error('Données manquantes');
      return;
    }

    const requestData = {
      ...tattooData,
      healthData: healthData,
    };

    fetch('/api/reservation/tatouage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (response.ok) {
          // Supprimer les données du tatouage de localStorage
          localStorage.removeItem('tattooData');
          // Fermer la modale
          setIsModalOpen(false);
          // Rediriger vers la page de confirmation ou d'accueil
          router.push('/');
        } else {
          response.json().then((errorData) => {
            console.error('Erreur lors de la soumission:', errorData.message);
            setErrorMessage(errorData.message || 'Erreur lors de la soumission'); // Afficher le message d'erreur
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi de la demande de tatouage", error);
        setErrorMessage("Erreur lors de l'envoi de la demande de tatouage");
      });
  };

  const handleCancel = () => {
    // Fermer la modale
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
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
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
