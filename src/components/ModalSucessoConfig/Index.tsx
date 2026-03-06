import React from 'react';
import './styles.css';

interface ModalSucessoConfigProps {
  isOpen: boolean;
  onClose: () => void;
  mensagem: string;
}

const ModalSucessoConfig = ({ isOpen, onClose, mensagem }: ModalSucessoConfigProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container success-modal">
        <div className="success-icon"></div>
        <h2>Sucesso!</h2>
        <p>{mensagem}</p>
        <div className="modal-buttons">
          <button className="btn-confirmar" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSucessoConfig;