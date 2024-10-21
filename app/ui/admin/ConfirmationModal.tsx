"use client";

import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-md w-1/3">
        <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2" onClick={onCancel}>
            Annuler
          </button>
          <button className="bg-red text-white px-4 py-2 rounded-lg" onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
