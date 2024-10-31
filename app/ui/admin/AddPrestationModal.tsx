'use client';

import React, { useState } from "react";
import { Button } from "@/app/ui/button";
import { PrestationFormData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../form";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { Dialog } from "@headlessui/react";
import { ServiceType } from "@prisma/client";
import Image from "next/image";

interface AddPrestationModalProps {
  serviceType: ServiceType;
}

const AddPrestationModal: React.FC<AddPrestationModalProps> = ({
  serviceType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const form = useForm<PrestationFormData>({
    defaultValues: {
      name: "",
      duration: "",
      description: "",
      price: "",
      serviceType: serviceType,
    },
  });

  const validateImages = (files: File[]) => {
    const maxFileSizeMB = 5;
    return files.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size / 1024 / 1024 < maxFileSizeMB
    );
  };

  const handleSubmit = async (data: PrestationFormData) => {
    data.serviceType = serviceType;
    const formData = new FormData();
    formData.append("serviceType", serviceType);

    if (
      serviceType === ServiceType.ONGLERIE ||
      serviceType === ServiceType.FLASH_TATTOO
    ) {
      formData.append("price", data.price.toString());
      formData.append("name", data.name); // Ajouter le nom dans le cas de FLASH_TATTOO aussi
    }

    if (serviceType === ServiceType.ONGLERIE) {
      formData.append("duration", data.duration.toString());
      formData.append("description", data.description);
    }

    const validFiles = validateImages(imageFiles);
    validFiles.forEach((file) => {
      formData.append("image", file);
    });

    const response = await fetch("/api/prestation", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Prestation ajoutée avec succès !");
      setIsOpen(false);
      router.refresh();
      form.reset();
    } else {
      alert("Erreur lors de la création de la prestation.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateImages(files);

    // Mise à jour cumulative des images et des aperçus
    setImageFiles((prevFiles) => [...prevFiles, ...validFiles]);
    setImagePreviews((prevPreviews) => [
      ...prevPreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêche l'ouverture de l'input de fichier
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const renderFormFields = () => {
    switch (serviceType) {
      case ServiceType.ONGLERIE:
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case ServiceType.FLASH_TATTOO:
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case ServiceType.TATOUAGE:
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        className="bg-green text-white mb-2"
        onClick={() => setIsOpen(true)}
      >
        Ajouter une prestation - {serviceType}
      </Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <div
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  className="border-dashed border-2 p-4 rounded-md flex flex-col items-center cursor-pointer"
                >
                  <p className="text-gray-500 mb-2">
                    Cliquez ou glissez les images ici
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex space-x-2 mt-2">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={src}
                          alt=""
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                        <button
                          type="button"
                          onClick={(event) => removeImage(index, event)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {renderFormFields()}
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-red text-white"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-green text-white">
                    Ajouter
                  </Button>
                </div>
              </form>
            </FormProvider>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default AddPrestationModal;
