"use client";

import { useEffect, useState } from "react";
import { saveTexts } from "@/app/actions/texts";

const createEmptyItem = () => ({
  id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  titulo: "",
  descricao: "",
});

const normalizeTextItem = (item) => {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const id = String(item.id || item._id || createEmptyItem().id);
    const titulo = String(item.titulo || item.title || "").trim();
    const descricao = String(item.descricao || item.description || item.texto || item.text || "").trim();

    if (!titulo && !descricao) {
      return null;
    }

    return { id, titulo, descricao };
  }

  const descricao = String(item || "").trim();

  if (!descricao) {
    return null;
  }

  return { id: createEmptyItem().id, titulo: "", descricao };
};

const extractTextItems = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeTextItem).filter(Boolean);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  if (Array.isArray(data.items)) {
    return data.items.map(normalizeTextItem).filter(Boolean);
  }

  if ("frases" in data) {
    const titulo = String(data.titulo || "").trim();

    return (Array.isArray(data.frases) ? data.frases : [])
      .map((descricao) => normalizeTextItem({ titulo, descricao }))
      .filter(Boolean);
  }

  return Object.keys(data)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .map((key) => normalizeTextItem(data[key]))
    .filter(Boolean);
};

const ensureEditableItems = (items) => {
  const safeItems = Array.isArray(items)
    ? items.filter(Boolean).map((item) => ({
        id: String(item?.id || item?._id || createEmptyItem().id),
        titulo: String(item?.titulo || ""),
        descricao: String(item?.descricao || ""),
      }))
    : [];

  const lastItem = safeItems[safeItems.length - 1];

  if (!lastItem || lastItem.titulo.trim().length > 0 || lastItem.descricao.trim().length > 0) {
    safeItems.push(createEmptyItem());
  }

  return safeItems;
};

export default function Texts({ initialData, isLoading, onSaveSuccess }) {
  const [items, setItems] = useState([createEmptyItem()]);
  const [saving, setSaving] = useState(false);

  const hasContent = items.some(
    (item) => String(item?.titulo || "").trim() || String(item?.descricao || "").trim(),
  );

  useEffect(() => {
    setItems(ensureEditableItems(extractTextItems(initialData)));
  }, [initialData]);

  const buildPayload = (sourceItems) =>
    sourceItems
      .map((item) => ({
        id: String(item?.id || createEmptyItem().id),
        titulo: String(item?.titulo || "").trim(),
        descricao: String(item?.descricao || "").trim(),
      }))
      .filter((item) => item.titulo || item.descricao);

  const persistItems = async (nextItems, successMessage) => {
    setSaving(true);

    const payload = buildPayload(nextItems);
    const result = await saveTexts({ items: payload });

    if (result.success) {
      onSaveSuccess(result.data);
      setItems(ensureEditableItems(extractTextItems(result.data)));

      if (successMessage) {
        alert(successMessage);
      }
    } else {
      alert("Erro ao atualizar: " + result.error);
    }

    setSaving(false);
  };

  const handleChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return ensureEditableItems(updated);
    });
  };

  const removeItem = async (index) => {
    const nextItems = ensureEditableItems(items.filter((_, itemIndex) => itemIndex !== index));
    setItems(nextItems);
    await persistItems(nextItems);
  };

  const handleUpdate = async () => {
    await persistItems(items, "Textos rotativos atualizados com sucesso!");
  };

  if (isLoading) {
    return <div className="p-10 animate-pulse text-gray-400 text-center">Carregando textos...</div>;
  }

  return (
    <div>
      <div className="mb-3 font-bold">TEXTOS ROTATIVOS</div>
      <div className="border border-(--logo2) rounded-sm p-4 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          {items.map((item, index) => {
            const isEmpty = !item.titulo.trim() && !item.descricao.trim();

            return (
              <div key={item.id || index} className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={item.titulo}
                    onChange={(e) => handleChange(index, "titulo", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500"
                    placeholder={`Título ${index + 1}`}
                  />
                  <textarea
                    value={item.descricao}
                    onChange={(e) => handleChange(index, "descricao", e.target.value)}
                    className="min-h-28 w-full resize-y px-4 py-3 rounded-xl bg-white border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500"
                    placeholder={`Texto ${index + 1}`}
                  />
                </div>
                {!isEmpty && (
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => removeItem(index)}
                      disabled={saving}
                      className="p-2 text-red-500 transition-colors hover:text-red-600"
                      title="Remover texto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={saving || !hasContent}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-wide transition-all ${
                        saving || !hasContent
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                      }`}
                      title="Salvar textos"
                    >
                      {saving ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                      )}
                      <span>{saving ? "Salvando" : "Salvar"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
