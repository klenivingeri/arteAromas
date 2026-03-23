"use client";

import TestimonialSection from "@/components/CarouselRow";
import CarouselText from "@/components/CarouselText";
import { Header } from "@/components/Header/Header";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { currency } from "@/utils/currency";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: "1",
    name: "Vela Aromatica Lumière Cimento 1",
    price: 200,
    img: "/imagem1.jpg",
    discont: 0,
    description: "Descrição do produto",
  },
  {
    id: "2",
    name: "Vela Aromatica Lumière Cimento 2",
    price: 130,
    img: "/imagem1.jpg",
    discont: 30,
    description: "Descrição do produto",
  },
  {
    id: "3",
    name: "Vela Aromatica Lumière Cimento 3",
    price: 110,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
  {
    id: "4",
    name: "Vela Aromatica Lumière Cimento 4",
    price: 100,
    img: "/imagem1.jpg",
    discont: 3,
    description: "Descrição do produto",
  },
  {
    id: "5",
    name: "Vela Aromatica Lumière Cimento 5",
    price: 100,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
  {
    id: "6",
    name: "Vela Aromatica Lumière Cimento 6",
    price: 100,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
  {
    id: "7",
    name: "Vela Aromatica Lumière Cimento 7",
    price: 200,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
  {
    id: "8",
    name: "Vela Aromatica Lumière Cimento 8",
    price: 130,
    img: "/imagem1.jpg",
    discont: 30,
    description: "Descrição do produto",
  },
  {
    id: "9",
    name: "Vela Aromatica Lumière Cimento 9",
    price: 110,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
  {
    id: "10",
    name: "Vela Aromatica Lumière Cimento 10",
    price: 100,
    img: "/imagem1.jpg",
    discont: 3,
    description: "Descrição do produto",
  },
  {
    id: "11",
    name: "Vela Aromatica Lumière Cimento 11",
    price: 100,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
  {
    id: "12",
    name: "Vela Aromatica Lumière Cimento 12",
    price: 100,
    img: "/imagem1.jpg",
    discont: 10,
    description: "Descrição do produto",
  },
];

const aplicarDesconto = (valorOriginal, percentualDesconto) => {
  const valorFinal = valorOriginal * (1 - percentualDesconto / 100);
  return valorFinal;
};

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <header className="flex flex-1 w-full items-center justify-center">
        <Header />
        <div id="banner" className="w-full relative flex flex-col items-center">
          <div className=" absolute w-full flex justify-center items-center h-[600px]">
            <div className=" w-full lg:w-[800px] p-4 slideReveal">
              <p className=" text-4xl lg:text-6xl text-[var(--logo1)] text-shadow-lg font-bold">
                ✨ Transforme
              </p>
              <p className=" text-4xl lg:text-6xl text-[var(--logo1)] text-shadow-lg font-bold">
                sua casa em um
              </p>
              <p className=" text-4xl lg:text-6xl text-[var(--logo1)] text-shadow-lg font-bold">
                refújo acolhedor
              </p>
              <p className="text-1xl lg:text-2xl text-[var(--logo1)] text-shadow-lg my-4 font-bold">
                Velas artesanais com aromas únicos
              </p>

              <div className="flex gap-4 mt-6">
                <Link
                  href="#novidades"
                  className="bg-[var(--logo1)] rounded-sm text-[var(--logo2)] py-2 px-4"
                >
                  Compre Agora
                </Link>
                <Link
                  href="produtos"
                  className="border-2 border-[var(--logo1)] rounded-sm text-[var(--logo1)] py-2 px-4 "
                >
                  Ver Coleçãos
                </Link>
              </div>

              <div className="flex w-full gap-2 lg:w-[600px] justify-between mt-10">
                <p className="flex w-full items-center gap-2 text-sm lg:text-1xl text-[var(--logo1)] text-shadow-md mt-4">
                  <Image
                    src="/shipping-fast-solid-svgrepo-com.png"
                    alt="banner"
                    width={500}
                    height={500}
                    priority
                    className="h-4 w-4 lg:h-6 lg:w-6 fade rounded-sm"
                  />
                  Entregas para todo Brasil
                </p>
                <p className="flex w-full items-center gap-2 text-sm lg:text-1xl text-[var(--logo1)] text-shadow-md mt-4">
                  <Image
                    src="/security-verified-svgrepo-com.png"
                    alt="banner"
                    width={500}
                    height={500}
                    priority
                    className="h-4 w-4 lg:h-6 lg:w-6 rounded-full fade"
                  />{" "}
                  Compra Segura
                </p>
              </div>
              <div className="flex w-full gap-2 lg:w-[600px] justify-between">
                <p className="flex w-full items-center gap-2 text-sm lg:text-1xl text-[var(--logo1)] text-shadow-md mt-4">
                  <Image
                    src="/art-design-paint-pallet-format-text-svgrepo-com.png"
                    alt="banner"
                    width={500}
                    height={500}
                    priority
                    className="h-4 w-4 lg:h-6 lg:w-6 fade"
                  />{" "}
                  Produto Artesanal
                </p>

                <p className="flex w-full items-center gap-2 text-sm lg:text-1xl text-[var(--logo1)] text-shadow-md mt-4">
                  <Image
                    src="/present-svgrepo-com.png"
                    alt="banner"
                    width={500}
                    height={500}
                    priority
                    className="h-4 w-4 lg:h-6 lg:w-6 fade"
                  />{" "}
                  Ideal para presente
                </p>
              </div>
            </div>
          </div>
          <Image
            src="/banner.jpg"
            alt="banner"
            width={1000}
            height={20}
            priority
            className="h-[600px] w-full object-cover object-center fade"
          />
        </div>
      </header>
      <main id="novidades" className="w-full lg:w-7xl pt-4 fade">
        <ScrollFadeIn>
          <CarouselText />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <p className="text-3xl lg:text-4xl font-medium mt-4 mb-4 px-2 lg:px-10">
            Lançamentos
          </p>
        </ScrollFadeIn>
        <ScrollFadeIn>
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <Image
                src="/imagem1.jpg"
                alt="banner"
                width={500}
                height={500}
                priority
                className="h-48 w-32 lg:h-68 lg:w-68 rounded-sm object-cover object-center fade  border p-1 border-[var(--logo2)] "
              />
              <p className="text-1xl lg:text-2xl mt-4">Produto 1</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/banner.jpg"
                alt="banner"
                width={500}
                height={500}
                priority
                className="h-48 w-32 lg:h-68 lg:w-68 rounded-sm object-cover object-center fade  border p-1 border-[var(--logo2)] "
              />
              <p className="text-1xl lg:text-2xl mt-4">Produto 2</p>
            </div>
            <div className="flex flex-col items-center">
              <Image
                src="/imagem1.jpg"
                alt="banner"
                width={500}
                height={500}
                priority
                className="h-48 w-32 lg:h-68 lg:w-68 rounded-sm object-cover object-center fade border p-1 border-[var(--logo2)] "
              />
              <p className="text-1xl lg:text-2xl mt-4">Produto 3</p>
            </div>
          </div>
        </ScrollFadeIn>
        <ScrollFadeIn>
          <p
            id="produtos"
            className="text-3xl lg:text-4xl font-medium mt-10 mb-4 px-2 lg:px-10"
          >
            Galeria
          </p>
        </ScrollFadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 px-2 lg:px-10">
          {products.map((item, i) => {
            const valorComDesconto = aplicarDesconto(item.price, item.discont);
            const value = item.discont > 0 ? valorComDesconto : item.price;
            return (
              <ScrollFadeIn key={i}>
                <div
                  className="flex flex-col text-black border border-[var(--logo2)]/50 p-1 rounded-md shadow-md"
                >
                  <div className="relative">
                    <Image
                      src={item.img}
                      alt="banner"
                      width={500}
                      height={500}
                      priority
                      className="h-full w-full object-cover object-center rounded-sm shadow-md"
                    />
                    {item.discont > 0 && (
                      <div className="absolute shadow-md top-2 left-0 rounded-br-full rounded-tr-full bg-[var(--logo1)] text-[var(--logo2)] px-2 py-1 text-sm lg:text-xl">
                        {item.discont}% OFF
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-1xl lg:text-1xl mt-2 px-1 font-semibold">
                      {item.name}
                    </p>
                  </div>
                  <span className="block w-full border-b border-black/10 my-2"></span>
                  <div className="flex items-center gap-2">
                    <p className="flex w-full justify-center lg:text-2xl">
                      <span className="font-semibold text-lg">
                        {currency(value)}
                      </span>
                    </p>
                    <Link
                      href={`/pdp/${item.id}`}
                      className="flex font-semibold justify-center items-center text-1xl bg-[var(--logo2)] text-white rounded-sm w-full h-10 lg:h-10"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              </ScrollFadeIn>
            );
          })}
        </div>

        <ScrollFadeIn>
          <p className="text-3xl lg:text-3xl font-medium mt-10 mb-4 px-2 lg:px-10">
            Comentarios
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <TestimonialSection />
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
