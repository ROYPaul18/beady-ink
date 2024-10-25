"use client";

import { useState } from "react";

interface QuestionnaireSanteProps {
  onSubmit: (responses: { [key: string]: "OUI" | "NON" }) => void;
}

export default function QuestionnaireSante({ onSubmit }: QuestionnaireSanteProps) {
  const questions = [
    "Êtes-vous allergique au latex ?",
    "Avez-vous une allergie grave, de l’asthme ?",
    "Avez-vous déjà eu des crises de tétanie ou de spasmophilie ?",
    "Avez-vous une maladie du sang, une tendance anormale aux saignements ?",
    "Avez-vous été traité pour du psoriasis ou du soriatane il y a moins de 2 ans ?",
    "Avez-vous ou avez-vous été traité par Roaccutane ?",
    "Avez-vous eu un accident vasculaire cérébral, des crises d'épilepsie, des convulsions ?",
    "Avez-vous eu une maladie cardiaque ou vasculaire (maladie valvulaire, trouble du rythme, etc.) ?",
    "Avez-vous reçu un traitement par hormone de croissance (extraits hypophysaires) avant 1989 ?",
    "Avez-vous eu une greffe de tissus ?",
    "Avez-vous un membre de votre famille atteint de la maladie de Creutzfeldt-Jakob ?",
    "Avez-vous un diagnostic de cancer ?",
    "Avez-vous reçu une transfusion sanguine ?",
    "Vous ou votre partenaire, êtes-vous porteur du VIH, de l’hépatite B, de l’hépatite C, ou du HTLV ?",
    "Avez-vous pris des médicaments très récemment ?"
  ];

  const [responses, setResponses] = useState<{ [key: string]: "OUI" | "NON" }>({});

  const handleChange = (question: string, response: "OUI" | "NON") => {
    setResponses((prev) => ({ ...prev, [question]: response }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responses);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-opacity-80 bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">AVEZ VOUS :</h1>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            <th className="p-2 border border-black">Question</th>
            <th className="p-2 border border-black text-center">OUI</th>
            <th className="p-2 border border-black text-center">NON</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => (
            <tr key={index} className="odd:bg-gray-100">
              <td className="p-2 border border-black">{question}</td>
              <td className="p-2 border border-black text-center">
                <input
                  type="radio"
                  name={question}
                  value="OUI"
                  checked={responses[question] === "OUI"}
                  onChange={() => handleChange(question, "OUI")}
                />
              </td>
              <td className="p-2 border border-black text-center">
                <input
                  type="radio"
                  name={question}
                  value="NON"
                  checked={responses[question] === "NON"}
                  onChange={() => handleChange(question, "NON")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="submit"
        className="bg-dark-red text-white px-4 py-2 mt-6 rounded-md w-full"
      >
        SOUMETTRE LES QUESTIONNAIRES
      </button>
    </form>
  );
}
