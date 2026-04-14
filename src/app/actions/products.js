'use server';

import { put, list, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { normalizeProduct } from '@/utils/product';

const PRODUCTS_JSON_PATH = 'config/products.json';

// Busca a lista de produtos
export async function getProductsData() {
  try {
    const { blobs } = await list({ prefix: PRODUCTS_JSON_PATH });
    if (blobs.length === 0) return [];

    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
}

// Salva a lista completa de produtos
export async function saveProductsList(productsArray) {
  try {
    await put(PRODUCTS_JSON_PATH, JSON.stringify(productsArray), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    revalidatePath('/'); 
    return { success: true, data: productsArray };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Action para upload de imagem do produto (com limpeza da antiga)
export async function uploadProductImage(formData) {
  try {
    const file = formData.get('file');
    const oldUrl = formData.get('oldUrl');

    if (!file) throw new Error("Arquivo não encontrado");

    // 1. Deleta a imagem antiga se existir para não encher o storage
    if (oldUrl && oldUrl.includes('vercel-storage.com')) {
      await del(oldUrl);
    }

    // 2. Sobe a nova imagem com sufixo aleatório (evita cache)
    const blob = await put(`products/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return { success: true, url: blob.url };
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