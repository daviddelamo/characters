"use client";

import { useEffect, useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";

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

export default function CharacterList({ refreshKey }: { refreshKey: number }) {
    const [characters, setCharacters] = useState<Character[]>([]);
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
    }, [refreshKey]);

    const deleteCharacter = async (id: string) => {
        if (!confirm("¿Estás seguro de que quieres borrar este personaje?")) return;

        try {
            const res = await fetch(`/api/characters/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setCharacters(characters.filter((c) => c.id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="text-center p-12 text-purple-400">Cargando personajes...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {characters.length === 0 ? (
                <div className="col-span-full glass-card p-12 text-center text-purple-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">No hay personajes todavía</p>
                </div>
            ) : (
                characters.map((char) => (
                    <div key={char.id} className="glass-card overflow-hidden group">
                        <div className="h-48 relative">
                            <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                            <button
                                onClick={() => deleteCharacter(char.id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{char.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {char.forbiddenWords.map((fw) => (
                                    <span key={fw.id} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-md border border-purple-100">
                                        {fw.word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
