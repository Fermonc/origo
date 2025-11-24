'use client';

import { useState } from 'react';

export default function UserDocuments({ user }) {
    background: #f5f5f5;
    border - radius: 10px;
    display: flex;
    align - items: center;
    justify - content: center;
    font - size: 1.2rem;
}
                h4 { margin: 0 0 4px 0; font - size: 1rem; }
                
                .status - badge {
    font - size: 0.8rem;
    padding: 2px 8px;
    border - radius: 12px;
    font - weight: 600;
}
                .status - badge.pending { background: #fff3cd; color: #856404; }
                .status - badge.uploaded { background: #d4edda; color: #155724; }

                .btn - upload {
    padding: 10px 20px;
    background: #111;
    color: white;
    border: none;
    border - radius: 10px;
    font - weight: 600;
    cursor: pointer;
    font - size: 0.9rem;
}
                .btn - upload:hover { background: #333; }
                
                .btn - view {
    background: white;
    border: 1px solid #ddd;
    color: #333;
}
                .btn - view:hover { background: #f0f0f0; }

@media(max - width: 600px) {
                    .doc - item { flex - direction: column; align - items: flex - start; gap: 16px; }
                    .btn - upload { width: 100 %; }
}
`}</style>
        </div>
    );
}
