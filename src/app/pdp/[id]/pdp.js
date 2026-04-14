"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { getProductById } from "@/app/actions/products";
import { Header } from "@/components/Header/Header";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { useProducts } from "@/context/ProductsContext";
import { currency } from "@/utils/currency";
import { normalizeProduct } from "@/utils/product";
import Image from "next/image";
import Link from "next/link";

const getCommentInitial = (name) => {
  const trimmedName = String(name || "").trim();
  return (trimmedName.charAt(0) || "C").toUpperCase();
};

const whatsapp = (item, valorComDesconto) => {
  let mensagem = `✨ *Olá! Tudo bem?*  
Tenho interesse na *${item.name}*  

💰 *Valor:* ${currency(item.price)}  

Pode me passar mais informações? 😊`;

  if (item.discountPercent > 0) {
    mensagem = `✨ *Olá! Tudo bem?*  
Tenho interesse na *${item.name}*  

🔥 *Promoção de ${item.discountPercent}% OFF!*  
💰 De: ~~${currency(item.price)}~~  
💸 Por: *${currency(valorComDesconto)}*  

Quero aproveitar! Pode me passar mais detalhes? 😍`;
  }
  return `https://wa.me/5516982660880?text=${encodeURIComponent(mensagem)}`;
};

const aplicarDesconto = (valorOriginal, percentualDesconto) => {
  const valorFinal = valorOriginal * (1 - percentualDesconto / 100);
  return valorFinal;
};

const renderWhatsAppInline = (text, keyPrefix) => {
  const inlineRegex = /(\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g;
  const nodes = [];
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of text.matchAll(inlineRegex)) {
    const start = match.index ?? 0;
    const token = match[0] || "";

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const content = token.slice(1, -1);
    const nodeKey = `${keyPrefix}-${tokenIndex}`;

    if (token.startsWith("*")) {
      nodes.push(<strong key={nodeKey}>{content}</strong>);
    } else if (token.startsWith("_")) {
      nodes.push(<em key={nodeKey}>{content}</em>);
    } else {
      nodes.push(<s key={nodeKey}>{content}</s>);
    }

    lastIndex = start + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

const renderWhatsAppText = (text) => {
  const safeText = String(text || "");
  const lines = safeText.split(/\r?\n/);

  return lines.map((line, lineIndex) => (
    <Fragment key={`line-${lineIndex}`}>
      {renderWhatsAppInline(line, `line-${lineIndex}`)}
      {lineIndex < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
};

export default function PagePdp({ productId }) {
  const { getProductById: getCachedProductById, isHydrated, upsertProduct } = useProducts();
  const [fallbackItem, setFallbackItem] = useState(null);
  const [isFetchingFallback, setIsFetchingFallback] = useState(false);
  const cachedItem = getCachedProductById(productId);

  useEffect(() => {
    let isMounted = true;

    async function loadFallbackProduct() {
      if (!isHydrated || cachedItem || !productId) return;

      setIsFetchingFallback(true);
      const serverProduct = await getProductById(productId);

      if (!isMounted) return;

      if (serverProduct) {
        setFallbackItem(serverProduct);
        upsertProduct(serverProduct);
      }

      setIsFetchingFallback(false);
    }

    loadFallbackProduct();

    return () => {
      isMounted = false;
    };
  }, [cachedItem, isHydrated, productId, upsertProduct]);

  const item = useMemo(
    () => normalizeProduct(cachedItem || fallbackItem),
    [cachedItem, fallbackItem],
  );

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center">
        <Header />
        <main className="w-full max-w-3xl px-4 pt-32 text-center text-black">
          <p className="text-2xl font-semibold">
            {isFetchingFallback ? "Carregando produto..." : "Produto não encontrado."}
          </p>
          <p className="mt-2 text-gray-600">
            {isHydrated
              ? "Tente voltar para a Home e abrir o produto novamente."
              : "Carregando cache local..."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-sm bg-[var(--logo2)] px-6 py-3 font-semibold text-white"
          >
            Voltar para Home
          </Link>
        </main>
      </div>
    );
  }

  const valorComDesconto = aplicarDesconto(item.price, item.discountPercent);
  const value = item.discountPercent > 0 ? valorComDesconto : item.price;
  return (
    <div className="flex flex-col items-center">
      <header className="flex flex-1 w-full items-center justify-center">
        <Header />
        <div
          id="banner"
          className="w-full lg:w-[800px] relative flex flex-col items-center"
        >
          {item.image && (
            <Image
              src={item.image}
              alt="banner"
              width={1000}
              height={20}
              priority
              className="w-full lg:w-[800px] object-cover object-center fade"
            />
          )}
          {item.discountPercent > 0 && (
            <div className="absolute bottom-0 left-0 rounded-full bg-black text-white px-2 py-1 lg:p-4 m-2 text-sm lg:text-3xl">
              {item.discountPercent}% OFF
            </div>
          )}
        </div>
      </header>
      <main id="lançamentos" className="w-full lg:w-[800px] text-black fade px-2">
        <p className="text-1xl lg:text-2xl font-medium mt-4 mb-2 text-shadow-md ">
          {item.name}
        </p>
        {item.description && (
          <div className="mt-2 rounded-md bg-white/40 p-3 lg:p-4">
            <p className="text-sm lg:text-base leading-6 text-black/90">
              {renderWhatsAppText(item.description)}
            </p>
          </div>
        )}
        <div className="flex w-full gap-2 lg:w-[600px] text-black justify-between p-2">
          <p className="flex w-full items-center gap-2 text-sm lg:text-1xl  text-shadow-md">
            <Image
              src="/shipping-fast-solid-svgrepo-com.png"
              alt="banner"
              width={500}
              height={500}
              priority
              className="h-4 w-4 lg:h-6 lg:w-6 fade invert"
            />
            Entregas para todo Brasil
          </p>
          <p className="flex w-full items-center gap-2 text-sm lg:text-1xl text-shadow-md">
            <Image
              src="/security-verified-svgrepo-com.png"
              alt="banner"
              width={500}
              height={500}
              priority
              className="h-4 w-4 lg:h-6 lg:w-6 rounded-full fade invert"
            />
            Compra Segura
          </p>
        </div>
        <div className="flex w-full gap-2 lg:w-[600px]  text-black justify-between p-2">
          <p className="flex w-full items-center gap-2 text-sm lg:text-1xl  text-shadow-md">
            <Image
              src="/art-design-paint-pallet-format-text-svgrepo-com.png"
              alt="banner"
              width={500}
              height={500}
              priority
              className="h-4 w-4 lg:h-6 lg:w-6 fade invert"
            />
            Produto Artesanal
          </p>
          <p className="flex w-full items-center gap-2 text-sm lg:text-1xl  text-shadow-md">
            <Image
              src="/present-svgrepo-com.png"
              alt="banner"
              width={500}
              height={500}
              priority
              className="h-4 w-4 lg:h-6 lg:w-6 fade invert"
            />
            Ideal para presente
          </p>
        </div>

        <div className="flex flex-col mt-6 p-2  rounded-md bg-white/50">
          <span className="text-sm lg:text-base text-gray-500 line-through">
            {currency(item.price)}
          </span>
          <p className=" flex justify-between  text-4xl">
            <span className="font-semibold mr-4 lg:text-6xl">
              {currency(value)}
            </span>
            {item.discountPercent > 0 && (
              <span className="flex font-semibold mt-1 text-white justify-center  items-center text-sm lg:text-base p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-sm h-6 lg:h-10 ">
                🔥 Economia {currency(item.price - value)}
              </span>
            )}
          </p>
          <p></p>
          <p>ou em 2x de {currency(value / 2)}</p>
        </div>

        <Link
          href={whatsapp(item, value)}
          className="flex font-semibold justify-center items-center text-1xl lg:text-2xl  mt-4 bg-[var(--logo2)] text-white rounded-sm w-full h-12 lg:h-16"
        >
          <Image
            src="/whatsapp.png"
            alt="comprar"
            width={40}
            height={40}
            className="h-8 w-8 object-cover mr-2 invert "
          />
          Pedir agora
        </Link>
        <ScrollFadeIn>
          <p className="text-1xl lg:text-1xl font-medium mt-10 lg:px-10">
            Comentarios
          </p>
          {item.comments.length === 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Este produto ainda não possui comentarios cadastrados.
            </p>
          )}
          <div className="mt-4 space-y-3 lg:px-10">
            {item.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm"
              >
                {comment.image ? (
                  <Image
                    src={comment.image}
                    alt={comment.name || "Cliente"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--logo2) text-lg font-bold text-white">
                    {getCommentInitial(comment.name)}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{comment.name || "Cliente"}</p>
                  <p className="text-sm text-gray-700">{comment.phrase}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="flex w-full text-sm justify-between gap-4 p-2 mt-4">
            <p className="">Privacidade e segurança</p>
            <p className="">Termos de uso</p>
            <p className="">Regulamentos</p>
            <p className="">Trabalhe conosco</p>
          </div>
        </ScrollFadeIn>
      </main>
    </div>
  );
}
