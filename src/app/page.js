import TestimonialSection from "@/components/CarouselRow";
import CarouselText from "@/components/CarouselText";
import { Header } from "@/components/Header/Header";
import HomeProductsHydrator from "@/components/HomeProductsHydrator";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { getHomeData } from "@/app/actions/home";
import { currency } from "@/utils/currency";
import { normalizeProducts } from "@/utils/product";
import Image from "next/image";
import Link from "next/link";

const applyDiscount = (price, discountPercent) => {
  return price * (1 - discountPercent / 100);
};

export default async function Home() {
  const homeDataRaw = await getHomeData();
  const normalizedProducts = normalizeProducts(homeDataRaw.products);
  const homeData = {
    ...homeDataRaw,
    products: normalizedProducts,
    launches: normalizedProducts.slice(-3).reverse(),
  };
  const bannerTitle = homeData.banner?.title?.trim() || "Transforme sua casa em um refúgio acolhedor";
  const bannerSubTitle = homeData.banner?.subTitle?.trim() || "Velas artesanais com aromas únicos";
  const bannerImage = homeData.banner?.imageUrl || "/banner.jpg";

  return (
    <div className="flex flex-col items-center">
      <HomeProductsHydrator products={homeData.products} />
      <header className="flex flex-1 w-full items-center justify-center">
        <Header />
        <div id="banner" className="w-full relative flex flex-col items-center">
          <div className=" absolute w-full flex justify-center items-center h-[600px]">
            <div className=" w-full lg:w-[800px] p-4 slideReveal">
              <p className=" text-4xl lg:text-6xl text-[var(--logo1)] text-shadow-lg font-bold">
                {bannerTitle}
              </p>
              <p className="text-1xl lg:text-2xl text-[var(--logo1)] text-shadow-lg my-4 font-bold">
                {bannerSubTitle}
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
            src={bannerImage}
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
          <CarouselText phrases={homeData.texts} />
        </ScrollFadeIn>

        <ScrollFadeIn>
          <p className="text-3xl lg:text-4xl font-medium mt-4 mb-4 px-2 lg:px-10">
            Lançamentos
          </p>
        </ScrollFadeIn>
        <ScrollFadeIn>
          <div className="flex gap-4 overflow-x-auto px-2 pb-2 lg:px-10 lg:overflow-visible">
            {homeData.launches.length === 0 && (
              <p className="text-gray-500 px-4">Nenhum lançamento cadastrado no painel.</p>
            )}
            {homeData.launches.map((product) => {
              const discountPercent = product.discountPercent || 0;
              const valorComDesconto = applyDiscount(product.price || 0, discountPercent);
              const value = discountPercent > 0 ? valorComDesconto : product.price;

              return (
              <Link
                key={product.id}
                href={`/pdp/${product.id}`}
                className="flex h-[360px] w-[200px] shrink-0 lg:h-[420px] lg:w-[260px] flex-col rounded-md border border-[var(--logo2)]/50 p-1 text-black shadow-md"
              >
                <div className="relative h-44 lg:h-52 overflow-hidden rounded-sm">
                  <Image
                    src={product.image || "/imagem1.jpg"}
                    alt={product.name || "Produto"}
                    width={500}
                    height={500}
                    priority
                    className="h-full w-full object-cover object-center shadow-md"
                  />
                  {discountPercent > 0 && (
                    <div className="absolute shadow-md top-2 left-0 rounded-br-full rounded-tr-full bg-[var(--logo1)] text-[var(--logo2)] px-2 py-1 text-sm lg:text-xl">
                      {discountPercent}% OFF
                    </div>
                  )}
                </div>

                <div className="mt-2 px-1 h-14 lg:h-16">
                  <p
                    className="font-semibold overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {product.name || "Produto sem nome"}
                  </p>
                </div>

                <span className="block w-full border-b border-black/10 my-2"></span>

                <div className="mt-auto flex h-11 items-center gap-2 px-1 pb-1">
                  <p className="flex w-full justify-center lg:text-2xl">
                    <span className="font-semibold text-lg">{currency(value)}</span>
                  </p>
                  <span className="flex font-semibold justify-center items-center text-1xl bg-[var(--logo2)] text-white rounded-sm w-full h-10 lg:h-10">
                    Ver
                  </span>
                </div>
              </Link>
              );
            })}
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
          {homeData.products.map((item) => {
            const discountPercent = item.discountPercent || 0;
            const valorComDesconto = applyDiscount(item.price || 0, discountPercent);
            const value = discountPercent > 0 ? valorComDesconto : item.price;
            return (
              <ScrollFadeIn key={item.id}>
                <div className="flex h-[360px] lg:h-[420px] flex-col text-black border border-[var(--logo2)]/50 p-1 rounded-md shadow-md">
                  <div className="relative h-52 lg:h-60 overflow-hidden rounded-sm">
                    <Image
                      src={item.image || "/imagem1.jpg"}
                      alt={item.name || "Produto"}
                      width={500}
                      height={500}
                      priority
                      className="h-full w-full object-cover object-center shadow-md"
                    />
                    {discountPercent > 0 && (
                      <div className="absolute shadow-md top-2 left-0 rounded-br-full rounded-tr-full bg-[var(--logo1)] text-[var(--logo2)] px-2 py-1 text-sm lg:text-xl">
                        {discountPercent}% OFF
                      </div>
                    )}
                  </div>
                  <div className="mt-2 px-1 h-14 lg:h-16">
                    <p
                      className="font-semibold overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.name || "Produto sem nome"}
                    </p>
                  </div>
                  <span className="block w-full border-b border-black/10 my-2"></span>
                  <div className="mt-auto flex h-11 items-center gap-2">
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
          {homeData.products.length === 0 && (
            <p className="text-gray-500 col-span-2 lg:col-span-4 text-center py-8">
              Nenhum produto cadastrado no painel.
            </p>
          )}
        </div>

        <ScrollFadeIn>
          <p className="text-3xl lg:text-3xl font-medium mt-10 mb-4 px-2 lg:px-10">
            Comentarios
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <TestimonialSection comments={homeData.comments} />
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
