'use server';

import { revalidatePath } from 'next/cache';
import {
  saveSiteContentDocument,
  getSiteContentDocuments,
  saveSiteContentDocuments,
} from '@/lib/site-content';
import { normalizeProduct, prepareProductsForStorage } from '@/utils/product';

const PRODUCTS_COLLECTION_NAME = 'site_products';

// Busca a lista de produtos
export async function getProductsData() {
  try {
    const data = await getSiteContentDocuments(PRODUCTS_COLLECTION_NAME, []);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

export async function saveProductsList(productsArray) {
  try {
    const sanitizedProducts = prepareProductsForStorage(productsArray);
    const documents = sanitizedProducts.map((product) => ({
      _id: String(product.id),
      data: product,
    }));

    await saveSiteContentDocuments(PRODUCTS_COLLECTION_NAME, documents);

    revalidatePath('/'); 
    return { success: true, data: sanitizedProducts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveProductItem(productItem) {
  try {
    const sanitizedProduct = prepareProductsForStorage([productItem])[0];

    if (!sanitizedProduct?.id) {
      return { success: false, error: "Produto inválido." };
    }

    await saveSiteContentDocument(PRODUCTS_COLLECTION_NAME, sanitizedProduct, String(sanitizedProduct.id));

    revalidatePath('/');
    return { success: true, data: sanitizedProduct };
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
