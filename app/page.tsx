"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { Plus, Trash2, AlertTriangle, CheckCircle, Clock, LogOut, ChefHat, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Produto } from "@/lib/supabase";

const CATEGORIAS = [
  { nome: "Todas", emoji: "📦" },
  { nome: "Geladeira", emoji: "🧊" },
  { nome: "Armário", emoji: "🗄️" },
  { nome: "Remédios", emoji: "💊" },
  { nome: "Beleza", emoji: "💄" },
  { nome: "Padaria", emoji: "🍞" },
  { nome: "Limpeza", emoji: "🧹" },
];

function badgeValidade(validade: string) {
  const dias = differenceInDays(startOfDay(parseISO(validade)), startOfDay(new Date()));
  if (dias < 0) return { label: "Vencido", cor: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> };
  if (dias <= 3) return { label: `${dias}d`, cor: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> };
  if (dias <= 7) return { label: `${dias}d`, cor: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="w-3 h-3" /> };
  return { label: `${dias}d`, cor: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="w-3 h-3" /> };
}

function getEmoji(categoria: string) {
  return CATEGORIAS.find(c => c.nome === categoria)?.emoji ?? "📦";
}

export default function Home() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todas");
  const [receita, setReceita] = useState("");
  const [loadingReceita, setLoadingReceita] = useState(false);
  const [mostrarReceita, setMostrarReceita] = useState(false);

  const logout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
  };

  const getToken = async () => {
    const { data } = await supabaseBrowser.auth.getSession();
    if (!data.session) { router.push("/login"); return null; }
    return data.session.access_token;
  };

  const carregar = async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch("/api/produtos", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setProdutos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const deletar = async (id: number) => {
    const token = await getToken();
    await fetch(`/api/produtos?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  const buscarReceita = async () => {
    const urgentes = produtos.filter(p => {
      const dias = differenceInDays(startOfDay(parseISO(p.validade)), startOfDay(new Date()));
      return dias >= 0 && dias <= 7;
    }).map(p => p.nome);

    if (!urgentes.length) return;
    setLoadingReceita(true);
    setMostrarReceita(true);
    const res = await fetch("/api/receita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtos: urgentes }),
    });
    const data = await res.json();
    setReceita(data.receita ?? "Não foi possível gerar uma receita.");
    setLoadingReceita(false);
  };

  useEffect(() => { carregar(); }, []);

  const produtosFiltrados = filtro === "Todas" ? produtos : produtos.filter(p => p.categoria === filtro);
  const vencidos = produtosFiltrados.filter(p => differenceInDays(parseISO(p.validade), new Date()) < 0);
  const urgentes = produtosFiltrados.filter(p => { const d = differenceInDays(parseISO(p.validade), new Date()); return d >= 0 && d <= 7; });
  const ok = produtosFiltrados.filter(p => differenceInDays(parseISO(p.validade), new Date()) > 7);
  const produtosUrgentesTotal = produtos.filter(p => { const d = differenceInDays(parseISO(p.validade), new Date()); return d >= 0 && d <= 7; });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">VenceAí</h1>
            <p className="text-sm text-gray-500">{produtos.length === 1 ? "1 produto cadastrado" : `${produtos.length} produtos cadastrados`}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
            <Link href="/adicionar" className="flex items-center gap-1 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" />
              Adicionar
            </Link>
          </div>
        </div>

        {/* Sugestão de receita */}
        {produtosUrgentesTotal.length > 0 && (
          <button
            onClick={buscarReceita}
            className="w-full mb-4 flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-2xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <ChefHat className="w-4 h-4" />
            {produtosUrgentesTotal.length === 1
              ? `1 produto prestes a vencer — ver receita`
              : `${produtosUrgentesTotal.length} produtos prestes a vencer — ver receita`}
          </button>
        )}

        {/* Modal receita */}
        {mostrarReceita && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 relative">
            <button onClick={() => setMostrarReceita(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-5 h-5 text-orange-500" />
              <p className="font-semibold text-gray-800">Sugestão de Receita</p>
            </div>
            {loadingReceita ? (
              <p className="text-sm text-gray-400 text-center py-4">Gerando receita...</p>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line">{receita}</p>
            )}
          </div>
        )}

        {/* Filtro categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.nome}
              onClick={() => setFiltro(cat.nome)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filtro === cat.nome
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-500 hover:bg-teal-50"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.nome}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500 font-medium">Nenhum produto cadastrado</p>
            <p className="text-gray-400 text-sm mt-1">Toque em Adicionar para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...vencidos, ...urgentes, ...ok].map((produto) => {
              const badge = badgeValidade(produto.validade);
              return (
                <div key={produto.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <span className="text-2xl">{getEmoji(produto.categoria)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{produto.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Vence: {new Date(produto.validade + "T12:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${badge.cor}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
                  <button onClick={() => deletar(produto.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
