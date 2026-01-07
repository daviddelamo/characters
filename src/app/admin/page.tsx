"use client";

import { useState } from "react";
import CharacterForm from "@/components/CharacterForm";
import CharacterList from "@/components/CharacterList";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export default function AdminPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCharacterCreated = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 glass-card hover:bg-white/60 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-purple-600" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-extrabold text-gray-800">Panel de Admin</h1>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                <section>
                    <CharacterForm onCharacterCreated={handleCharacterCreated} />
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-sm">
                            {refreshKey >= 0 ? '✓' : ''}
                        </span>
                        Personajes Existentes
                    </h2>
                    <CharacterList refreshKey={refreshKey} />
                </section>
            </div>
        </main>
    );
}
