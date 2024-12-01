'use client';

import { useState } from 'react';

interface TattooFormProps {
  onSubmit: (data: FormData) => void;
}

const TattooForm: React.FC<TattooFormProps> = ({ onSubmit }) => {
  const [availability, setAvailability] = useState('');
  const [size, setSize] = useState('');
  const [placement, setPlacement] = useState('');
  const [referenceImages, setReferenceImages] = useState<File[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setReferenceImages(files);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('availability', availability);
    formData.append('size', size);
    formData.append('placement', placement);
    referenceImages.forEach(file => {
      formData.append('referenceImages', file);
    });
    onSubmit(formData);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-3xl font-bold text-center text-red mb-8">
            Planifiez votre séance
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-red">
                Disponibilités
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red transition-colors"
                placeholder="Ex: Lundi après-midi, Mardi matin..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-red">
                  Taille souhaitée
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red transition-colors"
                  placeholder="Taille en cm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-red">
                  Emplacement
                </label>
                <input
                  type="text"
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red focus:border-red transition-colors"
                  placeholder="Ex: Bras, Jambe..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-red">
                Images de référence
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-red transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-red hover:text-red focus-within:outline-none"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 10MB
                  </p>
                </div>
              </div>
              {referenceImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Fichiers sélectionnés: {referenceImages.map(file => file.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red text-white opacity-90  py-3 px-4 rounded-lg hover:bg-red hover:opacity-100 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Continuer vers le questionnaire santé
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TattooForm;