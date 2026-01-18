
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Edit2, Save, X, Layers } from "lucide-react";

interface SetData {
    id: string;
    name: string;
    createdAt: string;
}

export default function SetsPage() {
    const [sets, setSets] = useState<SetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSetName, setNewSetName] = useState("");
    const [editingSet, setEditingSet] = useState<SetData | null>(null);

    useEffect(() => {
        fetchSets();
    }, []);

    const fetchSets = async () => {
        try {
            const res = await fetch("/api/sets");
            if (res.ok) {
                const data = await res.json();
                setSets(data);
            }
        } catch (error) {
            console.error("Failed to fetch sets", error);
        } finally {
            setLoading(false);
        }
    };

    const createSet = async () => {
        if (!newSetName.trim()) return;
        try {
            const res = await fetch("/api/sets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSetName }),
            });
            if (res.ok) {
                setNewSetName("");
                fetchSets();
            }
        } catch (error) {
            console.error("Failed to create set", error);
        }
    };

    const updateSet = async () => {
        if (!editingSet || !editingSet.name.trim()) return;
        try {
            const res = await fetch(`/api/sets/${editingSet.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingSet.name }),
            });
            if (res.ok) {
                setEditingSet(null);
                fetchSets();
            }
        } catch (error) {
            console.error("Failed to update set", error);
        }
    };

    const deleteSet = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar este set?")) return;
        try {
            const res = await fetch(`/api/sets/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchSets();
            }
        } catch (error) {
            console.error("Failed to delete set", error);
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 glass-card hover:bg-white/60 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-purple-600" />
                </Link>
                <div className="flex items-center gap-2">
                    <Layers className="w-8 h-8 text-purple-600" />
                    <h1 className="text-3xl font-extrabold text-gray-800">Gestionar Sets</h1>
                </div>
            </div>

            <div className="glass-card p-6 mb-8 border border-white/20">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Set</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newSetName}
                        onChange={(e) => setNewSetName(e.target.value)}
                        placeholder="Nombre del set (ej. Expansión 1)"
                        className="flex-1 px-4 py-2 rounded-xl bg-white/50 border border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        onClick={createSet}
                        disabled={!newSetName.trim()}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Crear
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Cargando...</p>
                ) : sets.length === 0 ? (
                    <p className="text-center text-gray-500">No hay sets creados aún.</p>
                ) : (
                    sets.map((set) => (
                        <div key={set.id} className="glass-card p-4 flex items-center justify-between group hover:bg-white/60 transition-colors">
                            {editingSet?.id === set.id ? (
                                <div className="flex-1 flex gap-4 mr-4">
                                    <input
                                        type="text"
                                        value={editingSet.name}
                                        onChange={(e) => setEditingSet({ ...editingSet, name: e.target.value })}
                                        className="flex-1 px-3 py-1 rounded-lg bg-white border border-purple-200 outline-none"
                                        autoFocus
                                    />
                                    <button onClick={updateSet} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                        <Save className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setEditingSet(null)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 font-medium text-gray-800 text-lg">
                                    {set.name}
                                </div>
                            )}

                            {editingSet?.id !== set.id && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingSet(set)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteSet(set.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
