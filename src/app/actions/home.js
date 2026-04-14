'use server';

import { getBannerData } from '@/app/actions/banner';
import { getTextsData } from '@/app/actions/texts';
import { getProductsData } from '@/app/actions/products';
import { getCommentsData } from '@/app/actions/comments';
import { normalizeProducts } from '@/utils/product';

function normalizeTexts(textsData) {
  if (!textsData || typeof textsData !== 'object') return [];

  return ['phrase1', 'phrase2', 'phrase3', 'phrase4', 'phrase5', 'phrase6']
    .map((key) => (textsData[key] || '').trim())
    .filter(Boolean);
}

function normalizeComments(commentsData) {
  if (!Array.isArray(commentsData)) return [];

  return commentsData.filter(
    (comment) => comment && (comment.name || comment.phrase || comment.image),
  );
}

export async function getHomeData() {
  try {
    const [banner, textsRaw, productsRaw, commentsRaw] = await Promise.all([
      getBannerData(),
      getTextsData(),
      getProductsData(),
      getCommentsData(),
    ]);

    const products = normalizeProducts(productsRaw);
    const comments = normalizeComments(commentsRaw);

    return {
      banner: banner || null,
      texts: normalizeTexts(textsRaw),
      products,
      launches: products.slice(-3).reverse(),
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
