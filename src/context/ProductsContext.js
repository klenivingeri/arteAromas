"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "decorartearomas:products-cache:v1";

const ProductsContext = createContext({
  products: [],
  isHydrated: false,
  setProducts: () => {},
  upsertProduct: () => {},
  getProductById: () => null,
});

export function ProductsProvider({ children }) {
  const [products, setProductsState] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (!cached) return;

      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        setProductsState(parsed);
      }
    } catch (_) {
      // Ignore invalid storage data and keep empty cache.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const setProducts = useCallback((nextProducts = []) => {
    const safeProducts = Array.isArray(nextProducts) ? nextProducts : [];
    setProductsState(safeProducts);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeProducts));
    } catch (_) {
      // Storage quota errors should not break navigation.
    }
  }, []);

  const upsertProduct = useCallback((product) => {
    if (!product?.id) return;

    setProductsState((previous) => {
      const exists = previous.some((item) => String(item?.id) === String(product.id));
      const next = exists
        ? previous.map((item) =>
            String(item?.id) === String(product.id) ? { ...item, ...product } : item,
          )
        : [...previous, product];

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {
        // Storage quota errors should not break navigation.
      }

      return next;
    });
  }, []);

  const value = useMemo(() => {
    return {
      products,
      isHydrated,
      setProducts,
      upsertProduct,
      getProductById: (id) =>
        products.find((product) => String(product?.id) === String(id)) || null,
    };
  }, [products, isHydrated, setProducts, upsertProduct]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  return useContext(ProductsContext);
}
