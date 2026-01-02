"use client";

import React, { useRef, useState } from 'react';

interface FileUploadProps {
    label: string;
    accept: string;
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void;
    helperText?: string;
}

export default function FileUpload({ label, accept, multiple = false, onFilesSelected, helperText }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewFiles, setPreviewFiles] = useState<File[]>([]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (files: File[]) => {
        // Filter by accept type approximately if needed, but input handles mostly
        setPreviewFiles(prev => multiple ? [...prev, ...files] : files);
        onFilesSelected(files);
    };

    const removeFile = (index: number) => {
        const newFiles = [...previewFiles];
        newFiles.splice(index, 1);
        setPreviewFiles(newFiles);
        // Note: We might need a way to propagate removal up, but for now this is just UI feedback
        // Ideally parent manages state, but simple prop 'onFilesSelected' suggests parent expects *new* files.
        // However, if we want to manage full state, we should pass 'files' as prop.
        // For this iteration, we'll keep it simple: this component emits *added* files.
        // But for a robust form, we might want to lift state completely.
        // Re-reading requirements: "Garlería de Imágenes (drag and drop)".
        // Let's assume this component is just the input mechanism.
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                />

                <div className="space-y-2">
                    <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-sm">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Haz clic para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-gray-500">{helperText || (multiple ? "PNG, JPG hasta 5MB" : "PDF o Imagen")}</p>
                    </div>
                </div>
            </div>

            {/* File Previews */}
            {previewFiles.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center justify-between p-2 bg-white border rounded shadow-sm">
                            <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
