import React from "react";

interface ReviewProps {
  rating: number;
  comment: string;
  user: {
    nom: string;
  };
  prestationName: string;
}

const Review: React.FC<ReviewProps> = ({ rating, comment, user, prestationName }) => {
  return (
    <div className="text-center p-4 border border-gray-300 rounded-md">
      <div className="flex justify-center mb-2">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={`text-2xl ${index < rating ? 'text-green-800' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
      </div>
      <p className="italic mb-2">“{comment}”</p>
      <p className="font-semibold">{user.nom}</p>
      <p className="text-gray-600">{prestationName}</p>
    </div>
  );
};

export default Review;
