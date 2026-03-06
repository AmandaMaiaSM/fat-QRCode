import React from 'react';
import './styles.css';

interface ModalSucessoEventoProps {
  isOpen: boolean;
  onClose: () => void;
  onVerTicket: () => void;
}

const ModalSucessoEvento = ({ isOpen, onClose, onVerTicket }: ModalSucessoEventoProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container success-modal">
        <div className="success-icon"></div>
        <h2>Evento Criado!</h2>
        <p>O evento foi salvo com sucesso e o QR Code de check-in já está disponível.</p>
        
        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Criar outro
          </button>
          <button className="btn-confirmar" onClick={onVerTicket}>
            Ver Ticket & QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSucessoEvento;