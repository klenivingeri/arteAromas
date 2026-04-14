"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const defaultPhrases = [
  "Uma vela não perde nada de sua luz ao compartilhar sua chama com outra; ela apenas torna o mundo um pouco mais iluminado.",
  "Há um silêncio sagrado que só a dança de uma chama sabe traduzir. Velas transformam casas em lares e momentos em memórias.",
  "Mesmo a menor das velas é capaz de desafiar a escuridão mais profunda. Que a sua luz interior brilhe com a mesma persistência.",
  "Luz suave, aroma calmo e alma em paz. Às vezes, tudo o que precisamos é acender uma vela e deixar o tempo passar devagar.",
];

export default function CarouselText({ phrases = [] }) {
  const carouselPhrases =
    Array.isArray(phrases) && phrases.length > 0 ? phrases : defaultPhrases;

  // 1. Carrossel Superior: Esquerda para Direita
  const [emblaRef1] = useEmblaCarousel({ 
    loop: true, 
    startIndex: 0 
  }, [
    Autoplay({ delay: 15000, stopOnInteraction: false })
  ]);

const Card = ({ description }) => (
  <div 
    dir="ltr" 
    className="flex-[0_0_auto] w-[280px] md:w-[1200px] mx-3 flex flex-col items-center justify-center select-none p-2 rounded-2xl"
  >
    <div className="flex flex-col items-center text-center w-full">
      <span className="text-sm md:text-base text-gray-500 leading-relaxed whitespace-normal break-words w-full">
        {description}
      </span>
    </div>
  </div>
);

  return (
    <section className="w-full space-y-8 overflow-hidden">
      
      {/* Carrossel 1: Fluxo Padrão */}
      <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef1}>
        <div className="embla__container flex">
          {carouselPhrases.map((phrase, idx) => (
            <Card key={`top-${idx}`} description={phrase} />
          ))}
        </div>
      </div>
    </section>
  );
}