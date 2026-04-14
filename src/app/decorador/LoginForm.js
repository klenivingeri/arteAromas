"use client";

import { useActionState } from "react";
import { loginAction } from "./action";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: "",
  });

  return (
    <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 mb-50">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Acessar Conta</h1>
        <p className="text-sm text-gray-500">
          Bem-vindo! Digite seus dados abaixo.
        </p>
      </div>

      <form className="space-y-5" action={formAction}>
        <div className="flex flex-col items-start gap-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Login
          </label>
          <input
            type="text"
            name="email"
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
            name="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 mt-4 rounded-xl text-white font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transform active:scale-[0.98] transition-all shadow-lg shadow-orange-200"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
        {state?.error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {state.error}
          </p>
        ) : null}
        {/*
  <p className="text-center text-sm text-gray-600 mt-6">
    Não tem uma conta? <a href="#" className="font-bold text-orange-600 hover:underline">Cadastre-se</a>
  </p>
*/}
      </form>
    </div>
  );
}
