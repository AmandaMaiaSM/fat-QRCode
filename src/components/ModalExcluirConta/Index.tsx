import './styles.css';

interface ModalExcluirContaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalExcluirConta = ({ isOpen, onClose, onConfirm }: ModalExcluirContaProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container danger">
        <div className="modal-header-simple">
          <h2>Excluir Conta</h2>
        </div>
        
        <div className="modal-body-simple">
          <p>Esta ação é <strong>irreversível</strong>. Todos os seus dados e eventos serão apagados. Tem certeza?</p>
        </div>

        <div className="modal-buttons">
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="btn-confirmar-delete" onClick={onConfirm}>Sim, Excluir</button>
        </div>
      </div>
    </div>
  );
};

export default ModalExcluirConta;