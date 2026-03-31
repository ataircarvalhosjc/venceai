"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { Plus, Trash2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { Produto } from "@/lib/supabase";

function badgeValidade(validade: string) {
  const dias = differenceInDays(startOfDay(parseISO(validade)), startOfDay(new Date()));
  if (dias < 0) return { label: "Vencido", cor: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> };
  if (dias <= 3) return { label: `${dias}d`, cor: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> };
  if (dias <= 7) return { label: `${dias}d`, cor: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="w-3 h-3" /> };
  return { label: `${dias}d`, cor: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle className="w-3 h-3" /> };
}

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    const res = await fetch("/api/produtos");
    const data = await res.json();
    setProdutos(data ?? []);
    setLoading(false);
  };

  const deletar = async (id: number) => {
    await fetch(`/api/produtos?id=${id}`, { method: "DELETE" });
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => { carregar(); }, []);

  const vencidos = produtos.filter(p => differenceInDays(parseISO(p.validade), new Date()) < 0);
  const urgentes = produtos.filter(p => { const d = differenceInDays(parseISO(p.validade), new Date()); return d >= 0 && d <= 7; });
  const ok = produtos.filter(p => differenceInDays(parseISO(p.validade), new Date()) > 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-teal-700">VenceAí</h1>
            <p className="text-sm text-gray-500">{produtos.length} produto{produtos.length !== 1 ? "s" : ""} cadastrado{produtos.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/adicionar"
            className="flex items-center gap-1 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : produtos.length === 0 ? (
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
                  <button
                    onClick={() => deletar(produto.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
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
