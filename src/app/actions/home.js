'use server';

import { getBannerData } from '@/app/actions/banner';
import { getTextsData } from '@/app/actions/texts';
import { getProductsData } from '@/app/actions/products';
import { normalizeProducts } from '@/utils/product';

function normalizeTexts(textsData) {
  if (Array.isArray(textsData)) {
    return textsData.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (!textsData || typeof textsData !== 'object') return [];

  return Object.keys(textsData)
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))
    .map((key) => String(textsData[key] || '').trim())
    .filter(Boolean);
}

function getFeaturedComments(products) {
  if (!Array.isArray(products)) return [];

  return products.flatMap((product) =>
    (product.comments || []).filter(
      (comment) => comment.showOnHome && (comment.name || comment.phrase || comment.image),
    ),
  );
}

function sortProductsForGallery(products) {
  if (!Array.isArray(products)) return [];

  return [...products].sort((a, b) => {
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;

    return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR', {
      sensitivity: 'base',
    });
  });
}

export async function getHomeData() {
  try {
    const [banner, textsRaw, productsRaw] = await Promise.all([
      getBannerData(),
      getTextsData(),
      getProductsData(),
    ]);

    const normalizedProducts = normalizeProducts(productsRaw);
    const products = sortProductsForGallery(normalizedProducts);
    const comments = getFeaturedComments(normalizedProducts);

    return {
      banner: banner || null,
      texts: normalizeTexts(textsRaw),
      products,
      launches: normalizedProducts.slice(-3).reverse(),
      comments,
    };
  } catch (error) {
    return {
      banner: null,
      texts: [],
      products: [],
      launches: [],
      comments: [],
    };
  }
}
