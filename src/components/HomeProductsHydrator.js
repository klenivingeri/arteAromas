"use client";

import { useEffect } from "react";
import { useProducts } from "@/context/ProductsContext";

export default function HomeProductsHydrator({ products = [] }) {
  const { setProducts } = useProducts();

  useEffect(() => {
    setProducts(products);
  }, [products, setProducts]);

  return null;
}
