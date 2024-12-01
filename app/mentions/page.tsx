'use client';

const LegalNotice = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('/img/bg-marbre.png')]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
        <div className="px-6 py-8 md:p-10">
          <h1 className="text-3xl font-bold text-green text-center mb-8">
            Mentions légales
          </h1>

          <div className="space-y-8">
            {/* Éditeur du site */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">
                Éditeur du site
              </h2>
              <p className="text-green leading-relaxed">
                Le site <span className="font-semibold">Beaudy Ink</span> est édité
                par <span className="font-semibold">Chloe Larcule</span>,
                auto-entrepreneur, dont le siège social est situé au : 16 Grande
                Rue, 18350 Flavigny, France.
              </p>
              <ul className="text-green space-y-2">
                <li>
                  <span className="font-medium">Numéro de SIRET :</span>{" "}
                  90350838000016
                </li>
                <li>
                  <span className="font-medium">Téléphone :</span> 06 51 89 25 96
                </li>
                <li>
                  <span className="font-medium">Email :</span>{" "}
                  Chloe.Larcule@icloud.com
                </li>
              </ul>
            </section>

            {/* Responsable de publication */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">
                Responsable de publication
              </h2>
              <p className="text-green">Chloe Larcule</p>
            </section>

            {/* Hébergement */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">Hébergement</h2>
              <p className="text-green leading-relaxed">
                Le site est hébergé par{" "}
                <span className="font-semibold">Vercel Inc.</span>
                <br />
                Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
              </p>
            </section>

            {/* Données personnelles */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">
                Données personnelles
              </h2>
              <div className="space-y-4 text-green leading-relaxed">
                <p>
                  Dans le cadre de la prise de rendez-vous sur le site{" "}
                  <span className="font-semibold">Beaudy Ink</span>, nous
                  collectons les informations suivantes : nom, prénom, email et
                  numéro de téléphone. Ces données sont stockées de manière
                  sécurisée sur <span className="font-semibold">SupaBase</span> et
                  sont uniquement utilisées dans le cadre de la gestion des
                  rendez-vous et de la communication avec les clients.
                </p>
                <p>
                  Les utilisateurs du site disposent d'un droit d'accès, de
                  modification et de suppression de leurs données personnelles. La
                  suppression des comptes peut être effectuée directement via le
                  site. Pour toute autre demande relative aux données personnelles,
                  les utilisateurs peuvent contacter Chloe Larcule à l'adresse
                  email suivante : Chloe.Larcule@icloud.com.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">Cookies</h2>
              <p className="text-green leading-relaxed">
                Le site <span className="font-semibold">Beaudy Ink</span> peut être
                amené à utiliser des cookies pour améliorer l'expérience
                utilisateur et réaliser des statistiques de visites. En naviguant
                sur le site, l'utilisateur accepte l'utilisation de ces cookies. Il
                est possible de configurer les préférences relatives aux cookies
                dans les paramètres du navigateur.
              </p>
            </section>

            {/* Droits de propriété intellectuelle */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">
                Droits de propriété intellectuelle
              </h2>
              <p className="text-green leading-relaxed">
                L'ensemble des contenus présents sur le site{" "}
                <span className="font-semibold">Beaudy Ink</span>, incluant, de
                manière non limitative, les textes, images, logos, et graphismes,
                est la propriété exclusive de{" "}
                <span className="font-semibold">Chloe Larcule</span>, sauf mention
                contraire. Toute reproduction, distribution, modification,
                adaptation, retransmission ou publication, même partielle, de ces
                différents éléments est strictement interdite sans l'accord écrit
                de <span className="font-semibold">Chloe Larcule</span>.
              </p>
            </section>

            {/* Limitation de responsabilité */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-green">
                Limitation de responsabilité
              </h2>
              <p className="text-green leading-relaxed">
                Chloe Larcule s'efforce de fournir sur le site{" "}
                <span className="font-semibold">Beaudy Ink</span> des informations
                aussi précises que possible. Cependant, elle ne pourra être tenue
                responsable des omissions, des inexactitudes et des carences dans
                la mise à jour, qu'elles soient de son fait ou du fait des tiers
                partenaires qui lui fournissent ces informations.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;