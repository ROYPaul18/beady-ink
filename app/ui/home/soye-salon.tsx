import Image from "next/image";
import Link from "next/link";

export default function Soye() {
  return (
    <div className="container mx-auto mb-8">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section texte */}
          <div className="flex flex-col h-full justify-between">
            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-green mb-4">
              Soye en Septaine
            </h1>

            {/* Image mobile */}
            <div className="lg:hidden mb-6 flex justify-center">
              <Image
                src="/image0.jpeg"
                width={350}
                height={350}
                className="rounded-md object-cover"
                alt="Photo du salon de Soye-en-Septaine"
              />
            </div>

            {/* Contenu texte */}
            <div className="space-y-2 lg:space-y-4">
              <p className="text-base font-bold md:text-xl text-green">
                Salon L&apos;ink 7 rue de la mairie, 18340 Soye en Septaine
              </p>
              <p className="text-base md:text-xl text-green">
                Salon de thé et de tatouage. Rendez-vous possible 1 semaine par
                mois et les mardis et samedis de 10h00 à 17h00.
              </p>
              <p className="text-base font-light md:text-xl text-green">
                Prestations disponibles, projet tatouage et pose d&apos;ongle.
              </p>
              <p className="text-base font-light md:text-xl text-green">
                Environnement apaisant pour venir passer un bon moment proche de
                Bourges.
              </p>
            </div>

            {/* Boutons */}
            <div className="mt-8">
              <div className="flex space-x-4 mb-4">
                <Link href="/tatouage" className="bg-beige text-red px-4 py-1 rounded">
                  Tatouage
                </Link>
                <Link href="/onglerie"className="bg-green text-beige px-4 py-1 rounded">
                  Onglerie
                </Link>
              </div>
              <Link href="/reservation" className="bg-red text-beige px-8 py-3 rounded w-full lg:w-auto">
                Prenez rendez-vous !
              </Link >
            </div>
          </div>

          {/* Image desktop */}
          <div className="hidden lg:flex justify-end lg:items-center">
            <Image
              src="/image0.jpeg"
              width={350}
              height={350}
              className="rounded-md object-cover"
              alt="Photo du salon de Soye-en-Septaine"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
