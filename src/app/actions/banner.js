'use server';

import { put, del, list } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

const BANNER_JSON_PATH = 'config/banner.json';

// Busca os dados atuais salvos no Blob
export async function getBannerData() {
  try {
    const { blobs } = await list({ prefix: BANNER_JSON_PATH });
    if (blobs.length === 0) return null;

    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function saveBanner(formData) {
  // Pegando TUDO do formData para evitar confusão de argumentos
  const title = formData.get('title');
  const subTitle = formData.get('subTitle');
  const imageFile = formData.get('imageFile');
  const oldImageUrl = formData.get('oldImageUrl'); // Certifique-se de ter um <input name="oldImageUrl" type="hidden" value={data.imageUrl} />

  let finalImageUrl = oldImageUrl || '';
  let imageWasUpdated = false;

  try {
    // 1. Upload da imagem nova
    if (imageFile && imageFile.size > 0) {
      const newBlob = await put(`banners/${imageFile.name}`, imageFile, {
        access: 'public',
        addRandomSuffix: true, 
      });
      finalImageUrl = newBlob.url;
      imageWasUpdated = true;
    }

    // 2. Atualização do JSON
    const updatedData = { title, subTitle, imageUrl: finalImageUrl };

    await put(BANNER_JSON_PATH, JSON.stringify(updatedData), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true, // Crucial para não dar erro de "blob already exists"
    });

    // 3. Limpeza (após sucesso do JSON)
    if (imageWasUpdated && oldImageUrl && oldImageUrl.includes('vercel-storage.com')) {
      // Usamos Promise.resolve().then() ou apenas deixamos correr para não travar o return
      del(oldImageUrl).catch(e => console.error("Erro ao deletar antiga:", e));
    }

    revalidatePath('/'); 
    return { success: true, data: updatedData };

  } catch (error) {
    console.error("Erro na Action:", error.message);
    return { success: false, error: error.message };
  }
}