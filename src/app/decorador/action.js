"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateFixedUserFromMongo,
  createSessionCookieValue,
} from "@/lib/auth.server";
import { SESSION_COOKIE_NAME } from "@/lib/auth.shared";

export async function loginAction(_prevState, formData) {
  const email = String(formData?.get("email") || "").trim();
  const password = String(formData?.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha tudo" };
  }

  const auth = await authenticateFixedUserFromMongo({ email, password });
  if (!auth.success) {
    // Avoid leaking internal auth configuration details in the login UI.
    const isCredentialError = auth.message === "Credenciais inválidas";

    return {
      error: isCredentialError
        ? "Email ou senha inválidos"
        : "Não foi possível entrar agora. Tente novamente.",
    };
  }

  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    return {
      error:
        "COOKIE_SECRET não configurada no ambiente. Configure a variável e reinicie o servidor.",
    };
  }

  const sessionValue = createSessionCookieValue(auth.user.id, secret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: auth.maxAge,
  });

  redirect("/painel");
}
