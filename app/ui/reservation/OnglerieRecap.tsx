'use client';

import React from 'react';
import { Prestation } from '@/lib/types';

interface OnglerieRecapProps {
  prestations: Prestation[];
  onRemovePrestation: (id: number) => void; // Nouvelle prop pour la suppression
}

const OnglerieRecap: React.FC<OnglerieRecapProps> = ({ prestations, onRemovePrestation }) => {
  if (prestations.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow">
        <p>Aucune prestation sélectionnée.</p>
      </div>
    );
  }

  const totalPrice = prestations.reduce((acc, prestation) => acc + prestation.price, 0);
  const totalDuration = prestations.reduce((acc, prestation) => acc + prestation.duration, 0);

  return (
    <div className="bg-white p-4 rounded-md shadow">
      <h3 className="text-xl font-bold mb-4">Mes prestations</h3>
      {prestations.map((prestation) => (
        <div key={prestation.id} className="mb-4">
          <h4 className="font-semibold">{prestation.name}</h4>
          <p>Prévoir {prestation.duration} min</p>
          <p>{prestation.price} €</p>
          <button
            onClick={() => onRemovePrestation(prestation.id)}
            className="mt-2 text-red-500 underline"
          >
            Supprimer
          </button>
        </div>
      ))}
      <div className="border-t pt-4">
        <p>Prévoir {totalDuration} min</p>
        <p>Prix total {totalPrice} €</p>
      </div>
    </div>
  );
};

export default OnglerieRecap;
