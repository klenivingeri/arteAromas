'use server';

import { revalidatePath } from 'next/cache';
import {
  getSiteContentDocuments,
  saveSiteContentDocuments,
} from '@/lib/site-content';

const TEXTS_COLLECTION_NAME = 'site_texts';

const createTextId = () =>
  `text-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function normalizeTextItem(item, index = 0) {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const id = String(item.id || item._id || `${createTextId()}-${index}`);
    const titulo = String(item.titulo || item.title || '').trim();
    const descricao = String(item.descricao || item.description || item.texto || item.text || '').trim();

    if (!titulo && !descricao) return null;

    return {
      id,
      titulo,
      descricao,
    };
  }

  const descricao = String(item || '').trim();
  if (!descricao) return null;

  return {
    id: `${createTextId()}-${index}`,
    titulo: '',
    descricao,
  };
}

function normalizeTextsPayload(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload.map((item, index) => normalizeTextItem(item, index)).filter(Boolean),
    };
  }

  if (payload && typeof payload === 'object') {
    if ('items' in payload && Array.isArray(payload.items)) {
      return {
        items: payload.items.map((item, index) => normalizeTextItem(item, index)).filter(Boolean),
      };
    }

    if ('frases' in payload) {
      const titulo = String(payload.titulo || '').trim();
      const frases = Array.isArray(payload.frases) ? payload.frases : [];

      return {
        items: frases
          .map((frase, index) => normalizeTextItem({ titulo, descricao: frase }, index))
          .filter(Boolean),
      };
    }

    return {
      items: Object.keys(payload)
        .sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }))
        .map((key, index) => normalizeTextItem(payload[key], index))
        .filter(Boolean),
    };
  }

  return { items: [] };
}

// Busca os textos salvos
export async function getTextsData() {
  try {
    const data = await getSiteContentDocuments(TEXTS_COLLECTION_NAME, { items: [] });
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
    const documents = normalizedTexts.items.map((item, index) => ({
      _id: String(item.id || `${createTextId()}-${index}`),
      data: {
        id: String(item.id || `${createTextId()}-${index}`),
        titulo: String(item.titulo || ''),
        descricao: String(item.descricao || ''),
      },
    }));

    await saveSiteContentDocuments(TEXTS_COLLECTION_NAME, documents);

    revalidatePath('/'); // Atualiza o cache da home/site
    return { success: true, data: normalizedTexts };
  } catch (error) {
    console.error("Erro ao salvar textos:", error.message);
    return { success: false, error: error.message };
  }
}
