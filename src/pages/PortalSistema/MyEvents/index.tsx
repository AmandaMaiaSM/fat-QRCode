import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import CardEvento from "../../../components/CardEvento";
import ModalConfirmacao from "../../../components/ModalConfirmacao/Index";
import ModalCriarEvento from "../../../components/ModalCriarEvento/Index";
import { apiService, type Evento as EventoApi } from "../../../services/api";
import "./style.css";

function getEventoId(evento: EventoApi) {
  return String(evento._id || evento.id || crypto.randomUUID());
}

function getQuantidadeParticipantes(evento: EventoApi) {
  return evento.participantes?.length || 0;
}

function formatarDataHora(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export default function MeusEventosNovo() {
  const [isCriarEventoOpen, setIsCriarEventoOpen] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<EventoApi | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: eventos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["eventos"],
    queryFn: apiService.listarEventos,
  });

  const handleEventoCriado = async (_eventoCriado: EventoApi) => {
    await queryClient.invalidateQueries({
      queryKey: ["eventos"],
    });
  };

  const excluirEventoMutation = useMutation({
    mutationFn: ({ eventoId, token }: { eventoId: string; token: string }) =>
      apiService.excluirEvento(eventoId, token),
    onSuccess: async () => {
      setEventoParaExcluir(null);
      await queryClient.invalidateQueries({
        queryKey: ["eventos"],
      });
    },
  });

  const handleAbrirExclusao = (evento: EventoApi) => {
    setEventoParaExcluir(evento);
  };

  const handleConfirmarExclusao = async () => {
    if (!eventoParaExcluir) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    await excluirEventoMutation.mutateAsync({
      eventoId: getEventoId(eventoParaExcluir),
      token,
    });
  };

  return (
    <div className="my-events-page">
      <header className="my-events-header">
        <div>
          <h1>Meus Eventos</h1>
          <p>Visualize e acompanhe os eventos cadastrados em formato de cards.</p>
        </div>
        <button
          type="button"
          className="my-events-create-btn"
          onClick={() => setIsCriarEventoOpen(true)}
        >
          Criar evento
        </button>
      </header>

      {isLoading && (
        <div className="my-events-feedback">Carregando eventos...</div>
      )}

      {isError && (
        <div className="my-events-feedback error">
          {error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os eventos."}
        </div>
      )}

      {!isLoading && !isError && (
        <section className="my-events-grid">
          {eventos.map((evento) => (
            <CardEvento
              key={getEventoId(evento)}
              nome={evento.nome}
              data={formatarDataHora(evento.data)}
              local={evento.local || "Local nao informado"}
              descricao={evento.descricao}
              quantidadeParticipantes={getQuantidadeParticipantes(evento)}
              actions={
                <>
                  <button
                    type="button"
                    className="my-events-action primary"
                    onClick={() => navigate(`/sistemaQR/evento/${getEventoId(evento)}`)}
                  >
                    Ver detalhes
                  </button>
                  <button
                    type="button"
                    className="my-events-action danger"
                    onClick={() => handleAbrirExclusao(evento)}
                  >
                    Apagar
                  </button>
                </>
              }
            />
          ))}

          {eventos.length === 0 && (
            <div className="my-events-feedback">
              Nenhum evento encontrado.
            </div>
          )}
        </section>
      )}

      <ModalCriarEvento
        isOpen={isCriarEventoOpen}
        onClose={() => setIsCriarEventoOpen(false)}
        onSuccess={handleEventoCriado}
      />

      <ModalConfirmacao
        isOpen={Boolean(eventoParaExcluir)}
        onClose={() => setEventoParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
        mensagem={
          eventoParaExcluir
            ? `Tem certeza que deseja excluir o evento "${eventoParaExcluir.nome}"?`
            : "Tem certeza que deseja excluir este evento?"
        }
      />
    </div>
  );
}
