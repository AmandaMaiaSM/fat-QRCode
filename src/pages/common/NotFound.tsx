import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {


    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 16px 0' }}>404</h1>
            <p style={{ fontSize: '20px', color: '#666', margin: '0 0 24px 0' }}>Página não encontrada</p>
        </div>
    );
}