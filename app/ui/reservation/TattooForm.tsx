'use client';

import { useState } from 'react';

interface TattooFormProps {
  onSubmit: (data: {
    availability: string;
    size: string;
    placement: string;
    referenceImages: File[];
  }) => void;
}

const TattooForm: React.FC<TattooFormProps> = ({ onSubmit }) => {
  const [availability, setAvailability] = useState('');
  const [size, setSize] = useState('');
  const [placement, setPlacement] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setReferenceImages(Array.from(event.target.files));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      availability,
      size,
      placement,
      referenceImages,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-opacity-80 bg-white rounded-lg p-6 shadow-md mt-12"
    >
      <h2 className="text-center text-2xl font-bold mb-4">Entrer vos disponibilités</h2>

      <div className="mb-4">
        <label className="block text-lg font-semibold mb-2">Disponibilités</label>
        <input
          type="text"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none"
          placeholder="Indiquez vos disponibilités"
          required
        />
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-lg font-semibold mb-2">Taille</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            placeholder="Taille en cm"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-lg font-semibold mb-2">Emplacement</label>
          <input
            type="text"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
            placeholder="Emplacement souhaité"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold mb-2">Images de Références</label>
        <input
          type="file"
          multiple
          onChange={handleImageUpload}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none"
        />
        {referenceImages.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {referenceImages.length} image(s) sélectionnée(s)
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-marron text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
      >
        Passer au questionnaire de santé
      </button>
    </form>
  );
};

export default TattooForm;
