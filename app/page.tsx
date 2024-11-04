import AvisList from "./ui/home/avisList";
import Gallery from "./ui/home/galerie";
import Hero from "./ui/home/Hero-banner";
import Salons from "./ui/home/salons";
import ReviewList from "./ui/home/ReviewList";
import Image from "next/image";
import './globals.css';

export default function Home() {
  return (
    <div className="relative px-8 py-2 md:px-26 lg:px-60">
      {/* Image de fond en utilisant le composant Image */}
      <Image
        src="/img/bg-marbre.png"
        alt="Background image"
        fill
        style={{ objectFit: "cover", zIndex: -1 }} // Fill pour occuper tout l'espace, objet fit pour le style
        priority // Priorité pour charger en premier
      />
      
      {/* Contenu de la page */}
      <Hero />
      <Salons />
      <Gallery />
      <AvisList />
      <ReviewList />
    </div>
  );
}
