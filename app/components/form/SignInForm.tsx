'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../../ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  email: z.string().min(1, 'Email est requis').email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe est requis')
    .min(8, 'Le mot de passe doit comporter plus de 8 caractères'),
});

const SignInForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (signInData?.error) {
      console.log(signInData.error);
    } else {
      router.push('/admin');
    }
  };

  return (
    <Form {...form}>
      <div className="bg-white max-w-[100vw] overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Formulaire de connexion */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg p-4 md:p-6 min-h-full md:min-h-[500px] h-full">
            <h2 className="text-2xl md:text-6xl text-center font-bold mb-4 md:mb-6 text-green">
              Connectez-vous à votre compte
            </h2>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 md:space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center bg-lightblue bg-opacity-50 border-none py-2 md:py-3 px-3 md:px-4 rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 text-green mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                          />
                        </svg>
                        <Input
                          placeholder="Email"
                          {...field}
                          className="bg-transparent text-lg md:text-xl text-green border-none focus:outline-none flex-grow"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center bg-lightblue bg-opacity-50 border-none py-2 md:py-3 px-3 md:px-4 rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 text-green mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                          />
                        </svg>
                        <Input
                          type="password"
                          placeholder="Mot de passe"
                          {...field}
                          className="bg-transparent text-lg md:text-xl text-green border-none focus:outline-none flex-grow"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />
              <Button
                className="w-full mt-4 md:mt-6 bg-green text-white font-bold py-4 md:py-6 text-base md:text-lg"
                type="submit"
              >
                Valider
              </Button>
            </form>
          </div>

          {/* Section d'inscription */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-[url('/img/fond-feuille.jpg')] bg-center bg-cover p-4 md:p-6 min-h-full md:min-h-[500px] h-full">
            <h2 className="text-4xl md:text-5xl  font-bold mb-3 md:mb-6 text-white">
              Re bonjour !
            </h2>
            <p className="text-lg md:text-xl text-white text-center mb-4 md:mb-6">
              Vous n'avez pas de compte ? Créez-en un !
            </p>
            <Link
              href="/sign-up"
              className="px-4 md:px-6 py-2 md:py-3 bg-white text-green rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 text-base md:text-lg"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default SignInForm;
