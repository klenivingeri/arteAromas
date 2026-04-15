'use server';

import { revalidatePath } from 'next/cache';
import {
  getSiteContentDocument,
  saveSiteContentDocument,
} from '@/lib/site-content';
import { normalizeProduct, prepareProductsForStorage } from '@/utils/product';

const PRODUCTS_COLLECTION_NAME = 'site_products';

// Busca a lista de produtos
export async function getProductsData() {
  try {
    const data = await getSiteContentDocument(PRODUCTS_COLLECTION_NAME, []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

// Salva a lista completa de produtos
export async function saveProductsList(productsArray) {
  try {
    const sanitizedProducts = prepareProductsForStorage(productsArray);

    await saveSiteContentDocument(PRODUCTS_COLLECTION_NAME, sanitizedProducts);

    revalidatePath('/'); 
    return { success: true, data: sanitizedProducts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getProductById(productId) {
  try {
    const products = await getProductsData();
    const found = products.find((product) => String(product?.id) === String(productId));
    return normalizeProduct(found);
  } catch (error) {
    console.error('Erro ao buscar produto por id:', error);
    return null;
  }
}
