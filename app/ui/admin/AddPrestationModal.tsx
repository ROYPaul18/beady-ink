"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/ui/button";
import { PrestationFormData } from "@/lib/types";
import { useRouter } from "next/navigation";
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
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { ServiceType } from "@prisma/client";
import Image from "next/image";

const AddPrestationModal: React.FC = () => {
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
      serviceType: ServiceType.ONGLERIE,
    },
  });

  const validateImages = (files: File[]) => {
    const maxFileSizeMB = 5;
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size / 1024 / 1024 < maxFileSizeMB;
      return isValidType && isValidSize;
    });
    return validFiles;
  };

  const handleSubmit = async (data: PrestationFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("duration", data.duration.toString()); // Convertir en string
      formData.append("description", data.description);
      formData.append("price", data.price.toString()); // Convertir en string
      formData.append("serviceType", data.serviceType);

      const validFiles = validateImages(imageFiles);
      if (validFiles.length === 0) {
        alert("Veuillez sélectionner au moins une image valide.");
        return;
      }

      validFiles.forEach((file) => {
        formData.append("image", file); // Assurez-vous que le champ s'appelle "image"
      });

      const response = await fetch("/api/prestation", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (response.ok) {
          alert("Prestation ajoutée avec succès !");
          handleClose();
          router.refresh();
          form.reset(); // Réinitialiser le formulaire après succès
        } else {
          alert(`Erreur: ${result.message}`);
        }
      } else {
        const text = await response.text();
        alert("Erreur lors de la création de la prestation.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de l'ajout de la prestation.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateImages(files);

    if (validFiles.length !== files.length) {
      alert("Certains fichiers ne sont pas valides (format ou taille).");
    }

    setImageFiles(validFiles);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    setImagePreviews([]);
    setImageFiles([]);
  };

  useEffect(() => {
    // Nettoyer les URLs des objets lorsque le composant est démonté ou les images changent
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Ajouter une prestation</Button>

      <Dialog open={isOpen} onClose={handleClose}>
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full relative z-50">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Section de téléchargement d'images */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex space-x-2 flex-wrap justify-center">
                    {imagePreviews.length > 0 ? (
                      imagePreviews.map((preview, index) => (
                        <Image
                          key={index}
                          src={preview}
                          alt={`Image ${index + 1}`}
                          width={100}
                          height={100}
                          className="object-cover rounded-md"
                        />
                      ))
                    ) : (
                      <p className="text-gray-400">Aucune image sélectionnée</p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-gray-500"
                    multiple
                  />
                </div>

                {/* Champs du formulaire */}
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
                      <FormLabel>Durée</FormLabel>
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
                      <FormLabel>Prix</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de Service</FormLabel>
                      <FormControl>
                        <select {...field} className="block w-full p-2 border rounded-md">
                          <option value={ServiceType.ONGLERIE}>Onglerie</option>
                          <option value={ServiceType.TATOUAGE}>Tatouage</option>
                          {/* Ajoutez d'autres options selon vos besoins */}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-2">
                  <Button type="submit">Ajouter la prestation</Button>
                  <Button onClick={handleClose} type="button" variant="outline">
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

export default AddPrestationModal;
