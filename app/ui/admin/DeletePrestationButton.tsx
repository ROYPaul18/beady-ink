// DeletePrestationButton.tsx
'use client';

import React from 'react';
import { Button } from '@/app/ui/button';

interface DeletePrestationButtonProps {
  id: number;
  onDelete: (id: number) => void;
}

const DeletePrestationButton: React.FC<DeletePrestationButtonProps> = ({ id, onDelete }) => {
  const handleDelete = async () => {
    const response = await fetch(`/api/prestation?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      onDelete(id);
      alert('Prestation supprimée avec succès.');
    } else {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Supprimer
    </Button>
  );
};

export default DeletePrestationButton;
