"use client";

import { useState } from "react";
import { Plus, X, Upload, Loader2 } from "lucide-react";

export default function CharacterForm({ onCharacterCreated }: { onCharacterCreated: () => void }) {
    const [name, setName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [word, setWord] = useState("");
    const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addForbiddenWord = () => {
        if (word.trim() && !forbiddenWords.includes(word.trim())) {
            setForbiddenWords([...forbiddenWords, word.trim()]);
            setWord("");
        }
    };

    const removeForbiddenWord = (wordToRemove: string) => {
        setForbiddenWords(forbiddenWords.filter((w) => w !== wordToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !image) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("image", image);
        formData.append("forbiddenWords", JSON.stringify(forbiddenWords));

        try {
            const res = await fetch("/api/characters", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                setName("");
                setImage(null);
                setImagePreview(null);
                setForbiddenWords([]);
                onCharacterCreated();
            } else {
                alert("Failed to create character");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-card p-6 w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-purple-600">Nuevo Personaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Personaje</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-purple-100 focus:border-purple-300 focus:outline-none transition-colors"
                        placeholder="Ej: Mickey Mouse"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                    <div className="relative group cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required={!imagePreview}
                        />
                        <div className={`border-2 border-dashed border-purple-200 rounded-xl p-8 flex flex-col items-center justify-center transition-all ${imagePreview ? 'border-none p-0 overflow-hidden h-64' : 'group-hover:border-purple-300'}`}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-purple-300 mb-2" />
                                    <span className="text-purple-400 font-medium">Pulsa para subir imagen</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Palabras Prohibidas</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={word}
                            onChange={(e) => setWord(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addForbiddenWord())}
                            className="flex-1 p-3 rounded-xl border-2 border-purple-100 focus:border-purple-300 focus:outline-none transition-colors"
                            placeholder="Añade palabra y pulsa +"
                        />
                        <button
                            type="button"
                            onClick={addForbiddenWord}
                            className="p-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {forbiddenWords.map((w) => (
                            <span key={w} className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                                {w}
                                <button type="button" onClick={() => removeForbiddenWord(w)} className="hover:text-pink-800">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-4 premium-button rounded-xl flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        "Crear Personaje"
                    )}
                </button>
            </form>
        </div>
    );
}
