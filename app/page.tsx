import AvisList from "./ui/home/avisList";
import Gallery from "./ui/home/galerie";
import Hero from "./ui/home/Hero-banner"
import Salons from "./ui/home/salons";
import ReviewList from "./ui/home/ReviewList";
export default function Home() {
  return (
    <div className="bg-[url('/img/bg-marbre.png')]  px-8 py-2 md:px-26 lg:px-80">
        <Hero />
        <Salons />
        <Gallery />
        <AvisList />
        <ReviewList  />
    </div>
  );
}
