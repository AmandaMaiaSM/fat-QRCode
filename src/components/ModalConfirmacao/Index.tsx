import React from 'react';
import './styles.css';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mensagem?: string;
}

const ModalConfirmacao = ({ isOpen, onClose, onConfirm, mensagem }: ModalConfirmacaoProps) => {
  if (!isOpen) return null; 

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>Confirmação</h3>
        <p>{mensagem || "Tem certeza que deseja realizar esta ação?"}</p>
        
        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-confirmar" onClick={onConfirm}>
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacao;