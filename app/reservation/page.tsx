import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation"; // Utilisation de la fonction redirect pour gérer la redirection

export default async function ReservationPage() {
  // Vérifier la session de l'utilisateur
  const session = await getServerSession(authOptions);

  // Rediriger si l'utilisateur n'est pas connecté
  if (!session || !session.user) {
    redirect("/sign-up");
  }

  return (
    <div className="bg-[url('/img/bg-marbre.png')] min-h-screen bg-cover px-4 py-10">
      <h1 className="text-center text-green text-4xl md:text-5xl lg:text-6xl font-bold mb-10">
        Choix de la prestation
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
        <Link
          href="/reservation/flashtattoo"
          className="group relative gradient-gold-border overflow-hidden"
          prefetch={false}
        >
          <div className="relative h-96 w-full">
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-60">
              <h2 className="text-white text-4xl font-bold">Flash Tattoo</h2>
            </div>
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/img/bg-fleur.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
        </Link>

        <Link
          href="/reservation/onglerie"
          className="group relative gradient-gold-border overflow-hidden"
          prefetch={false}
        >
          <div className="relative h-96 w-full">
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-60">
              <h2 className="text-white text-4xl font-bold">Onglerie</h2>
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

        <Link
          href="/reservation/tatouage"
          className="group relative gradient-gold-border overflow-hidden"
          prefetch={false}
        >
          <div className="relative h-96 w-full">
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-60">
              <h2 className="text-white text-4xl font-bold">Tatouage</h2>
            </div>
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "url('/img/bg-fleur.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
        </Link>
      </div>
    </div>
  );
}
