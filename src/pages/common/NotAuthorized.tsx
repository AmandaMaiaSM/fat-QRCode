import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotAuthorized: React.FC = () => {


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
            <h1 style={{ fontSize: '48px', color: '#d32f2f', marginBottom: '16px' }}>403</h1>
            <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '8px' }}>Não Autorizado</h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px', textAlign: 'center' }}>
                Você não tem permissão para acessar esta página.
            </p>
        </div>
    );
};