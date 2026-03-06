import './styles.css';

interface DadosEdicao {
  nome: string;
  data: string;
}

interface ModalEditarEventoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  dadosEdicao: DadosEdicao;
  setDadosEdicao: React.Dispatch<React.SetStateAction<DadosEdicao>>;
}

export default function ModalEditarEvento({
  isOpen,
  onClose,
  onSave,
  dadosEdicao,
  setDadosEdicao
}: ModalEditarEventoProps) {

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">

        <h2>Editar Evento</h2>

        <div className="form-group">
          <label>Nome do Evento:</label>
          <input
            type="text"
            value={dadosEdicao.nome}
            onChange={(e) =>
              setDadosEdicao({
                ...dadosEdicao,
                nome: e.target.value
              })
            }
          />
        </div>

        <div className="form-group">
          <label>Data do Evento:</label>
          <input
            type="date"
            value={dadosEdicao.data}
            onChange={(e) =>
              setDadosEdicao({
                ...dadosEdicao,
                data: e.target.value
              })
            }
          />
        </div>

       <div className="modal-buttons">

            <button
                className="btn-actionCancelar"
                onClick={onClose}
            >
                Cancelar
            </button>

            <button
                className="btn-actionSalvar"
                onClick={onSave}
            >
                Salvar Alterações
            </button>

            </div>

        </div>
    </div>
  );
}