import GameSession from "@/components/GameSession";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";

export default function PlayPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <Link href="/" className="p-2 glass-card hover:bg-white/60 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-purple-600" />
                </Link>
                <div className="text-right">
                    <span className="text-xs font-black text-pink-400 uppercase tracking-widest">En Juego</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <Suspense fallback={<div className="text-center text-purple-600">Cargando partida...</div>}>
                    <GameSession />
                </Suspense>
            </div>
        </main>
    );
}
