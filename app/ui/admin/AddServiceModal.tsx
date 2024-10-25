"use client";

import React, { useState } from "react";
import { Button } from "@/app/ui/button";
import { useRouter } from "next/navigation";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../form";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { ServiceType } from "@prisma/client";

interface ServiceFormData {
  type: string;
}

const AddServiceModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ServiceFormData>({
    defaultValues: {
      type: ServiceType.ONGLERIE,
    },
  });

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      const serviceType = data.type as ServiceType;

      const response = await fetch('/api/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: serviceType,
        }),
      });

      const text = await response.text();
      const result = JSON.parse(text);

      if (response.ok) {
        alert('Service ajouté avec succès !');
        setIsOpen(false);
        router.refresh();
      } else {
        alert(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du service:", error);
      alert("Une erreur est survenue lors de l'ajout du service.");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-green text-white px-4 py-2 rounded-md transition duration-200"
      >
        Ajouter un service
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black opacity-30" />

        {/* Contenu de la modale */}
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full relative z-50">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Ajouter un service
            </Dialog.Title>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de service</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          required
                          className="block w-full border border-gray-300 rounded-md p-2"
                        >
                          <option value={ServiceType.ONGLERIE}>Onglerie</option>
                          <option value={ServiceType.TATOUAGE}>Tatouage</option>
                          <option value={ServiceType.FLASH_TATTOO}>Flash Tattoo</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Boutons stylisés */}
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    className="bg-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                  >
                    Ajouter le service
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="bg-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default AddServiceModal;
