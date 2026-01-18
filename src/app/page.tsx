"use client";

import Link from "next/link";
import { Play, Settings, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [includeNoSet, setIncludeNoSet] = useState(true);
  const [loadingSets, setLoadingSets] = useState(true);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const res = await fetch("/api/sets");
      if (res.ok) {
        const data = await res.json();
        setSets(data);
        // Default select all sets
        setSelectedSetIds(data.map((s: any) => s.id));
      }
    } catch (error) {
      console.error("Failed to fetch sets", error);
    } finally {
      setLoadingSets(false);
    }
  };

  const toggleSet = (setId: string) => {
    setSelectedSetIds(prev =>
      prev.includes(setId)
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  };

  const handleStartGame = async () => {
    try {
      setLoading(true);
      const payload: any = {};
      if (sets.length > 0) {
        payload.allowedSets = selectedSetIds;
        payload.includeNoSet = includeNoSet;
      }

      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const game = await res.json();
        router.push(`/play?gameId=${game.id}`);
      } else {
        console.error("Failed to create game");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error starting game:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 space-y-12">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 animate-pulse"></div>
            <div className="w-24 h-24 glass-card flex items-center justify-center relative bg-white/50">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>
        <h1 className="text-6xl font-black tracking-tight text-gray-800">
          Personajes<span className="text-pink-500">.</span>
        </h1>
        <p className="text-xl text-purple-600 font-medium opacity-80">
          ¿Quién será el siguiente?
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Sets Configuration */}
        {!loadingSets && sets.length > 0 && (
          <div className="glass-card p-4 rounded-3xl space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-gray-700 font-bold px-1">Configuración de Sets</h3>
            <div className="flex flex-wrap gap-2">
              {sets.map(set => (
                <button
                  key={set.id}
                  onClick={() => toggleSet(set.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedSetIds.includes(set.id)
                    ? "bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
                    : "bg-white/50 text-gray-500 border-transparent hover:bg-white"
                    }`}
                >
                  {set.name}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 px-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeNoSet}
                onChange={(e) => setIncludeNoSet(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
              />
              <span className="text-gray-600 text-sm group-hover:text-purple-600 transition-colors">Incluir personajes sin set</span>
            </label>
          </div>
        )}

        <div className="grid gap-4">
          <button
            onClick={handleStartGame}
            disabled={loading}
            className="premium-button p-6 rounded-3xl text-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Play className="fill-current w-8 h-8" />
            )}
            {loading ? "Preparando..." : "¡Jugar ahora!"}
          </button>
          <Link
            href="/admin"
            className="glass-card p-6 rounded-3xl text-xl flex items-center justify-center gap-3 text-purple-600 font-bold hover:bg-white/60 transition-colors"
          >
            <Settings className="w-6 h-6" />
            Ajustes
          </Link>
        </div>
      </div>

      <footer className="fixed bottom-8 text-purple-400 font-medium">
        Hecho con ❤️ para la familia
      </footer>
    </main>
  );
}
