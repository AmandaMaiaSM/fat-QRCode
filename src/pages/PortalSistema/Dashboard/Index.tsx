import { useNavigate } from "react-router-dom";
import './Styles.css';

export default function Dashboard() {
const navigate = useNavigate();
  
  // Dados fictícios para visualizar o layout (depois virão do Backend)
  const eventosRecentes = [
    { id: 1, nome: "Treinamento Sefaz - Módulo 1", data: "28/01/2024", status: "Ativo" },
    { id: 2, nome: "Workshop de Integração", data: "05/02/2024", status: "Agendado" },
    { id: 3, nome: "Palestra: Segurança de Dados", data: "12/02/2024", status: "Concluído" },
  ];

  return (
    <div className="dashboard-container">
      

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="main-content">
        
        {/* Topo */}
        <header className="top-bar">
          <div className="user-info">
            <h1>Olá, Administrador</h1>
            <p>Bem-vindo de volta ao painel de controle.</p>
          </div>
          <div className="user-avatar">
            <span>AD</span> {/* Iniciais do usuário */}
          </div>
        </header>

        {/* Cards de Resumo */}
        <section className="stats-grid">
          <div className="card-stat">
            <h3>Eventos Ativos</h3>
            <p className="stat-number">3</p>
          </div>
          <div className="card-stat">
            <h3>Total Participantes</h3>
            <p className="stat-number">128</p>
          </div>
          <div className="card-stat highlight">
            <h3>Próximo Evento</h3>
            <p className="stat-text">Treinamento Sefaz</p>
            <small>Hoje, 14:00</small>
          </div>
        </section>

        {/* Lista de Eventos */}
        <section className="recent-events">
          <div className="section-header">
            <h2>Eventos Recentes</h2>
            <button className="btn-link" onClick={() => navigate("/sistemaQR/meus-eventos")}>Ver todos</button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome do Evento</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {eventosRecentes.map((evento) => (
                  <tr key={evento.id}>
                    <td>{evento.nome}</td>
                    <td>{evento.data}</td>
                    <td>
                      <span className={`status-badge ${evento.status.toLowerCase()}`}>
                        {evento.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action">Detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}