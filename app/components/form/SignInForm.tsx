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
                      <Input
                        placeholder="Email"
                        {...field}
                        className="bg-lightblue text-green bg-opacity-50 border-none py-6 md:py-8 px-5 md:px-6 text-lg md:text-xl focus-green"
                      />
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
                      <Input
                        type="password"
                        placeholder="Mot de passe"
                        {...field}
                        className="bg-lightblue bg-opacity-50 text-green border-none py-6 md:py-8 px-5 md:px-6 text-lg md:text-xl focus-green"
                      />
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
            <h2 className="text-4xl md:text-6xl font-bold mb-3 md:mb-6 text-white">
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
