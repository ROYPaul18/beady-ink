import Image from "next/image";

export default function Hero() {
  return (
    <div>
      <div className="flex flex-col mx-auto">
        <h1 className="text-green text-center text-2xl md:text-6xl mb-2">
          Qui suis-je ?
        </h1>
        <div className="flex flex-col items-center md:flex-row md:justify-start">
          <Image
            src="/image1.jpeg"
            alt="Photo de Chloé"
            width={300}
            height={500}
            className="mx-auto md:mr-10 lg:mr-40 rounded-md"
          />
          <div className="flex-col mt-4 md:mt-0">
            <div className="flex-col space-y-4">
              <p className="text-base md:text-lg lg:text-xl text-green mb-2">
                Bienvenue dans mon univers !
              </p>
              <p className="text-base font-light md:text-lg lg:text-xl text-green">
                Je m’appelle Chloé, je suis esthéticienne certifiée depuis 2018,
                prothésiste ongulaire et tatoueuse.
              </p>
              <p className="text-base md:text-lg lg:text-xl text-green">
                Je vous accueille du Lundi au Samedi de 9h00 à 19h00 sur
                rendez-vous.
              </p>
              <p className="text-base md:text-lg lg:text-xl text-green font-medium">
                Je travaille à mon salon privé sur Flavigny ainsi que sur Soye
                en Septaine situé à 10min de Bourges.
              </p>
              <p className="flex text-base md:text-lg lg:text-xl text-green flex-wrap">
                <span>Pour me contacter uniquement par message : </span>
                <span className="whitespace-nowrap text-base md:text-lg lg:text-xl text-green font-bold ml-2">
                 06.51.89.25.96
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current text-green rounded-lg lg:rounded-xl w-8 h-8 md:w-12 md:h-12"
              >
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
              <div className="flex-col justify-center">
                <h2 className="text-green font-black">Beaudy Ink</h2>
                <h2 className="text-green font-black">Beaudy Ink Tattoo</h2>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth={1}
                className="fill-current text-green w-8 h-8 md:w-12 md:h-12"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
