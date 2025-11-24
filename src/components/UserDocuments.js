'use client';

import { useState } from 'react';

export default function UserDocuments({ user }) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = (type) => {
        setUploading(true);
        // Mock upload simulation
        setTimeout(() => {
            setUploading(false);
            alert(`Documento "${type}" subido correctamente (Simulación)`);
        }, 1500);
    };

    const documents = [
        { id: 'id_card', label: 'Cédula de Ciudadanía / Pasaporte', status: 'pending' },
        { id: 'bank_extract', label: 'Extractos Bancarios (Últimos 3 meses)', status: 'pending' },
        { id: 'income_cert', label: 'Certificado Laboral / Ingresos', status: 'uploaded' },
    ];

    return (
        <div className="documents-section">
            <div className="docs-header">
                <h3>Documentación Requerida</h3>
                <p>Sube estos documentos para agilizar el proceso de compra o arriendo.</p>
            </div>

            <div className="docs-list">
                {documents.map(doc => (
                    <div key={doc.id} className="doc-item">
                        <div className="doc-info">
                            <div className="doc-icon">📄</div>
                            <div>
                                <h4>{doc.label}</h4>
                                <span className={`status-badge ${doc.status}`}>
                                    {doc.status === 'uploaded' ? 'Subido' : 'Pendiente'}
                                </span>
                            </div>
                        </div>
                        <button
                            className={`btn-upload ${doc.status === 'uploaded' ? 'btn-view' : ''}`}
                            onClick={() => handleUpload(doc.label)}
                            disabled={uploading}
                        >
                            {doc.status === 'uploaded' ? 'Ver / Actualizar' : 'Subir Archivo'}
                        </button>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .documents-section {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }
                .docs-header { margin-bottom: 32px; }
                .docs-header h3 { margin: 0 0 8px 0; font-size: 1.25rem; }
                .docs-header p { color: #666; margin: 0; }

                .docs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .doc-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border: 1px solid #f0f0f0;
                    border-radius: 16px;
                    transition: all 0.2s;
                }
                .doc-item:hover {
                    border-color: #e0e0e0;
                    background: #fafafa;
                }
                .doc-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .doc-icon {
                    width: 40px;
                    height: 40px;
                    background: #f5f5f5;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                }
                h4 { margin: 0 0 4px 0; font-size: 1rem; }
                
                .status-badge {
                    font-size: 0.8rem;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                }
                .status-badge.pending { background: #fff3cd; color: #856404; }
                .status-badge.uploaded { background: #d4edda; color: #155724; }

                .btn-upload {
                    padding: 10px 20px;
                    background: #111;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                .btn-upload:hover { background: #333; }
                
                .btn-view {
                    background: white;
                    border: 1px solid #ddd;
                    color: #333;
                }
                .btn-view:hover { background: #f0f0f0; }

                @media (max-width: 600px) {
                    .doc-item { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .btn-upload { width: 100%; }
                }
            `}</style>
        </div>
    );
}
