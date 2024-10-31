'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Fonction pour formater dynamiquement le numéro de téléphone
const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);

  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }

  return cleaned;
};

// Schéma de validation Zod
const FormSchema = z
  .object({
    nom: z.string().min(1, "Le nom est requis").max(100),
    prenom: z.string().min(1, "Le prénom est requis").max(100),
    telephone: z
      .string()
      .regex(
        /^(\d{2} \d{2} \d{2} \d{2} \d{2})$/,
        "Le numéro de téléphone doit être au format 01 01 01 01 01"
      ),
    email: z.string().email("L'email est invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit comporter au moins 8 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

const SignUpForm = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedPhoneNumber);
    form.setValue("telephone", formattedPhoneNumber);
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          email: values.email,
          password: values.password,
        }),
      });

      if (response.ok) {
        router.push("/sign-in");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-lg bg-white max-w-[100vw] overflow-hidden"
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full lg:w-1/2 bg-white rounded-lg p-4 md:p-6">
            <h2 className="text-2xl md:text-5xl text-center font-bold mb-4 md:mb-6 text-green">
              Créer ton compte client
            </h2>
            <div className="space-y-4 md:space-y-4">
              <div className="flex flex-col gap-4 md:flex-row"> {/* Espacement ajusté pour mobile */}
                {/* Nom */}
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem className="w-full">
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
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                          <Input
                            placeholder="Nom"
                            autoComplete="off"
                            {...field}
                            className="bg-transparent border-none text-lg md:text-xl text-green focus:outline-none flex-grow"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red" />
                    </FormItem>
                  )}
                />

                {/* Prénom */}
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem className="w-full">
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
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                          <Input
                            placeholder="Prénom"
                            autoComplete="off"
                            {...field}
                            className="bg-transparent border-none text-lg md:text-xl text-green focus:outline-none flex-grow"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
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
                          autoComplete="off"
                          {...field}
                          className="bg-transparent border-none text-lg md:text-xl text-green focus:outline-none flex-grow"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />

              {/* Mot de passe */}
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
                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0-2.25 2.25Z"
                          />
                        </svg>
                        <Input
                          type="password"
                          placeholder="Mot de passe"
                          autoComplete="off"
                          {...field}
                          className="bg-transparent border-none text-lg md:text-xl text-green focus:outline-none flex-grow"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />

              {/* Confirmation du mot de passe */}
              <FormField
                control={form.control}
                name="confirmPassword"
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
                            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0-2.25 2.25Z"
                          />
                        </svg>
                        <Input
                          type="password"
                          placeholder="Confirmez votre mot de passe"
                          autoComplete="off"
                          {...field}
                          className="bg-transparent border-none text-lg md:text-xl text-green focus:outline-none flex-grow"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telephone"
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
                            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                          />
                        </svg>
                        <Input
                          placeholder="Téléphone"
                          value={phoneNumber}
                          onChange={handlePhoneNumberChange}
                          className="bg-transparent border-none text-lg md:text-xl text-green focus:outline-none flex-grow"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red" />
                  </FormItem>
                )}
              />

              <Button
                className="w-full mt-4 md:mt-6 bg-green text-white font-bold py-3 md:py-5 text-base md:text-lg"
                type="submit"
              >
                Valider
              </Button>
            </div>
          </div>

          {/* Section Connexion */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-[url('/img/fond-feuille.jpg')] bg-center rounded-lg p-4 md:p-6 min-h-full md:min-h-[500px] h-full bg-no-repeat bg-cover">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 md:mb-6 text-white">
              Re bonjour !
            </h2>
            <p className="text-lg md:text-xl text-white text-center mb-4 md:mb-6">
              Connectez-vous à votre compte client
            </p>
            <Link
              href="/sign-in"
              className="px-4 md:px-6 py-2 md:py-3 bg-white text-green rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 text-base md:text-lg"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
