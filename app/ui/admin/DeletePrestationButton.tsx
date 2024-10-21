"use client";

import { useState } from "react";
import ConfirmationModal from "@/app/ui/admin/ConfirmationModal";

interface DeletePrestationButtonProps {
  id: number;
  onDelete: (id: number) => void;
}

const DeletePrestationButton: React.FC<DeletePrestationButtonProps> = ({ id, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prestation?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        onDelete(id); // Met à jour la liste des prestations
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`bg-red text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-500 transition duration-200 ease-in-out ${loading ? "opacity-50" : ""}`}
        disabled={loading}
      >
        {loading ? 'Suppression...' : 'Supprimer'}
      </button>

      <ConfirmationModal 
        isOpen={isModalOpen}
        message="Êtes-vous sûr de vouloir supprimer cette prestation ?"
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default DeletePrestationButton;
