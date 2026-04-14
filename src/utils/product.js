export const getDiscountPercent = (discount) => {
  if (typeof discount === "number") return discount;
  if (typeof discount !== "string") return 0;

  const parsed = Number(discount.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const createCommentId = () =>
  `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const hasProductCommentContent = (comment) => {
  if (!comment || typeof comment !== "object") return false;

  return Boolean(
    String(comment.name || "").trim() ||
      String(comment.phrase || "").trim() ||
      String(comment.image || "").trim(),
  );
};

export const normalizeProductComment = (comment, index = 0) => {
  if (!comment || typeof comment !== "object") return null;

  return {
    id: String(comment.id || `${createCommentId()}-${index}`),
    name: String(comment.name || ""),
    phrase: String(comment.phrase || ""),
    image: String(comment.image || ""),
    showOnHome: comment.showOnHome === true,
  };
};

export const createEmptyProductComment = () => ({
  id: createCommentId(),
  name: "",
  phrase: "",
  image: "",
  showOnHome: false,
});

export const ensureEditableProductComments = (comments) => {
  const normalizedComments = Array.isArray(comments)
    ? comments.map(normalizeProductComment).filter(Boolean)
    : [];

  if (
    normalizedComments.length === 0 ||
    hasProductCommentContent(normalizedComments[normalizedComments.length - 1])
  ) {
    normalizedComments.push(createEmptyProductComment());
  }

  return normalizedComments;
};

export const sanitizeProductComments = (comments) => {
  if (!Array.isArray(comments)) return [];

  return comments
    .map(normalizeProductComment)
    .filter(hasProductCommentContent)
    .map((comment) => ({
      ...comment,
      name: comment.name.trim(),
      phrase: comment.phrase.trim(),
      image: comment.image.trim(),
    }));
};

export const prepareProductForEditor = (product) => ({
  ...product,
  comments: ensureEditableProductComments(product?.comments),
});

export const prepareProductsForEditor = (products) => {
  if (!Array.isArray(products)) return [];

  return products.map(prepareProductForEditor);
};

export const prepareProductsForStorage = (products) => {
  if (!Array.isArray(products)) return [];

  return products.map((product) => ({
    ...product,
    comments: sanitizeProductComments(product?.comments),
  }));
};

export const normalizeProduct = (product) => {
  if (!product) return null;

  return {
    id: String(product.id),
    name: product.name || "Produto sem nome",
    category: String(product.category || ""),
    description: product.description || "",
    price: Number(product.price || 0),
    image: product.image || product.img || "/imagem1.jpg",
    discountPercent: getDiscountPercent(product.discount ?? product.discont),
    rating: Number(product.rating || 0),
    isActive: product.isActive !== false,
    comments: sanitizeProductComments(product.comments),
  };
};

export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];

  return products
    .map(normalizeProduct)
    .filter((product) => product && product.isActive);
};
