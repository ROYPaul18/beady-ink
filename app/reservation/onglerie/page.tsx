import Link from "next/link";
import { OnglerieCategory } from "@prisma/client";

export default function OnglerieCategoryPage() {
  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-10">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
        Choisissez une catégorie d'onglerie
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Boucle sur les catégories définies dans OnglerieCategory */}
        {Object.values(OnglerieCategory).map((category) => (
          <Link
            key={category}
            href={`/reservation/onglerie/${category}`}
            className="group relative gradient-gold-border overflow-hidden"
            prefetch={false}
          >
            <div className="relative h-96 w-full">
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-60">
                <h2 className="text-white text-4xl font-bold">{category}</h2>
              </div>
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: "url('/img/bg-feuille.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
