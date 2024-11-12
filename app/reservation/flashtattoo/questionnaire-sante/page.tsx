'use client';
import { useRouter } from 'next/navigation';
import HealthQuestionnaireForm from '../../../ui/reservation/HealthQuestionnaireForm';

export default function HealthQuestionnairePage() {
  const router = useRouter();

  const handleFormSubmit = (data: {
    healthData: {
      [key: string]: string;
    };
  }) => {
    console.log(data);
    router.push('/reservation/tatouage/questionnaire-sante/confirmation');
  };

  return (
    <div className="bg-[url('/img/13.png')] min-h-screen bg-cover flex items-start justify-center p-4">
      <HealthQuestionnaireForm onSubmit={handleFormSubmit} />
    </div>
  );
}