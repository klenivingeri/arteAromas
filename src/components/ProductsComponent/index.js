"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import Image from "next/image";
import { saveProductItem, saveProductsList } from "@/app/actions/products";
import { currency } from "@/utils/currency";
import {
  createEmptyProductComment,
  hasProductCommentContent,
  prepareProductsForEditor,
  prepareProductsForStorage,
} from "@/utils/product";
import { sanitizeImageSrc } from "@/utils/url";

const getCommentInitial = (name) => {
  const trimmedName = String(name || "").trim();
  return (trimmedName.charAt(0) || "C").toUpperCase();
};

const ensureTrailingComment = (comments) => {
  const safeComments = Array.isArray(comments) ? [...comments] : [];

  if (
    safeComments.length === 0 ||
    hasProductCommentContent(safeComments[safeComments.length - 1])
  ) {
    safeComments.push(createEmptyProductComment());
  }

  return safeComments;
};

const ProductsComponent = ({ initialData, isLoading, onSaveSuccess }) => {
  const [products, setProducts] = useState([]);
  const [savingProductId, setSavingProductId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTab, setEditingTab] = useState("product");
  const [categoryDropdownProductId, setCategoryDropdownProductId] = useState(null);
  const [linhaDropdownProductId, setLinhaDropdownProductId] = useState(null);

  const categorySuggestions = useMemo(() => {
    const categories = products
      .map((product) => String(product?.category || "").trim())
      .filter(Boolean);

    return [...new Set(categories)].sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
    );
  }, [products]);

  const linhaSuggestions = useMemo(() => {
    const linhas = products
      .map((product) => String(product?.linha || "").trim())
      .filter(Boolean);

    return [...new Set(linhas)].sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
    );
  }, [products]);

  useEffect(() => {
    if (initialData) {
      startTransition(() => {
        setProducts(prepareProductsForEditor(initialData));
      });
    }
  }, [initialData]);

  const handleChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const handleImageBlur = (index) => {
    setProducts((currentProducts) => {
      const newProducts = [...currentProducts];
      const currentImage = newProducts[index]?.image || "";
      newProducts[index] = {
        ...newProducts[index],
        imagePreview: sanitizeImageSrc(currentImage, null),
      };
      return newProducts;
    });
  };

  const handleCommentImageBlur = (productIndex, commentIndex) => {
    setProducts((currentProducts) => {
      const newProducts = [...currentProducts];
      const product = newProducts[productIndex];
      if (!product) return currentProducts;

      const comments = Array.isArray(product.comments) ? [...product.comments] : [];
      const currentComment = comments[commentIndex];
      if (!currentComment) return currentProducts;

      comments[commentIndex] = {
        ...currentComment,
        imagePreview: sanitizeImageSrc(currentComment.image, null),
      };

      newProducts[productIndex] = {
        ...product,
        comments,
      };

      return newProducts;
    });
  };

  const addNewProduct = () => {
    const newId = Date.now();
    setProducts([
      ...products,
      {
        name: "",
        description: "",
        price: 0,
        discount: "",
        image: "",
        imagePreview: null,
        rating: 10,
        interactions: 0,
        isActive: true,
        category: "",
        linha: "",
        comments: [createEmptyProductComment()],
        id: newId,
      },
    ]);
    setEditingId(newId);
    setEditingTab("product");
  };

  const openEditor = (productId) => {
    setEditingId(productId);
    setEditingTab("product");
  };

  const removeProduct = async (index) => {
    if (!confirm("Deseja excluir este produto?")) return;

    const productToRemove = products[index];
    const nextProducts = products.filter((_, i) => i !== index);
    setProducts(nextProducts);

    if (editingId === productToRemove?.id) {
      setEditingId(null);
    }

    const result = await saveProductsList(nextProducts);

    if (result.success) {
      const syncedProducts = prepareProductsForEditor(result.data);
      setProducts(syncedProducts);
      onSaveSuccess(syncedProducts);
      return;
    }

    alert("Erro ao excluir produto: " + result.error);
  };

  const handleSaveProduct = async (index) => {
    const currentProduct = products[index];
    if (!currentProduct) return;

    setSavingProductId(currentProduct.id);
    const payload = prepareProductsForStorage([currentProduct])[0];
    const result = await saveProductItem(payload);

    if (result.success) {
      const updatedProducts = [...products];
      updatedProducts[index] = prepareProductsForEditor([result.data])[0];
      setProducts(updatedProducts);
      onSaveSuccess(updatedProducts);
      setEditingId(currentProduct.id);
      setCategoryDropdownProductId(null);
    }

    setSavingProductId(null);
  };

  const handleCommentChange = (productIndex, commentIndex, field, value) => {
    setProducts((currentProducts) => {
      const newProducts = [...currentProducts];
      const comments = ensureTrailingComment(newProducts[productIndex].comments);
      comments[commentIndex] = {
        ...comments[commentIndex],
        [field]: value,
      };
      newProducts[productIndex] = {
        ...newProducts[productIndex],
        comments: ensureTrailingComment(comments),
      };
      return newProducts;
    });
  };


  const removeComment = async (productIndex, commentIndex) => {
    const selectedComment = products[productIndex]?.comments?.[commentIndex];
    if (!selectedComment) return;

    if (!confirm("Deseja remover este comentário?")) return;

    const nextProducts = [...products];
    const currentComments = nextProducts[productIndex]?.comments || [];
    const filteredComments = currentComments.filter((_, index) => index !== commentIndex);

    nextProducts[productIndex] = {
      ...nextProducts[productIndex],
      comments: ensureTrailingComment(filteredComments),
    };

    setProducts(nextProducts);

    const result = await saveProductsList(nextProducts);

    if (result.success) {
      const syncedProducts = prepareProductsForEditor(result.data);
      setProducts(syncedProducts);
      onSaveSuccess(syncedProducts);
      return;
    }

    alert("Erro ao excluir comentário: " + result.error);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const val = i * 2;
      stars.push(
        <span key={i} className={rating >= val ? "text-yellow-400" : "text-gray-200"}>★</span>
      );
    }
    return stars;
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-gray-400">Carregando catálogo...</div>;

  return (
    <div className="relative pb-32">
      <div className="flex justify-between items-center mb-6">
        <div className="font-bold uppercase tracking-wide text-gray-600 text-sm">Gestão de Produtos</div>
        <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">
          {products.length} Itens no total
        </div>
      </div>

      <div className="space-y-6">
        {products.map((product, index) => {
          const isEditing = editingId === product.id;
          const totalComments = (product.comments || []).filter(hasProductCommentContent).length;
          const featuredComments = (product.comments || []).filter(
            (comment) => hasProductCommentContent(comment) && comment.showOnHome,
          ).length;
          const productPreviewSrc = product.imagePreview ?? sanitizeImageSrc(product.image, null);

          if (!isEditing) {
            return (
              /* --- MODO VISUALIZAÇÃO (LISTA ENXUTA) --- */
              <div
                key={product.id}
                className="flex items-center justify-between p-4 bg-white border rounded-[28px] shadow-sm hover:shadow-md transition-all border-gray-100"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    {productPreviewSrc ? (
                      <Image src={productPreviewSrc} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[8px] text-gray-300 font-bold uppercase">S/ Foto</div>
                    )}
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-gray-800 text-sm truncate">{product.name || "Produto sem nome"}</h3>
                    <p className="text-blue-600 font-black text-xs">{currency(product.price)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {totalComments} comentários, {featuredComments} na home
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openEditor(product.id)}
                  className="ml-4 px-5 py-2.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                >
                  Editar
                </button>
              </div>
            );
          }

          /* --- SEU COMPONENTE ORIGINAL (MODO EDIÇÃO COMPLETO) --- */
          return (
            <div
              key={product.id}
              className={`p-5 border rounded-3xl bg-white shadow-sm transition-all ${!product.isActive ? "opacity-60 grayscale" : ""}`}
            >
              {/* Status e Delete Row */}
              <div className="flex justify-between items-center mb-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.isActive}
                    onChange={(e) => handleChange(index, "isActive", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                  <span className="ml-3 text-[10px] font-black uppercase text-gray-400 tracking-tight">
                    {product.isActive ? "Visível no Catálogo" : "Produto Oculto"}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeProduct(index)}
                    className="p-2 text-red-500 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="text-[10px] font-black text-gray-400 uppercase hover:text-blue-500 px-2"
                  >
                    Fechar
                  </button>

                </div>
              </div>

              <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
                <button
                  onClick={() => setEditingTab("product")}
                  className={`flex-1 rounded-xl px-4 py-2 text-[11px] font-black uppercase transition-all ${editingTab === "product"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500"
                    }`}
                >
                  Produto
                </button>
                <button
                  onClick={() => setEditingTab("comments")}
                  className={`flex-1 rounded-xl px-4 py-2 text-[11px] font-black uppercase transition-all ${editingTab === "comments"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500"
                    }`}
                >
                  Comentários ({totalComments})
                </button>
              </div>

              {editingTab === "product" && (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Coluna de Mídia */}
                  <div className="w-full lg:w-56 space-y-3">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-gray-50 bg-gray-50">
                      {productPreviewSrc ? (
                        <Image src={productPreviewSrc} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-gray-300 font-bold">SEM FOTO</div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">URL da imagem</label>
                      <input
                        type="url"
                        value={product.image || ""}
                        onChange={(e) => handleChange(index, "image", e.target.value)}
                        onBlur={() => handleImageBlur(index)}
                        className="w-full px-4 py-3 mt-1 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold shadow-inner"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Coluna de Dados */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nome do Produto</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => handleChange(index, "name", e.target.value)}
                          className="w-full px-4 py-3.5 mt-1 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-400 text-sm font-bold shadow-inner"
                          placeholder="Nome..."
                        />
                      </div>

                      <div className="sm:col-span-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Categoria</label>
                        <input
                          type="text"
                          value={product.category || ""}
                          onChange={(e) => handleChange(index, "category", e.target.value)}
                          onFocus={() => setCategoryDropdownProductId(product.id)}
                          onBlur={() => {
                            setTimeout(() => setCategoryDropdownProductId(null), 120);
                          }}
                          className="w-full px-4 py-3.5 mt-1 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-400 text-sm font-semibold shadow-inner"
                          placeholder="Ex: Aromatizador"
                        />

                        {categoryDropdownProductId === product.id && categorySuggestions.length > 0 && (
                          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                            <div className="max-h-44 overflow-y-auto">
                              {categorySuggestions.map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                  onMouseDown={() => {
                                    handleChange(index, "category", category);
                                    setCategoryDropdownProductId(null);
                                  }}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Linha</label>
                        <input
                          type="text"
                          value={product.linha || ""}
                          onChange={(e) => handleChange(index, "linha", e.target.value)}
                          onFocus={() => setLinhaDropdownProductId(product.id)}
                          onBlur={() => {
                            setTimeout(() => setLinhaDropdownProductId(null), 120);
                          }}
                          className="w-full px-4 py-3.5 mt-1 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-400 text-sm font-semibold shadow-inner"
                          placeholder="Ex: Florais, Amadeirados..."
                        />

                        {linhaDropdownProductId === product.id && linhaSuggestions.length > 0 && (
                          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                            <div className="max-h-44 overflow-y-auto">
                              {linhaSuggestions.map((linha) => (
                                <button
                                  key={linha}
                                  type="button"
                                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                  onMouseDown={() => {
                                    handleChange(index, "linha", linha);
                                    setLinhaDropdownProductId(null);
                                  }}
                                >
                                  {linha}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2 bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-[10px] font-black text-yellow-700 uppercase">Popularidade</label>
                          <div className="text-sm flex gap-1">{renderStars(product.rating)}</div>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={product.rating || 10}
                          onChange={(e) => handleChange(index, "rating", parseInt(e.target.value))}
                          className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Preço Atual</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            value={currency(product.price)}
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(/\D/g, "");
                              handleChange(index, "price", Number(onlyNumbers) / 100);
                            }}
                            className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-400 text-sm shadow-inner font-bold text-blue-900"
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Desconto</label>
                        <input
                          type="text"
                          value={product.discount}
                          onChange={(e) => handleChange(index, "discount", e.target.value)}
                          className="w-full px-4 py-3.5 mt-1 rounded-2xl bg-green-50 border-none focus:ring-2 focus:ring-green-400 text-sm text-green-700 font-bold shadow-inner"
                          placeholder="Ex: -15%"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Descrição Breve</label>
                        <textarea
                          value={product.description}
                          onChange={(e) => handleChange(index, "description", e.target.value)}
                          className="w-full px-4 py-3.5 mt-1 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-400 text-sm shadow-inner"
                          rows="2"
                        />
                      </div>
                    </div>
                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                      {savingProductId === product.id && (
                        <div className="rounded-full border bg-white px-4 py-2 text-[10px] font-bold text-blue-600 shadow-xl animate-bounce">
                          A guardar produto...
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {editingTab === "comments" && (
                <div className="space-y-4">
                  {(product.comments || []).map((comment, commentIndex) => {
                    const isEmptyComment = !hasProductCommentContent(comment);
                    const commentPreviewSrc = comment.imagePreview ?? sanitizeImageSrc(comment.image, null);

                    return (
                      <div
                        key={comment.id}
                        className="rounded-3xl border border-gray-100 bg-gray-50/70 p-5 shadow-sm"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                            Comentários #{commentIndex + 1}
                          </p>

                          {!isEmptyComment && (
                            <button
                              onClick={() => removeComment(index, commentIndex)}
                              className="p-2 text-red-500 transition-colors hover:text-red-600"
                              title="Excluir comentário"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-6 lg:flex-row">
                          <div className="w-full lg:w-56 space-y-3">
                            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-inner">
                              {commentPreviewSrc ? (
                                <Image
                                  src={commentPreviewSrc}
                                  alt={comment.name || "Cliente"}
                                  width={56}
                                  height={56}
                                  className="h-14 w-14 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--logo2) text-lg font-bold text-white">
                                  {getCommentInitial(comment.name)}
                                </div>
                              )}
                              <span className="text-xs font-semibold text-gray-500">Avatar por URL</span>
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">URL da foto</label>
                              <input
                                type="url"
                                value={comment.image || ""}
                                onChange={(e) =>
                                  handleCommentChange(index, commentIndex, "image", e.target.value)
                                }
                                onBlur={() => handleCommentImageBlur(index, commentIndex)}
                                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold shadow-inner outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="https://..."
                              />
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div>
                              <input
                                type="text"
                                value={comment.name}
                                onChange={(e) =>
                                  handleCommentChange(index, commentIndex, "name", e.target.value)
                                }
                                className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold shadow-inner outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="Ex: Maria"
                              />
                            </div>

                            <div>
                              <textarea
                                value={comment.phrase}
                                onChange={(e) =>
                                  handleCommentChange(index, commentIndex, "phrase", e.target.value)
                                }
                                className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm shadow-inner outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="O que o cliente falou sobre esse produto?"
                                rows="3"
                              />
                            </div>

                            <label className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
                              <p className="text-[10px] font-black uppercase text-gray-400">
                                Exibir na home
                              </p>
                              <input
                                type="checkbox"
                                checked={comment.showOnHome}
                                onChange={(e) =>
                                  handleCommentChange(index, commentIndex, "showOnHome", e.target.checked)
                                }
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveProduct(index)}
                  disabled={savingProductId === product.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {savingProductId === product.id ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  )}
                  <span>Salvar produto</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addNewProduct}
        className="w-full mt-8 py-10 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-black text-xs hover:border-blue-400 hover:text-blue-500 transition-all uppercase tracking-widest bg-white/50"
      >
        + Adicionar Novo Produto ao Catálogo
      </button>
    </div>
  );
};

export default ProductsComponent;
