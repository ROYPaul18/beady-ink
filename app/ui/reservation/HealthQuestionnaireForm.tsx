// HealthQuestionnaireForm.tsx

import { useState } from 'react';

interface HealthQuestionnaireFormProps {
  onSubmit: (data: {
    healthData: {
      [key: string]: string;
    };
  }) => void;
}

interface Question {
  id: string;
  text: string;
}

export default function HealthQuestionnaireForm({ onSubmit }: HealthQuestionnaireFormProps) {
  const questions: Question[] = [
    { id: 'q1', text: "Êtes-vous allergique au latex ?" },
    { id: 'q2', text: "Avez-vous eu une allergie grave, de l'asthme ?" },
    { id: 'q3', text: "Avez-vous eu des crises de tétanie ou de spasmophilie ?" },
    { id: 'q4', text: "Avez-vous eu une maladie du sang, une tendance anormale aux saignements ?" },
    { id: 'q5', text: "Avez-vous été traité(e) il y a moins de 2 ans, pour un psoriasis, par du Soriatane ?" },
    { id: 'q6', text: "Êtes-vous ou avez-vous été traité(e) par Roaccutane ?" },
    { id: 'q7', text: "Avez-vous eu un accident vasculaire cérébral, des crises d'épilepsie, des convulsions, des épisodes répétés de syncope ?" },
    { id: 'q8', text: "Avez-vous eu une maladie cardio-vasculaire (maladie valvulaire, trouble du rythme, angine de poitrine, artérite, infarctus du myocarde...) ou êtes-vous porteur d'une anomalie cardio-vasculaire congénitale ?" },
    { id: 'q9', text: "Avez-vous reçu un traitement par hormone de croissance (extraits hypophysaires) avant 1989 ?" },
    { id: 'q10', text: "Avez-vous eu une greffe de tissus d'un autre donneur (cornée, tympan, dure mère, os...) ?" },
    { id: 'q11', text: "Avez-vous eu un membre de votre famille atteint de la maladie de Creutzfeldt-Jakob ?" },
    { id: 'q12', text: "Avez-vous eu un diagnostic de cancer ?" },
    { id: 'q13', text: "Avez-vous reçu une transfusion sanguine ?" },
    { id: 'q14', text: "Vous ou votre partenaire, êtes-vous porteur du VIH, de l'hépatite B, de l'hépatite C, ou du HTLV ?" },
    { id: 'q15', text: "Avez-vous pris des médicaments très récemment ?" },
  ];

  // Initialisation de l'état healthData avec les textes des questions comme clés
  const initialHealthData = questions.reduce((acc, question) => {
    acc[question.text] = '';
    return acc;
  }, {} as { [key: string]: string });

  const [healthData, setHealthData] = useState<{ [key: string]: string }>(initialHealthData);

  const handleHealthDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHealthData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation pour s'assurer que toutes les questions ont une réponse
    const allAnswered = Object.values(healthData).every((answer) => answer !== '');
    if (!allAnswered) {
      alert('Veuillez répondre à toutes les questions.');
      return;
    }

    onSubmit({ healthData });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4">
      <h1 className="text-2xl font-serif mb-8 uppercase tracking-wider border-b pb-2">Avez-vous :</h1>
      <form onSubmit={handleSubmit} className="space-y-0">
        {questions.map((question) => (
          <div key={question.id} className="flex border-b border-gray-200">
            <div className="flex-grow py-4">
              <p className="text-gray-800">{question.text}</p>
            </div>
            <div className="flex min-w-[200px]">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name={question.text}
                  value="Oui"
                  checked={healthData[question.text] === 'Oui'}
                  onChange={handleHealthDataChange}
                  className="hidden"
                />
                <div
                  className={`h-full flex items-center justify-center border-l border-gray-200 transition-colors ${
                    healthData[question.text] === 'Oui' ? 'bg-red' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-gray-800 uppercase">Oui</span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name={question.text}
                  value="Non"
                  checked={healthData[question.text] === 'Non'}
                  onChange={handleHealthDataChange}
                  className="hidden"
                />
                <div
                  className={`h-full flex items-center justify-center border-l border-gray-200 transition-colors ${
                    healthData[question.text] === 'Non' ? 'bg-red' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-gray-800 uppercase">Non</span>
                </div>
              </label>
            </div>
          </div>
        ))}

        <div className="flex justify-center p-4">
          <button
            type="submit"
            className="bg-gray-900 text-white uppercase tracking-wider py-4 px-8 text-lg hover:bg-gray-800 transition-colors"
          >
            Soumettre les questionnaires
          </button>
        </div>
      </form>
    </div>
  );
}
