"use client";

import { useState } from "react";
import CharacterForm from "@/components/CharacterForm";
import CharacterList from "@/components/CharacterList";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import Modal from "@/components/Modal";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadResult {
    name: string;
    status: "success" | "error";
    id?: string;
    error?: string;
}

export default function AdminPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<"uploading" | "completed" | "error">("uploading");
    const [results, setResults] = useState<UploadResult[]>([]);
    const [editingCharacter, setEditingCharacter] = useState<any | null>(null);

    const handleCharacterCreated = () => {
        setRefreshKey((prev) => prev + 1);
        setEditingCharacter(null); // Clear editing state after success
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsModalOpen(true);
        setUploadStatus("uploading");
        setResults([]);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/characters/bulk", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setResults(data.results);
                setUploadStatus("completed");
                handleCharacterCreated();
            } else {
                setUploadStatus("error");
            }
        } catch (err) {
            console.error(err);
            setUploadStatus("error");
        }
    };

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

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
                <section className="glass-card p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                        Carga Masiva de Personajes
                    </h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Sube un archivo JSON con la lista de personajes. Las imágenes se descargarán automáticamente si se proporcionan URLs.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-purple-50 file:text-purple-700
                                    hover:file:bg-purple-100 transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                </section>

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={uploadStatus === "uploading" ? "Procesando Archivo..." : "Resultado de la Carga"}
                >
                    {uploadStatus === "uploading" ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                            <p className="text-gray-600 animate-pulse">Esto puede tardar unos minutos dependiendo de la cantidad de personajes e imágenes.</p>
                        </div>
                    ) : uploadStatus === "error" ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-gray-800 font-medium">Ocurrió un error al procesar el archivo.</p>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors font-medium text-gray-700"
                            >
                                Cerrar
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">Exitosos</p>
                                        <p className="text-2xl font-bold text-green-900">{successCount}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                    <div>
                                        <p className="text-sm text-red-700 font-medium">Fallidos</p>
                                        <p className="text-2xl font-bold text-red-900">{errorCount}</p>
                                    </div>
                                </div>
                            </div>

                            {errorCount > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Detalles de Errores</h3>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                        {results.filter(r => r.status === "error").map((result, idx) => (
                                            <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                                                <p className="font-bold text-gray-800">{result.name}</p>
                                                <p className="text-gray-600">{result.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-medium shadow-lg shadow-purple-200"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>

                <section id="character-form">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                        {editingCharacter ? "Editar Personaje" : "Añadir Personaje Individual"}
                    </h2>
                    <CharacterForm
                        onCharacterCreated={handleCharacterCreated}
                        initialData={editingCharacter}
                        onCancel={() => setEditingCharacter(null)}
                    />
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center text-sm">
                            {refreshKey >= 0 ? '✓' : ''}
                        </span>
                        Personajes Existentes
                    </h2>
                    <CharacterList
                        refreshKey={refreshKey}
                        onEdit={(char) => {
                            setEditingCharacter(char);
                            document.getElementById("character-form")?.scrollIntoView({ behavior: "smooth" });
                        }}
                    />
                </section>
            </div>
        </main>
    );
}
