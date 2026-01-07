import Link from "next/link";
import { Play, Settings, Sparkles } from "lucide-react";

export default function Home() {
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

      <div className="grid gap-4 w-full max-w-sm">
        <Link
          href="/play"
          className="premium-button p-6 rounded-3xl text-2xl flex items-center justify-center gap-3"
        >
          <Play className="fill-current w-8 h-8" />
          ¡Jugar ahora!
        </Link>
        <Link
          href="/admin"
          className="glass-card p-6 rounded-3xl text-xl flex items-center justify-center gap-3 text-purple-600 font-bold hover:bg-white/60 transition-colors"
        >
          <Settings className="w-6 h-6" />
          Ajustes
        </Link>
      </div>

      <footer className="fixed bottom-8 text-purple-400 font-medium">
        Hecho con ❤️ para la familia
      </footer>
    </main>
  );
}
