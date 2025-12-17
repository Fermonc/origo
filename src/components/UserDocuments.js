'use client';

import { useState, useEffect } from 'react';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function UserDocuments({ user, profile }) {
    const [uploading, setUploading] = useState({}); // Track uploading state per document type
    const [documents, setDocuments] = useState([]);

    // Required document types
    const docTypes = [
        { id: 'cedula', name: 'Cédula de Ciudadanía' },
        { id: 'laboral', name: 'Certificado Laboral' },
        { id: 'bancario', name: 'Extractos Bancarios' }
    ];

    useEffect(() => {
        if (profile?.documents) {
            setDocuments(profile.documents);
        }
    }, [profile]);

    const handleFileChange = async (typeId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Formato no válido. Por favor sube archivos PDF, Word o Imágenes (JPG, PNG).');
            e.target.value = ''; // Reset input
            return;
        }

        setUploading(prev => ({ ...prev, [typeId]: true }));

        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `documents/${user.uid}/${typeId}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            // 2. Create document object
            const newDoc = {
                id: typeId,
                name: docTypes.find(d => d.id === typeId)?.name || file.name,
                fileName: file.name,
                url: downloadURL,
                uploadedAt: new Date().toISOString(),
                status: 'uploaded'
            };

            // 3. Update Firestore
            const userRef = doc(db, 'users', user.uid);

            // We need to remove existing doc of same type if exists, then add new one
            // Since arrayRemove requires exact object match, it's safer to read, filter, and update
            // But for simplicity and atomicity, let's try a cleaner approach:
            // We will store documents as an array. To update, we might need to filter client side and overwrite the array or use a map in Firestore.
            // Given the structure is an array in the plan, let's stick to array.
            // To avoid duplicates, we'll read the current docs from profile (or fetch fresh), filter out this type, and add the new one.

            const currentDocs = profile?.documents || [];
            const updatedDocs = currentDocs.filter(d => d.id !== typeId);
            updatedDocs.push(newDoc);

            await updateDoc(userRef, {
                documents: updatedDocs
            });

            // Update local state immediately
            setDocuments(updatedDocs);
            alert('Documento subido correctamente.');

        } catch (error) {
            console.error("Error uploading document:", error);
            alert('Error al subir el documento. Intenta de nuevo.');
        } finally {
            setUploading(prev => ({ ...prev, [typeId]: false }));
        }
    };

    const getDocStatus = (typeId) => {
        const doc = documents.find(d => d.id === typeId);
        return doc ? { status: 'uploaded', fileName: doc.fileName, url: doc.url } : { status: 'pending' };
    };

    return (
        <div className="documents-container">
            <div className="info-box">
                <p>
                    <strong>📄 Documentación Requerida</strong><br />
                    Para agilizar el proceso de compra o arriendo, necesitamos validar tu identidad y solvencia.
                    Por favor sube los siguientes documentos en formato <strong>PDF, Word o Imagen (JPG/PNG)</strong>.
                    Tus datos están protegidos y son confidenciales.
                </p>
            </div>

            <div className="documents-list">
                {docTypes.map(type => {
                    const { status, fileName, url } = getDocStatus(type.id);
                    const isUploading = uploading[type.id];

                    return (
                        <div key={type.id} className="document-item">
                            <div className="doc-info">
                                <span className="doc-icon">{status === 'uploaded' ? '✅' : '📄'}</span>
                                <div>
                                    <h4>{type.name}</h4>
                                    <p className={`status ${status}`}>
                                        {status === 'uploaded' ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="doc-link">
                                                Subido: {fileName} (Ver)
                                            </a>
                                        ) : 'Pendiente'}
                                    </p>
                                </div>
                            </div>
                            <div className="doc-actions">
                                <label className={`btn-upload ${isUploading ? 'disabled' : ''}`}>
                                    {isUploading ? 'Subiendo...' : (status === 'uploaded' ? 'Cambiar' : 'Subir')}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => handleFileChange(type.id, e)}
                                        disabled={isUploading}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        .documents-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .info-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 16px;
            border-radius: 12px;
            color: #0369a1;
            font-size: 0.95rem;
            line-height: 1.5;
        }
        .documents-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .document-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #f9f9f9;
            border-radius: 12px;
            border: 1px solid #eee;
            transition: all 0.2s;
        }
        .document-item:hover {
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-color: #ddd;
        }
        .doc-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .doc-icon {
            font-size: 1.5rem;
        }
        h4 {
            margin: 0 0 4px 0;
            font-size: 1rem;
            color: #111;
            font-weight: 600;
        }
        .status {
            margin: 0;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .status.pending { color: #f59e0b; }
        .status.uploaded { color: #10b981; }
        
        .doc-link {
            color: #10b981;
            text-decoration: underline;
        }
        .doc-link:hover {
            color: #059669;
        }

        .btn-upload {
            padding: 8px 16px;
            background: #111;
            color: white;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            display: inline-block;
        }
        .btn-upload:hover {
            background: #333;
        }
        .btn-upload.disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        @media (max-width: 600px) {
            .document-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
            .doc-actions {
                width: 100%;
            }
            .btn-upload {
                width: 100%;
                text-align: center;
            }
        }
      `}</style>
        </div>
    );
}
