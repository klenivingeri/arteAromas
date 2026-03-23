"use client";

import { Header } from "@/components/Header/Header";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    if (email.trim() === "" || password.trim() === "") {
      setError(true);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const user = await res.json();
      if (user.success) {

        localStorage.setItem("customer", JSON.stringify(user.records));
        router.push("/painel");
      } else {
        setError(user.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Algo errado não esta certo, tente novamente.');
      setIsLoading(false);
    }
  }

  const handleGoToHome = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full h-16 flex items-center justify-center">
        <Header disable />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-50">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Acessar Conta</h1>
            <p className="text-sm text-gray-500">
              Bem-vindo! Digite seus dados abaixo.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col items-start gap-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Login
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col items-start gap-1.5">
              <div className="flex justify-between w-full">
                <label className="text-sm font-medium text-gray-700 ml-1">
                  Senha
                </label>
{/*
  <a href="#" className="text-xs text-orange-600 hover:underline">Esqueceu a senha?</a>
*/}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 mt-4 rounded-xl text-white font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform active:scale-[0.98] transition-all shadow-lg shadow-orange-200"
            >
              Entrar
            </button>
{/*
  <p className="text-center text-sm text-gray-600 mt-6">
    Não tem uma conta? <a href="#" className="font-bold text-orange-600 hover:underline">Cadastre-se</a>
  </p>
*/}
          </form>
        </div>
      </main>
    </div>
  );
}
