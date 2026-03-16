import { useState, type ChangeEvent, type FormEvent } from "react";
import "./Styles.css";

type Participante = {
  nome: string;
  email: string;
  telefone: string;
  camposExtras: Record<string, string>;
};

const criarParticipanteVazio = (camposAdicionais: string[]): Participante => ({
  nome: "",
  email: "",
  telefone: "",
  camposExtras: Object.fromEntries(camposAdicionais.map((c) => [c, ""])),
});

export default function RegistrarPresencas() {
  const [camposAdicionais, setCamposAdicionais] = useState<string[]>([]);
  const [novoCampo, setNovoCampo] = useState("");

  const [participantes, setParticipantes] = useState<Participante[]>([
    criarParticipanteVazio([]),
  ]);

  // Função para adicionar um novo participante
  const adicionarParticipante = () => {
    setParticipantes((prev) => [...prev, criarParticipanteVazio(camposAdicionais)]);
  };

  // Função para remover um participante
  const removerParticipante = (index: number) => {
    if (participantes.length > 1) {
      const novaLista = [...participantes];
      novaLista.splice(index, 1);
      setParticipantes(novaLista);
    }
  };

  const handleInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const key = name as "nome" | "email" | "telefone";

    setParticipantes((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [key]: value };
      return copia;
    });
  };

  const handleCampoAdicionalChange = (
    index: number,
    campo: string,
    value: string,
  ) => {
    setParticipantes((prev) => {
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        camposExtras: { ...copia[index].camposExtras, [campo]: value },
      };
      return copia;
    });
  };

  const handleAdicionarCampo = () => {
    const campo = novoCampo.trim();
    if (!campo) return;

    if (camposAdicionais.some((c) => c.toLowerCase() === campo.toLowerCase())) {
      return;
    }

    setCamposAdicionais((prev) => [...prev, campo]);
    setParticipantes((prev) =>
      prev.map((p) => ({
        ...p,
        camposExtras: { ...p.camposExtras, [campo]: "" },
      })),
    );
    setNovoCampo("");
  };

  const handleRemoverCampo = (campo: string) => {
    setCamposAdicionais((prev) => prev.filter((c) => c !== campo));
    setParticipantes((prev) =>
      prev.map((p) => {
        const { [campo]: _removido, ...resto } = p.camposExtras;
        return { ...p, camposExtras: resto };
      }),
    );
  };

  const handleSubmit = (eventos: FormEvent<HTMLFormElement>) => {
    eventos.preventDefault();
    console.log("Dados dos participantes:", participantes);
    alert("Presenças registradas com sucesso!");
  };

  return (
    <div className="registrar-presencas-container">
      <main className="registrar-presencas-main">
        <header className="page-header">
          <h1>Registrar Presenças</h1>
          <p>Registre as presenças manualmente abaixo.</p>
        </header>

        <section className="form-section">
          <form className="registrar-presenca-form" onSubmit={handleSubmit}>
            {/* ...existing code... */}
            <div className="event-info">
              <h2>Informações do Evento</h2>
              <label htmlFor="evento">Nome do Evento:</label>
              <input type="text" id="evento" name="evento" placeholder="Nome do evento" required />

              <div className="form-row">
                <div>
                  <label htmlFor="data">Data:</label>
                  <input type="date" id="data" name="data" required />
                </div>
                <div>
                  <label htmlFor="hora">Hora:</label>
                  <input type="time" id="hora" name="hora" required />
                </div>
              </div>
            </div>

            {/* NOVO: campos adicionais */}
            <div className="event-info">
              <h2>Campos adicionais</h2>
              <div className="form-row">
                <div>
                  <label htmlFor="novoCampo">Nome do campo:</label>
                  <input
                    id="novoCampo"
                    type="text"
                    value={novoCampo}
                    onChange={(e) => setNovoCampo(e.target.value)}
                    placeholder="Ex.: Matrícula, CPF, Setor"
                  />
                </div>
                <div>
                  <label>&nbsp;</label>
                  <button type="button" className="btn-add" onClick={handleAdicionarCampo}>
                    Adicionar campo
                  </button>
                </div>
              </div>

              {camposAdicionais.length > 0 && (
                <div className="campos-tags">
                  {camposAdicionais.map((campo) => (
                    <span key={campo} className="campo-tag">
                      {campo}
                      <button type="button" onClick={() => handleRemoverCampo(campo)}>
                        ✖
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {participantes.map((participante, index) => (
              <div key={index} className="participante-card">
                <div className="participante-header">
                  <h2>Participante {index + 1}</h2>
                  {participantes.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removerParticipante(index)}
                      title="Remover este participante"
                    >
                      ✖
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <label>Nome Completo:</label>
                  <input
                    type="text"
                    name="nome"
                    value={participante.nome}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="Digite o nome"
                    required
                  />

                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={participante.email}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="exemplo@email.com"
                    required
                  />

                  <label>Telefone:</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={participante.telefone}
                    onChange={(e) => handleInputChange(index, e)}
                    placeholder="(00) 00000-0000"
                    required
                  />

                  {/* NOVO: inputs dinâmicos */}
                  {camposAdicionais.map((campo) => (
                    <div key={`${index}-${campo}`}>
                      <label>{campo}:</label>
                      <input
                        type="text"
                        value={participante.camposExtras[campo] ?? ""}
                        onChange={(e) =>
                          handleCampoAdicionalChange(index, campo, e.target.value)
                        }
                        placeholder={`Digite ${campo}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ...existing code... */}
            <div className="form-actions">
              <button type="button" className="btn-add" onClick={adicionarParticipante}>
                Adicionar Participante
              </button>

              <button type="submit" className="btn-save">
                Salvar Lista de Presença
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}