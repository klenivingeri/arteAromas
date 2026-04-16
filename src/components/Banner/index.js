'use client';

import { startTransition, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { saveBanner } from "@/app/actions/banner";
import { sanitizeImageSrc, sanitizeLinkHref } from "@/utils/url";

const Banner = ({ initialData, isLoading, onSaveSuccess }) => {
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [primaryButtonText, setPrimaryButtonText] = useState("Compre Agora");
  const [primaryButtonLink, setPrimaryButtonLink] = useState("#novidades");
  const [secondaryButtonText, setSecondaryButtonText] = useState("Ver Coleções");
  const [secondaryButtonLink, setSecondaryButtonLink] = useState("link");
  const [imageUrl, setImageUrl] = useState("/banner.jpg");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("/banner.jpg");
  const [saving, setSaving] = useState(false);
  const isIbbShareLink = /^https?:\/\/(www\.)?ibb\.co\//i.test(String(imageUrl || ""));

  useEffect(() => {
    if (initialData) {
      startTransition(() => {
        setTitle(initialData.title || "");
        setSubTitle(initialData.subTitle || "");
        setPrimaryButtonText(initialData.primaryButtonText || "Compre Agora");
        setPrimaryButtonLink(sanitizeLinkHref(initialData.primaryButtonLink, "#lancamentos"));
        setSecondaryButtonText(initialData.secondaryButtonText || "Ver Coleções");
        setSecondaryButtonLink(sanitizeLinkHref(initialData.secondaryButtonLink, "/home"));
        setImageUrl(sanitizeImageSrc(initialData.imageUrl, "/banner.jpg"));
        setImagePreviewUrl(sanitizeImageSrc(initialData.imageUrl, null));
      });
    }
  }, [initialData]);

  const hasChanges = useMemo(() => {
    return (
      title !== (initialData?.title || "") ||
      subTitle !== (initialData?.subTitle || "") ||
      primaryButtonText !== (initialData?.primaryButtonText || "Compre Agora") ||
      primaryButtonLink !== sanitizeLinkHref(initialData?.primaryButtonLink, "#lancamentos") ||
      secondaryButtonText !== (initialData?.secondaryButtonText || "Ver Coleções") ||
      secondaryButtonLink !== sanitizeLinkHref(initialData?.secondaryButtonLink, "/home") ||
      imageUrl !== sanitizeImageSrc(initialData?.imageUrl, "/banner.jpg")
    );
  }, [title, subTitle, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink, imageUrl, initialData]);

  const handleImageBlur = () => {
    setImagePreviewUrl(sanitizeImageSrc(imageUrl, null));
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subTitle', subTitle);
    formData.append('primaryButtonText', primaryButtonText);
    formData.append('primaryButtonLink', primaryButtonLink);
    formData.append('secondaryButtonText', secondaryButtonText);
    formData.append('secondaryButtonLink', secondaryButtonLink);
    formData.append('imageUrl', imageUrl || '');

    const result = await saveBanner(formData);
    
    if (result.success) {
      onSaveSuccess(result.data);
      alert("Banner atualizado!");
    }
    setSaving(false);
  };

  if (isLoading) return <div className="p-10 animate-pulse text-gray-400">Carregando dados do banner...</div>;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-bold">GESTÃO DO BANNER PRINCIPAL</div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide transition-all ${
            hasChanges && !saving
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              : "cursor-not-allowed bg-gray-200 text-gray-500"
          }`}
          title="Salvar banner"
        >
          {saving ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          )}
          <span>{saving ? "Salvando..." : "Salvar"}</span>
        </button>
      </div>
      
      <div className="border border-(--logo2) rounded-sm flex flex-col pb-4 gap-4">
        <div className="relative group overflow-hidden">
          {imagePreviewUrl ? (
            <Image
              src={imagePreviewUrl}
              alt="banner"
              width={1000}
              height={400}
              priority
              className="w-full lg:w-200 h-75 object-cover object-center fade transition-opacity group-hover:opacity-80"
            />
          ) : (
            <div className="flex h-75 w-full items-center justify-center bg-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400">
              Sem imagem definida
            </div>
          )}
        </div>

        <div className="px-4 space-y-4">
          <div>
            <label className="font-bold block mb-1">URL da imagem do banner</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onBlur={handleImageBlur}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
            {isIbbShareLink && (
              <p className="mt-2 text-xs text-amber-700">
                Esse link parece ser da pagina do iBB. Use a URL direta da imagem (ex: https://i.ibb.co/...).
              </p>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1">Título banner</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Subtítulo banner</label>
            <input
              type="text"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              placeholder="SubTítulo"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-bold mb-4 text-gray-700">Botões do Banner</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-bold block mb-1 text-sm">Texto do Botão Primário</label>
                <input
                  type="text"
                  value={primaryButtonText}
                  onChange={(e) => setPrimaryButtonText(e.target.value)}
                  placeholder="Ex: Compre Agora"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="font-bold block mb-1 text-sm">Link do Botão Primário</label>
                <input
                  type="text"
                  value={primaryButtonLink}
                  onChange={(e) => setPrimaryButtonLink(e.target.value)}
                  placeholder="Ex: #novidades ou /produtos"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="font-bold block mb-1 text-sm">Texto do Botão Secundário</label>
                <input
                  type="text"
                  value={secondaryButtonText}
                  onChange={(e) => setSecondaryButtonText(e.target.value)}
                  placeholder="Ex: Ver Coleções"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="font-bold block mb-1 text-sm">Link do Botão Secundário</label>
                <input
                  type="text"
                  value={secondaryButtonLink}
                  onChange={(e) => setSecondaryButtonLink(e.target.value)}
                  placeholder="Ex: #novidades ou /produtos"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none transition-all text-gray-800 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Banner;
