'use client';

import { useState, useEffect, useMemo, useRef } from "react"; // Adicionado useRef
import Image from "next/image"; // Adicionado import do Image
import { saveBanner } from "@/app/actions/banner";

const Banner = ({ initialData, isLoading, onSaveSuccess }) => {
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("/banner.jpg");
  const [saving, setSaving] = useState(false);

  // --- DEFINIÇÕES QUE FALTAVAM ---
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  // -------------------------------

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSubTitle(initialData.subTitle || "");
      setImagePreview(initialData.imageUrl || "/banner.jpg");
    }
  }, [initialData]);

  const hasChanges = useMemo(() => {
    return (
      title !== (initialData?.title || "") ||
      subTitle !== (initialData?.subTitle || "") ||
      imageFile !== null
    );
  }, [title, subTitle, imageFile, initialData]);

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subTitle', subTitle);
    if (imageFile) formData.append('imageFile', imageFile);

    const result = await saveBanner(formData, initialData?.imageUrl);
    
    if (result.success) {
      onSaveSuccess(result.data);
      setImageFile(null);
      alert("Banner atualizado!");
    }
    setSaving(false);
  };

  if (isLoading) return <div className="p-10 animate-pulse text-gray-400">Carregando dados do banner...</div>;

  return (
    <div className="pb-6">
      <div className="font-bold mb-2">GESTÃO DO BANNER PRINCIPAL</div>
      
      <div className="border border-[var(--logo2)] rounded-sm flex flex-col pb-4 gap-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*"
          className="hidden" 
        />

        <div 
          className="relative group cursor-pointer overflow-hidden" 
          onClick={handleImageClick}
          title="Clique para trocar a imagem"
        >
          <Image
            src={imagePreview}
            alt="banner"
            width={1000}
            height={400}
            priority
            className="w-full lg:w-[800px] h-[300px] object-cover object-center fade transition-opacity group-hover:opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              Trocar Imagem
            </span>
          </div>
        </div>

        <div className="px-4 space-y-4">
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

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`w-full md:w-max px-8 py-3 font-bold rounded-xl active:scale-95 transition-all shadow-md ${
              hasChanges && !saving 
              ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;