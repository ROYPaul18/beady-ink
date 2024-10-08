import Image from "next/image";

export default function Flavi() {
  return (
    <div className="container mx-auto mb-8">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image desktop (maintenant à gauche) */}
          <div className="hidden lg:flex justify-start lg:items-center">
            <Image
              src="/img/bg-feuille.jpg"
              width={350}
              height={350}
              className="rounded-md object-cover"
              alt="Photo du salon de Flavi"
            />
          </div>

          {/* Contenu texte */}
          <div className="flex flex-col h-full justify-between">
            {/* Titre (laissé tel quel) */}
            <h1 className="text-3xl md:text-4xl font-bold text-green mb-4 flex justify-end items-end">
              Flavigny
            </h1>
            
            {/* Image mobile */}
            <div className="lg:hidden mb-6 flex  justify-start items-center">
              <Image
                src="/img/bg-feuille.jpg"
                width={350}
                height={350}
                className="rounded-md object-cover"
                alt="Photo du salon de Flavi"
              />
            </div>

            {/* Contenu texte (aligné à droite) */}
            <div className="space-y-2 lg:space-y-4 text-right">
              <p className="text-base font-bold md:text-xl text-green">
                Salon d&apos;ink 7 rue de la mairie, 18340 Soye en Septaine
              </p>
              <p className="text-base md:text-xl text-green">
                Salon de thé et de tatouage. Rendez-vous possible 1 semaine par mois et 
                les mardis et samedis de 10h00 à 17h00.
              </p>
              <p className="text-base font-light md:text-xl text-green">
                Prestations disponibles, projet tatouage et pose d&apos;ongle.
              </p>
              <p className="text-base font-light md:text-xl text-green">
                Environnement apaisant pour venir passer un bon moment proche de Bourges.
              </p>
            </div>
          
            {/* Boutons (alignement du conteneur à droite) */}
            <div className="mt-8 flex flex-col items-end">
              <div className="flex space-x-4 mb-4">
                <button className="bg-beige text-red px-4 py-1 rounded">
                  Tatouage
                </button>
                <button className="bg-green text-beige px-4 py-1 rounded">
                  Onglerie
                </button>
              </div>
              <button className="bg-red text-beige px-8 py-3 rounded w-full lg:w-auto">
                Prenez rendez-vous !
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
