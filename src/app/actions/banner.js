'use server';

import { revalidatePath } from 'next/cache';
import {
  getSiteContentDocument,
  saveSiteContentDocument,
} from '@/lib/site-content';

const BANNER_COLLECTION_NAME = 'site_banner';

// Busca os dados atuais salvos no Mongo
export async function getBannerData() {
  try {
    return await getSiteContentDocument(BANNER_COLLECTION_NAME, null);
  } catch (error) {
    return null;
  }
}

export async function saveBanner(formData) {
  const title = formData.get('title');
  const subTitle = formData.get('subTitle');
  const imageUrl = formData.get('imageUrl');
  
  const primaryButtonText = formData.get('primaryButtonText') || 'Compre Agora';
  const primaryButtonLink = formData.get('primaryButtonLink') || '#lançamentos';
  const secondaryButtonText = formData.get('secondaryButtonText') || 'Ver Coleções';
  const secondaryButtonLink = formData.get('secondaryButtonLink') || '/home';

  try {
    const updatedData = {
      title: String(title || ''),
      subTitle: String(subTitle || ''),
      imageUrl: String(imageUrl || ''),
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
    };

    await saveSiteContentDocument(BANNER_COLLECTION_NAME, updatedData);

    revalidatePath('/'); 
    return { success: true, data: updatedData };

  } catch (error) {
    console.error("Erro na Action:", error.message);
    return { success: false, error: error.message };
  }
}
