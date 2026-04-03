'use server';
import { put } from '@vercel/blob';

export async function uploadImage(formData) {
  const imageFile = formData.get('image')

  if (!imageFile) {
    throw new Error('Nenhuma imagem enviada');
  }

  const blob = await put(imageFile.name, imageFile, {
    access: 'public',
  });

  return blob.url;
}