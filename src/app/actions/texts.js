'use server';

import { revalidatePath } from 'next/cache';
import {
  getSiteContentDocument,
  saveSiteContentDocument,
} from '@/lib/site-content';

const TEXTS_COLLECTION_NAME = 'site_texts';

function normalizeTextItem(item) {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const titulo = String(item.titulo || item.title || '').trim();
    const descricao = String(item.descricao || item.description || item.texto || item.text || '').trim();

    if (!titulo && !descricao) return null;

    return {
      titulo,
      descricao,
    };
  }

  const descricao = String(item || '').trim();
  if (!descricao) return null;

  return {
    titulo: '',
    descricao,
  };
}

function normalizeTextsPayload(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload.map(normalizeTextItem).filter(Boolean),
    };
  }

  if (payload && typeof payload === 'object') {
    if ('items' in payload && Array.isArray(payload.items)) {
      return {
        items: payload.items.map(normalizeTextItem).filter(Boolean),
      };
    }

    if ('frases' in payload) {
      const titulo = String(payload.titulo || '').trim();
      const frases = Array.isArray(payload.frases) ? payload.frases : [];

      return {
        items: frases
          .map((frase) => normalizeTextItem({ titulo, descricao: frase }))
          .filter(Boolean),
      };
    }

    return {
      items: Object.keys(payload)
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))
        .map((key) => normalizeTextItem(payload[key]))
        .filter(Boolean),
    };
  }

  return { items: [] };
}

// Busca os textos salvos
export async function getTextsData() {
  try {
    const data = await getSiteContentDocument(TEXTS_COLLECTION_NAME, { items: [] });
    return normalizeTextsPayload(data);
  } catch (error) {
    console.error("Erro ao buscar textos:", error);
    return { items: [] };
  }
}

// Salva o novo conjunto de frases
export async function saveTexts(phrasesData) {
  try {
    const normalizedTexts = normalizeTextsPayload(phrasesData);

    await saveSiteContentDocument(TEXTS_COLLECTION_NAME, normalizedTexts);

    revalidatePath('/'); // Atualiza o cache da home/site
    return { success: true, data: normalizedTexts };
  } catch (error) {
    console.error("Erro ao salvar textos:", error.message);
    return { success: false, error: error.message };
  }
}
