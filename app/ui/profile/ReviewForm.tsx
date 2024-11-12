"use client";

import { useState } from "react";

interface ReviewFormProps {
  prestationId: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ prestationId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/review/${prestationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        setSuccessMessage("Avis envoyé avec succès !");
        setRating(0);
        setComment("");
      } else {
        alert("Erreur lors de l'envoi de l'avis.");
      }
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h3 className="text-lg font-bold mb-2">Laisser un avis</h3>
      <div className="flex mb-2">
        {Array.from({ length: 5 }, (_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => setRating(index + 1)}
            className={index < rating ? "text-yellow-500" : "text-gray-400"}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre avis..."
        className="w-full p-2 border rounded mb-2"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green text-white py-2 px-4 rounded"
      >
        {isSubmitting ? "Envoi en cours..." : "Envoyer"}
      </button>
      {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
    </form>
  );
};

export default ReviewForm;
