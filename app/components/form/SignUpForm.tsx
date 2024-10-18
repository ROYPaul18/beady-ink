"use client";

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
  const cleaned = value.replace(/\D/g, ""); // Enlever tout ce qui n'est pas un chiffre
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);

  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
  }

  return cleaned;
};

// Schéma de validation Zod
const FormSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(100),
  prenom: z.string().min(1, "Le prénom est requis").max(100),
  telephone: z
    .string()
    .regex(/^(\d{2} \d{2} \d{2} \d{2} \d{2})$/, "Le numéro de téléphone doit être au format 01 01 01 01 01"),
  email: z.string().email("L'email est invalide"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],  // Indiquer où l'erreur doit apparaître
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

  // Gérer la soumission du formulaire
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
        // Rediriger vers la page de connexion après l'inscription
        router.push("/sign-in");
      } else {
        const errorData = await response.json();
        alert(errorData.message);  // Afficher le message d'erreur
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire :", error);
    }
  };

  // Gérer la saisie dans le champ de téléphone
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedPhoneNumber);
    form.setValue("telephone", formattedPhoneNumber); // Mettre à jour la valeur du champ de téléphone dans le formulaire
  };

  return (
    <Form {...form}>
      <div className="rounded-lg bg-white max-w-[100vw] overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row ">
          {/* Formulaire d'inscription */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg p-4 md:p-6">
            <h2 className="text-2xl md:text-5xl text-center font-bold mb-4 md:mb-6 text-green">
              Créer ton compte client
            </h2>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-4"
            >
              <div className="flex flex-col md:flex-row md:space-x-4">
                {/* Nom */}
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          placeholder="Nom"
                          {...field}
                          className="bg-lightblue bg-opacity-50 border-none py-4 md:py-6 px-5 md:px-6 text-lg md:text-xl text-green focus-green"
                        />
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
                        <Input
                          placeholder="Prénom"
                          {...field}
                          className="bg-lightblue bg-opacity-50 border-none py-4 md:py-6 px-5 md:px-6 text-lg md:text-xl text-green focus-green"
                        />
                      </FormControl>
                      <FormMessage className="text-red" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Téléphone */}
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Téléphone"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        className="bg-lightblue bg-opacity-50 border-none py-4 md:py-6 px-5 md:px-6 text-lg md:text-xl text-green focus-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        {...field}
                        className="bg-lightblue bg-opacity-50 border-none py-4 md:py-6 px-5 md:px-6 text-lg md:text-xl text-green focus-none"
                      />
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
                      <Input
                        type="password"
                        placeholder="Mot de passe"
                        {...field}
                        className="bg-lightblue text-green bg-opacity-50 border-none py-4 md:py-6 px-5 md:px-6 text-lg md:text-xl"
                      />
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
                      <Input
                        placeholder="Confirmez votre mot de passe"
                        type="password"
                        {...field}
                        className="bg-lightblue text-green bg-opacity-50 border-none py-4 md:py-6 px-5 md:px-6 text-lg md:text-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />

              <Button
                className="w-full mt-4 md:mt-6 bg-green text-white font-bold py-3 md:py-5 text-base md:text-lg"
                type="submit"
              >
                Valider
              </Button>
            </form>
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
      </div>
    </Form>
  );
};

export default SignUpForm;
