"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

const CATEGORIAS = [
  { nome: "Geladeira", emoji: "🧊" },
  { nome: "Armário", emoji: "🗄️" },
  { nome: "Remédios", emoji: "💊" },
  { nome: "Beleza", emoji: "💄" },
  { nome: "Padaria", emoji: "🍞" },
  { nome: "Limpeza", emoji: "🧹" },
];

export default function Adicionar() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [validade, setValidade] = useState("");
  const [categoria, setCategoria] = useState("Armário");
  const [email, setEmail] = useState("");
  const [diasAviso, setDiasAviso] = useState("7");
  const [loading, setLoading] = useState(false);
  const [analisando, setAnalisando] = useState(false);

  const handleFoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const b64 = dataUrl.split(",")[1];
      setBase64(b64);
      setAnalisando(true);
      try {
        const res = await fetch("/api/analisar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: b64 }),
        });
        const data = await res.json();
        if (data.nome) setNome(data.nome);
        if (data.validade) setValidade(data.validade);
      } catch {}
      setAnalisando(false);
    };
    reader.readAsDataURL(file);
  };

  const salvar = async () => {
    if (!nome || !validade) return;
    setLoading(true);
    const { data } = await supabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        imageBase64: base64,
        nomeManual: nome,
        validadeManual: validade,
        categoria,
        emailNotificacao: email || null,
        diasAviso: parseInt(diasAviso),
      }),
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-teal-600 hover:text-teal-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-teal-700">Adicionar Produto</h1>
        </div>

        <div className="space-y-4">
          {/* Foto */}
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden shadow-sm">
              <img src={preview} alt="Produto" className="w-full max-h-56 object-cover" />
              <button
                onClick={() => { setPreview(null); setBase64(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
              {analisando && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                    <p className="text-sm">Lendo validade...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="bg-white border-2 border-dashed border-teal-300 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
            >
              <ImageIcon className="w-10 h-10 text-teal-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Selecionar foto do produto</p>
              <p className="text-xs text-gray-400 mt-1">O app lê a validade automaticamente</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFoto(f); }} />

          {/* Campos */}
          <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nome do Produto *</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Leite Integral, Iogurte..."
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data de Validade *</label>
              <input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.nome}
                    type="button"
                    onClick={() => setCategoria(cat.nome)}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                      categoria === cat.nome
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-100 bg-white text-gray-500 hover:border-teal-200"
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.emoji}</span>
                    {cat.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notificação */}
          <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notificação por Email (opcional)</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <div>
              <label className="text-xs text-gray-400">Avisar quantos dias antes?</label>
              <select
                value={diasAviso}
                onChange={(e) => setDiasAviso(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="3">3 dias antes</option>
                <option value="7">7 dias antes</option>
                <option value="15">15 dias antes</option>
                <option value="30">30 dias antes</option>
              </select>
            </div>
          </div>

          <button
            onClick={salvar}
            disabled={!nome || !validade || loading}
            className="w-full bg-teal-600 text-white py-3 rounded-2xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Salvar Produto"}
          </button>
        </div>
      </div>
    </div>
  );
}
