'use client';

import { useState } from 'react';

export default function UserDocuments({ user }) {
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Cédula de Ciudadanía', status: 'pending', file: null },
        { id: 2, name: 'Certificado Laboral', status: 'pending', file: null },
        { id: 3, name: 'Extractos Bancarios', status: 'uploaded', file: 'extractos_oct.pdf' },
    ]);

    const handleFileChange = (docId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Formato no válido. Por favor sube archivos PDF, Word o Imágenes (JPG, PNG).');
            e.target.value = ''; // Reset input
            return;
        }

        // Simulate upload
        setUploading(true);
        setTimeout(() => {
            setDocuments(prev => prev.map(doc =>
                doc.id === docId ? { ...doc, status: 'uploaded', file: file.name } : doc
            ));
            setUploading(false);
            alert(`Documento "${file.name}" subido correctamente (Simulación)`);
        }, 1500);
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
                {documents.map(doc => (
                    <div key={doc.id} className="document-item">
                        <div className="doc-info">
                            <span className="doc-icon">{doc.status === 'uploaded' ? '✅' : '📄'}</span>
                            <div>
                                <h4>{doc.name}</h4>
                                <p className={`status ${doc.status}`}>
                                    {doc.status === 'uploaded' ? `Subido: ${doc.file}` : 'Pendiente'}
                                </p>
                            </div>
                        </div>
                        <div className="doc-actions">
                            <label className={`btn-upload ${uploading ? 'disabled' : ''}`}>
                                {uploading ? 'Subiendo...' : (doc.status === 'uploaded' ? 'Cambiar' : 'Subir')}
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => handleFileChange(doc.id, e)}
                                    disabled={uploading}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                            </label>
                        </div>
                    </div>
                ))}
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
