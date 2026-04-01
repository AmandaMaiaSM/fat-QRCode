import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { apiService, type Evento } from "../../../services/api";
import { formatarData, formatarHora } from "../../../services/data";
import "./Styles.css";

function getInicioDaSemana(dataBase: Date) {
  const data = new Date(dataBase);
  const diaDaSemana = data.getDay();
  const diferencaParaSegunda = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;

  data.setDate(data.getDate() + diferencaParaSegunda);
  data.setHours(0, 0, 0, 0);

  return data;
}

function getFimDaSemana(dataBase: Date) {
  const data = getInicioDaSemana(dataBase);

  data.setDate(data.getDate() + 6);
  data.setHours(23, 59, 59, 999);

  return data;
}

function getEventoId(evento: Evento) {
  return String(evento._id || evento.id || crypto.randomUUID());
}

export default function Dashboard() {
  const navigate = useNavigate();
  const agora = useMemo(() => new Date(), []);

  const inicioDaSemana = useMemo(() => getInicioDaSemana(new Date()), []);
  const fimDaSemana = useMemo(() => getFimDaSemana(new Date()), []);

  const {
    data: eventos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard-eventos-semana"],
    queryFn: () => apiService.listarEventos(),
  });

  const eventosDaSemana = useMemo(
    () =>
      eventos
        .filter((evento) => {
          const dataEvento = new Date(evento.data);

          if (Number.isNaN(dataEvento.getTime())) {
            return false;
          }

          return dataEvento >= inicioDaSemana && dataEvento <= fimDaSemana;
        })
        .sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
        ),
    [eventos, fimDaSemana, inicioDaSemana],
  );

  const eventosDaSemanaOrdenados = useMemo(
    () =>
      [...eventosDaSemana].sort((a, b) => {
        const dataA = new Date(a.data).getTime();
        const dataB = new Date(b.data).getTime();

        return dataA - dataB;
      }),
    [eventosDaSemana],
  );

  const totalParticipantes = useMemo(
    () =>
      eventosDaSemana.reduce(
        (total, evento) => total + (evento.participantes?.length || 0),
        0,
      ),
    [eventosDaSemana],
  );

  const proximoEvento = useMemo(
    () =>
      eventosDaSemanaOrdenados.find((evento) => {
        const dataEvento = new Date(evento.data);

        if (Number.isNaN(dataEvento.getTime())) {
          return false;
        }

        return dataEvento >= agora;
      }) || null,
    [agora, eventosDaSemanaOrdenados],
  );

  return (
    <div className="dashboard-container dashboard-page">
      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="main-content dashboard-main">
        {/* Topo */}
        <header className="top-bar">
          <div className="user-info">
            <h1>Olá, Administrador</h1>
            <p className="user-info-subtitle">
              Bem-vindo de volta ao painel de controle.
            </p>
            <p className="user-info-location">Centro de treinamento SEFAZ-MA</p>
          </div>
          <div className="user-avatar">
            <span>AD</span>
          </div>
        </header>

        {/* Cards de Resumo */}
        <section className="stats-grid">
          <div className="card-stat">
            <h3>Eventos da semana</h3>
            <p className="stat-number">{eventosDaSemana.length}</p>
          </div>
          <div className="card-stat">
            <h3>Total Participantes</h3>
            <p className="stat-number">{totalParticipantes}</p>
          </div>
          <div className="card-stat highlight">
            <h3>Próximo Evento</h3>
            {proximoEvento ? (
              <>
                <p className="stat-text">{proximoEvento.nome}</p>
                <small>{formatarData(proximoEvento.data)}</small>
              </>
            ) : (
              <>
                <p className="stat-text">Nenhum evento nesta semana</p>
                <small>Atualize os filtros ou cadastre um novo evento.</small>
              </>
            )}
          </div>
        </section>

        <section className="recent-events">
          <div className="section-header">
            <h2>Eventos da Semana</h2>
            <button
              className="btn-link"
              onClick={() => navigate("/sistemaQR/meus-eventos")}
            >
              Ver todos
            </button>
          </div>

          {isLoading && (
            <div className="dashboard-feedback">Carregando eventos...</div>
          )}

          {isError && (
            <div className="dashboard-feedback error">
              {error instanceof Error
                ? error.message
                : "Nao foi possivel carregar os eventos."}
            </div>
          )}

          {!isLoading && !isError && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome do Evento</th>
                    <th>Data</th>
                    <th>Ações</th>
                    <th>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosDaSemana.length > 0 ? (
                    eventosDaSemana.map((evento) => (
                      <tr key={getEventoId(evento)}>
                        <td>{evento.nome}</td>
                        <td>{formatarData(evento.data)}</td>
                        <td>
                          <button
                            type="button"
                            className="dashboard-details-btn"
                            onClick={() =>
                              navigate(
                                `/sistemaQR/evento/${getEventoId(evento)}`,
                              )
                            }
                          >
                            Detalhes
                          </button>
                        </td>
                        <td>{formatarHora(evento.data)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        Nenhum evento encontrado nesta semana.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
