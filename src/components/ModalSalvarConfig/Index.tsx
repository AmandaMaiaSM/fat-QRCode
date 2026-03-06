import './styles.css';

const ModalSalvarConfig = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  if (!isOpen) return null;

  return (
        <div className="modal-overlay">
        <div className="modal-container">
            <div className="save-icon"></div>
            <h3>Salvar Alterações?</h3>
            <p>Você tem certeza que deseja atualizar suas informações de perfil?</p>
            
            <div className="modal-buttons">
            <button className="btn-cancelar" onClick={onClose}>
                Revisar
            </button>
            <button className="btn-confirmar-save" onClick={onConfirm}>
                Sim, Salvar
            </button>
            </div>
        </div>
        </div>
    );
};
export default ModalSalvarConfig;