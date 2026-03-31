"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function NovaSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSalvar = async () => {
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    setErro("");
    const { error } = await supabaseBrowser.auth.updateUser({ password: senha });
    if (error) {
      setErro("Erro ao atualizar senha. Tente novamente.");
    } else {
      setSucesso("Senha atualizada com sucesso!");
      setTimeout(() => router.push("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">VenceAí</h1>
          <p className="text-gray-500 text-sm mt-1">Criar nova senha</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <input
              type={mostrar ? "text" : "password"}
              placeholder="Nova senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              type="button"
              onClick={() => setMostrar(!mostrar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <input
            type={mostrar ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm text-center">{sucesso}</p>}

          <button
            onClick={handleSalvar}
            disabled={loading || !senha || !confirmar}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Salvar nova senha"}
          </button>
        </div>
      </div>
    </div>
  );
}
