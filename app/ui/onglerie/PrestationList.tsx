"use client";

import { useRouter } from "next/navigation";
import { Prestation } from "@/lib/types";
import Image from "next/image";

interface PrestationListProps {
  prestations: Prestation[];
}

const PrestationList: React.FC<PrestationListProps> = ({ prestations }) => {
  const router = useRouter();
  const isAuthenticated = false;

  const handleReservationClick = (id: number) => {
    if (isAuthenticated) {
      router.push(`/reservation/${id}`);
    } else {
      router.push("/sign-up");
    }
  };

  if (!prestations.length) {
    return (
      <div className="text-center text-gray-500">Aucune prestation trouvée</div>
    );
  }

  return (
    <div className="">
      {prestations.map((prestation) => (
        <div
          key={prestation.id}
          className="flex flex-col md:flex-row bg-white shadow-md h-[520px]"
        >
          {/* Contenu à gauche */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-4xl font-bold text-green mb-6">
                {prestation.name}
              </h3>
              <p className="text-gray-700 mb-6 text-lg">
                {prestation.description}
              </p>
              <h4 className="text-green text-2xl font-semibold mb-4">
                Les prestations
              </h4>
              <ul className="list-disc list-inside text-gray-700 text-lg">
                <li>Pose complète – {prestation.duration} minutes</li>
              </ul>
            </div>

            <button
              onClick={() => handleReservationClick(prestation.id)}
              className="mt-8 border-2 border-green text-green px-6 py-3 rounded-md hover:bg-green hover:text-white transition duration-200 text-lg font-medium"
            >
              RÉSERVER CETTE PRESTATION
            </button>
          </div>

          {/* Image à droite */}
          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-full">
            {prestation.images[0] && (
              <Image
                src={prestation.images[0].url}
                alt={`Image de ${prestation.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrestationList;
