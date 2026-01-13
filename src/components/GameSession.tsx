"use client";

import { useState, useEffect } from "react";
import { Sparkles, Eye, EyeOff, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ForbiddenWord {
    id: string;
    word: string;
}

interface Character {
    id: string;
    name: string;
    imageUrl: string;
    forbiddenWords: ForbiddenWord[];
}

export default function GameSession() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
    const [phase, setPhase] = useState<"lobby" | "pass" | "describe">("lobby");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const res = await fetch("/api/characters");
                if (res.ok) {
                    const data = await res.json();
                    setCharacters(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCharacters();
    }, []);

    const nextCharacter = () => {
        if (characters.length === 0) return;
        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        setCurrentCharacter(randomChar);
        setPhase("pass");
    };

    if (isLoading) {
        return <div className="text-center p-12 text-purple-600 font-bold">Cargando personajes...</div>;
    }

    if (characters.length === 0) {
        return (
            <div className="text-center p-8 glass-card space-y-6">
                <p className="text-2xl font-bold text-gray-800">Ups, no hay personajes.</p>
                <Link href="/admin" className="premium-button px-6 py-3 rounded-xl inline-block">
                    Ir a Admin
                </Link>
            </div>
        );
    }

    if (phase === "lobby") {
        return (
            <div className="text-center space-y-8 py-12">
                <div className="relative inline-block">
                    <div className="absolute inset-0 blur-xl bg-purple-200 rounded-full opacity-50"></div>
                    <Sparkles className="w-20 h-20 text-purple-500 relative" />
                </div>
                <h2 className="text-4xl font-black text-gray-800">¿Listos?</h2>
                <p className="text-lg text-purple-600 font-medium px-4">
                    Un jugador tendrá que describir el personaje y el resto adivinarlo.
                </p>
                <button onClick={nextCharacter} className="premium-button px-10 py-5 rounded-3xl text-2xl">
                    ¡Empezar!
                </button>
            </div>
        );
    }

    if (phase === "pass") {
        return (
            <div className="text-center space-y-12 py-12 animate-in fade-in zoom-in duration-300">
                <h2 className="text-4xl font-extrabold text-gray-800 px-6">
                    Pásale el móvil al <span className="text-purple-600">describidor</span>
                </h2>
                <div className="w-32 h-32 mx-auto glass-card flex items-center justify-center">
                    <EyeOff className="w-16 h-16 text-purple-300" />
                </div>
                <p className="text-xl text-gray-500 font-medium">Los demás no pueden mirar...</p>
                <button
                    onClick={() => setPhase("describe")}
                    className="premium-button px-12 py-5 rounded-3xl text-2xl flex items-center gap-3 mx-auto"
                >
                    <Eye className="w-8 h-8" />
                    Ya lo tengo
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg landscape:max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col gap-4 animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            <div className="glass-card overflow-hidden shadow-2xl flex-1 flex flex-col landscape:flex-row min-h-0">
                <div className="h-80 landscape:h-full landscape:w-1/2 relative shrink-0">
                    <img
                        src={currentCharacter?.imageUrl}
                        alt="Personaje"
                        className="w-full h-full object-fill"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
                        <h3 className="text-3xl landscape:text-5xl font-black text-white text-center drop-shadow-lg uppercase tracking-tighter">
                            {currentCharacter?.name}
                        </h3>
                    </div>
                </div>
                <div className="p-6 landscape:p-8 flex-1 overflow-y-auto space-y-6">
                    <div>
                        <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-4">
                            Palabras Prohibidas
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {currentCharacter?.forbiddenWords.map((fw) => (
                                <div key={fw.id} className="bg-pink-50 border-2 border-pink-100 text-pink-600 p-3 landscape:p-4 rounded-2xl text-center font-black text-lg">
                                    {fw.word}
                                </div>
                            ))}
                            {currentCharacter?.forbiddenWords.length === 0 && (
                                <div className="col-span-2 text-center text-gray-400 py-4 italic">
                                    ¡Vaya suerte! No hay palabras prohibidas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="shrink-0 space-y-2">
                <div className="flex gap-4">
                    <button
                        onClick={() => setPhase("lobby")}
                        className="flex-1 glass-card p-4 landscape:p-5 rounded-3xl text-purple-600 font-bold flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-6 h-6" />
                        Reiniciar
                    </button>
                    <button
                        onClick={nextCharacter}
                        className="flex-2 premium-button p-4 landscape:p-5 rounded-3xl text-white font-bold flex items-center justify-center gap-2 text-xl"
                    >
                        Siguiente
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
                <p className="text-center text-purple-400 font-medium text-xs landscape:text-sm">
                    Pulsa "Siguiente" una vez hayan adivinado
                </p>
            </div>
        </div>
    );
}
