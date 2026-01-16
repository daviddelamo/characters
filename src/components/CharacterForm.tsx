"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Upload, Loader2, Image as ImageIcon, Search, Check } from "lucide-react";

interface CharacterData {
    id: string;
    name: string;
    imageUrl: string;
    forbiddenWords: { id: string; word: string }[];
}

export default function CharacterForm({
    onCharacterCreated,
    initialData,
    onCancel
}: {
    onCharacterCreated: () => void;
    initialData?: CharacterData | null;
    onCancel?: () => void;
}) {
    const [name, setName] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [word, setWord] = useState("");
    const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Image Search State
    const [searchResults, setSearchResults] = useState<{ link: string; thumbnailLink: string; title: string }[]>([]);
    const [isSearchingImages, setIsSearchingImages] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [debouncedName, setDebouncedName] = useState(name);

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setImagePreview(initialData.imageUrl);
            setForbiddenWords(initialData.forbiddenWords.map(fw => fw.word));
            setImage(null);
            setSelectedImageUrl(initialData.imageUrl); // Treat existing image as "selected"? Or just preview.
        } else {
            setName("");
            setImagePreview(null);
            setForbiddenWords([]);
            setImage(null);
            setSelectedImageUrl(null);
            setSearchResults([]);
        }
    }, [initialData]);

    // Debounce name for search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedName(name);
        }, 800);
        return () => clearTimeout(timer);
    }, [name]);

    // Auto-search images
    useEffect(() => {
        if (debouncedName && debouncedName.length >= 3 && !initialData) { // Only auto-search for new characters or clear intent
            performImageSearch(debouncedName);
        }
    }, [debouncedName]);

    const performImageSearch = async (query: string) => {
        setIsSearchingImages(true);
        try {
            const res = await fetch(`/api/google-images?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.images || []);
            }
        } catch (error) {
            console.error("Error searching images:", error);
        } finally {
            setIsSearchingImages(false);
        }
    };

    const handleSelectImage = (url: string) => {
        setSelectedImageUrl(url);
        setImagePreview(url);
        setImage(null); // Clear any uploaded file
    };

    const handleFile = useCallback((file: File) => {
        if (file && file.type.startsWith("image/")) {
            setImage(file);
            setSelectedImageUrl(null); // Clear selected URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const file = items[i].getAsFile();
                    if (file) handleFile(file);
                }
            }
        }
    }, [handleFile]);

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [handlePaste]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
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
        if (!name || (!image && !selectedImageUrl && !isEditing)) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("name", name);
        if (image) {
            formData.append("image", image);
        } else if (selectedImageUrl) {
            formData.append("imageUrl", selectedImageUrl);
        }
        formData.append("forbiddenWords", JSON.stringify(forbiddenWords));

        try {
            const url = isEditing ? `/api/characters/${initialData.id}` : "/api/characters";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                body: formData,
            });

            if (res.ok) {
                if (!isEditing) {
                    setName("");
                    setImage(null);
                    setImagePreview(null);
                    setSelectedImageUrl(null);
                    setSearchResults([]);
                    setForbiddenWords([]);
                }
                onCharacterCreated();
            } else {
                alert(`Failed to ${isEditing ? 'update' : 'create'} character`);
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
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-600">
                    {isEditing ? "Editar Personaje" : "Nuevo Personaje"}
                </h2>
                {isEditing && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar Edición
                    </button>
                )}
            </div>
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
                    <div className="relative group mb-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            required={!imagePreview && !selectedImageUrl}
                        />
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${imagePreview
                                ? 'border-transparent p-0 overflow-hidden h-64'
                                : isDragging
                                    ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                                    : 'border-purple-200 group-hover:border-purple-300'
                                }`}
                        >
                            {imagePreview ? (
                                <div className="relative w-full h-full group/preview bg-gray-50/50">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5" />
                                            Cambiar imagen
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className={`w-12 h-12 mb-2 transition-transform ${isDragging ? 'scale-110 text-purple-500' : 'text-purple-300'}`} />
                                    <span className={`font-medium transition-colors ${isDragging ? 'text-purple-600' : 'text-purple-400'}`}>
                                        {isDragging ? '¡Suéltala aquí!' : 'Pulsa, pega o arrastra una imagen'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Image Search Results */}
                    {(isSearchingImages || searchResults.length > 0) && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resultados de búsqueda web
                                </label>
                                {isSearchingImages && <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />}
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {searchResults.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectImage(img.link)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${selectedImageUrl === img.link ? 'border-purple-500 ring-2 ring-purple-500 ring-offset-2' : 'border-transparent hover:border-purple-300'
                                            }`}
                                    >
                                        <img src={img.thumbnailLink} alt={img.title} className="w-full h-full object-cover" />
                                        {selectedImageUrl === img.link && (
                                            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                                <div className="bg-purple-500 text-white rounded-full p-1">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                {isSearchingImages ? 'Buscando imágenes...' : 'Selecciona una imagen de la web o sube la tuya'}
                            </p>
                        </div>
                    )}
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
                        isEditing ? "Guardar Cambios" : "Crear Personaje"
                    )}
                </button>
            </form>
        </div>
    );
}
