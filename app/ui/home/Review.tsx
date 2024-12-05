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
    <div className="text-center p-4 md:p-8">
      <div className="flex justify-center mb-4 md:mb-6">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`text-4xl sm:text-6xl md:text-8xl ${
              index < rating
                ? 'text-green'
                : 'text-transparent'
            }`}
            style={{ WebkitTextStroke: index < rating ? '0' : '1px #454C22' }}
          >
            ★
          </span>
        ))}
      </div>
      <p className="text-green italic text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">"{comment}"</p>
      <p className="font-semibold text-green text-base sm:text-lg md:text-xl">{user.nom}</p>
      <p className="text-green text-sm sm:text-base md:text-lg">{prestationName}</p>
    </div>
  );
};

export default Review;