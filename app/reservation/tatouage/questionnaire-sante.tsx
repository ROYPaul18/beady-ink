'use client';

import QuestionnaireSante from '../../ui/reservation/QuestionnaireSante';

export default function FlashTattooHealthQuestionnaire() {
  const handleSubmit = (answers: Record<string, string>) => {
    console.log(answers);
    // Traitez les réponses ici ou envoyez-les à une API
  };

  return (
    <div className="bg-[url('/img/bg-fleur.jpg')] min-h-screen bg-cover flex items-center justify-center p-6">
      <QuestionnaireSante onSubmit={handleSubmit} />
    </div>
  );
}
