"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "cadastro" | "recuperar">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async () => {
    setErro("");
    setSucesso("");
    setLoading(true);

    if (modo === "recuperar") {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: "https://venceai.vercel.app/nova-senha",
      });
      if (error) {
        setErro("Erro ao enviar email. Verifique o endereço.");
      } else {
        setSucesso("Email de recuperação enviado! Verifique sua caixa de entrada.");
      }
      setLoading(false);
      return;
    }

    if (modo === "cadastro") {
      const { error } = await supabaseBrowser.auth.signUp({ email, password: senha });
      if (error) {
        setErro(error.message === "User already registered" ? "Email já cadastrado." : error.message);
      } else {
        setSucesso("Conta criada com sucesso!");
        setTimeout(() => {
          setModo("login");
          setSucesso("");
        }, 2000);
      }
    } else {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro("Email ou senha incorretos.");
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">VenceAí</h1>
          <p className="text-gray-500 text-sm mt-1">Controle a validade dos seus produtos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">

          {modo !== "recuperar" && (
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => { setModo("login"); setErro(""); setSucesso(""); }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${modo === "login" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setModo("cadastro"); setErro(""); setSucesso(""); }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${modo === "cadastro" ? "bg-teal-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Cadastrar
              </button>
            </div>
          )}

          {modo === "recuperar" && (
            <div>
              <button
                onClick={() => { setModo("login"); setErro(""); setSucesso(""); }}
                className="text-sm text-teal-600 hover:underline mb-2 flex items-center gap-1"
              >
                ← Voltar ao login
              </button>
              <p className="text-sm font-medium text-gray-700">Recuperar senha</p>
              <p className="text-xs text-gray-400 mt-1">Enviaremos um link para redefinir sua senha.</p>
            </div>
          )}

          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          {modo !== "recuperar" && (
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm text-center">{sucesso}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || (modo !== "recuperar" && !senha)}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : modo === "login" ? "Entrar"
              : modo === "cadastro" ? "Criar conta"
              : "Enviar link de recuperação"}
          </button>

          {modo === "login" && (
            <button
              onClick={() => { setModo("recuperar"); setErro(""); setSucesso(""); }}
              className="w-full text-sm text-gray-400 hover:text-teal-600 transition-colors text-center"
            >
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
