export const getDiscountPercent = (discount) => {
  if (typeof discount === "number") return discount;
  if (typeof discount !== "string") return 0;

  const parsed = Number(discount.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeProduct = (product) => {
  if (!product) return null;

  return {
    id: String(product.id),
    name: product.name || "Produto sem nome",
    description: product.description || "",
    price: Number(product.price || 0),
    image: product.image || product.img || "/imagem1.jpg",
    discountPercent: getDiscountPercent(product.discount ?? product.discont),
    isActive: product.isActive !== false,
  };
};

export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];

  return products
    .map(normalizeProduct)
    .filter((product) => product && product.isActive);
};
