// NÃO tem "use client"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header/Header";
import { verifySessionCookieServer } from "@/lib/auth.server";
import { SESSION_COOKIE_NAME } from "@/lib/auth.shared";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.COOKIE_SECRET;

  if (sessionValue && secret) {
    const isValid = verifySessionCookieServer(sessionValue, secret);

    if (isValid) {
      redirect("/painel");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full h-16 flex items-center justify-center">
        <Header disable />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <LoginForm />
      </main>
    </div>
  );
}
