import { useState } from "react";
import './Styles.css';


export default function RegistrarPresencas() {
    const [participantes, setParticipantes] = useState([
    { 
        nome: "", 
        email: "", 
        telefone: "" }
    ]);

    // Função para adicionar um novo participante
    const adicionarParticipante = () => {
        setParticipantes([...participantes, { 
            nome: "", 
            email: "", 
            telefone: "" 
        }]);
    }
    // Função para remover um participante
    const removerParticipante = (index: number) => {
        // Só remove se houver mais de um participante
        if (participantes.length > 1) {
            const novaLista = [...participantes];
            novaLista.splice(index, 1);
            setParticipantes(novaLista);
        }
    };

    const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const {name,value} = event.target;
        const novosParticipantes = [...participantes];
        novosParticipantes[index][name as keyof typeof participantes[0]] = value;
        setParticipantes(novosParticipantes);
    };
    const handleSubmit = (eventos: React.FormEvent<HTMLFormElement>) => {
        eventos.preventDefault();
        console.log("Dados dos participantes:", participantes );
        alert("Presenças registradas com sucesso!");
    }

 return (
    <div className="registrar-presencas-container">

      <main className="registrar-presencas-main">
        <header className="page-header">
          <h1>Registrar Presenças</h1>
          <p>Registre as presenças manualmente abaixo.</p>
        </header>

        <section className="form-section">
          <form className="registrar-presenca-form" onSubmit={handleSubmit}>
            
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
                </div>
              </div>
            ))}

            {/* Container de Botões Inferiores */}
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