"use client";
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

const FormSchema = z
  .object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have more than 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: values.username,
        email: values.email,
        password: values.password,
      }),
    });
    if (response.ok) {
      router.push("/sign-in");
    } else {
      console.error("Enregistrement échoué");
    }
  };

  return (
    <Form {...form}>
      <div className="rounded-lg bg-white max-w-[100vw] overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Sign Up Form */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg p-4 md:p-6">
            <h2 className="text-2xl md:text-6xl text-center font-bold mb-4 md:mb-6 text-green">
              Créer ton compte client
            </h2>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 md:space-y-4"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Nom"
                        {...field}
                        className="bg-lightblue bg-opacity-50 border-none py-6 md:py-8 px-5 md:px-6 text-lg md:text-xl focus-green"
                      />
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        {...field}
                        className="bg-lightblue bg-opacity-50 border-none py-6 md:py-8 px-5 md:px-6 text-lg md:text-xl text-green focus-none"
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
                        className="bg-lightblue text-green bg-opacity-50 border-none py-6 md:py-8 px-5 md:px-6 text-lg md:text-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-red-200" />
                  </FormItem>
                )}
              />
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
                        className="bg-lightblue bg-opacity-50 border-none py-6 md:py-8 px-5 md:px-6 text-lg md:text-xl"
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

          {/* Sign In Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-[url('/img/fond-feuille.jpg')] bg-center bg-cover rounded-lg p-4 md:p-6 min-h-full md:min-h-[500px] h-full">
            <h2 className="text-4xl md:text-6xl font-bold mb-3 md:mb-6 text-white">
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
