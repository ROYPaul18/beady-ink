// AddPrestationModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import { PrestationFormData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../form';
import { Input } from '../input';
import { Textarea } from '../textarea';
import { Dialog } from '@headlessui/react';
import { ServiceType } from '@prisma/client';
import Image from 'next/image';

interface AddPrestationModalProps {
  serviceType: ServiceType;
}

const AddPrestationModal: React.FC<AddPrestationModalProps> = ({ serviceType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const form = useForm<PrestationFormData>({
    defaultValues: {
      name: '',
      duration: '',
      description: '',
      price: '',
      serviceType: serviceType,
    },
  });

  const validateImages = (files: File[]) => {
    const maxFileSizeMB = 5;
    return files.filter(
      (file) => file.type.startsWith('image/') && file.size / 1024 / 1024 < maxFileSizeMB
    );
  };

  const handleSubmit = async (data: PrestationFormData) => {
    data.serviceType = serviceType;
    const formData = new FormData();
    formData.append('serviceType', serviceType);

    if (serviceType === ServiceType.ONGLERIE || serviceType === ServiceType.FLASH_TATTOO) {
      formData.append('price', data.price.toString());
    }

    if (serviceType === ServiceType.ONGLERIE) {
      formData.append('name', data.name);
      formData.append('duration', data.duration.toString());
      formData.append('description', data.description);
    }

    const validFiles = validateImages(imageFiles);
    validFiles.forEach((file) => {
      formData.append('image', file);
    });

    const response = await fetch('/api/prestation', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      alert('Prestation ajoutée avec succès !');
      setIsOpen(false);
      router.refresh();
      form.reset();
    } else {
      alert('Erreur lors de la création de la prestation.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = validateImages(files);
    setImageFiles(validFiles);
    setImagePreviews(validFiles.map((file) => URL.createObjectURL(file)));
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
                    <Input type="number" step="0.01" min="0" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case ServiceType.FLASH_TATTOO:
        return (
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case ServiceType.TATOUAGE:
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Ajouter une prestation - {serviceType}
      </Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="flex space-x-2">
                  {imagePreviews.map((src, index) => (
                    <Image key={index} src={src} alt="" width={100} height={100} className="rounded-md" />
                  ))}
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                </div>
                {renderFormFields()}
                <Button type="submit">Ajouter</Button>
              </form>
            </FormProvider>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default AddPrestationModal;
