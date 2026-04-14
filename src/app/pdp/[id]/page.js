import PagePdp from "./pdp";

export default async function Page({ params }) {
  const { id } = await params;

  return <PagePdp productId={id} />;
}