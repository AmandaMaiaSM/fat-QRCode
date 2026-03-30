import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

import { apiService, type EventoParticipante } from "../../../services/api";
import ModalEditarEvento from "../../../components/ModalEditarEvento/Index";
import ModalEditarParticipante from "../../../components/ModalEditarParticipante/Index";
import "./style.css";

const participanteColumnHelper = createColumnHelper<EventoParticipante>();

function formatarData(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

function formatarHora(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export default function EventoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copiado, setCopiado] = useState(false);
  const [isEditarEventoOpen, setIsEditarEventoOpen] = useState(false);
  const [participanteParaEditar, setParticipanteParaEditar] =
    useState<EventoParticipante | null>(null);
  const qrCodeRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: evento,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["evento", id],
    queryFn: () => apiService.obterEventoPorId(id as string),
    enabled: Boolean(id),
  });

  const checkinUrl = id
    ? `${window.location.origin}/checkin/${id}`
    : "";

  const handleCopiarLink = async () => {
    if (!checkinUrl) return;

    await navigator.clipboard.writeText(checkinUrl);
    setCopiado(true);

    window.setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  const handleBaixarQrCode = async () => {
    if (!qrCodeRef.current || !checkinUrl) return;

    const dataUrl = await toPng(qrCodeRef.current, {
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `qrcode-evento-${id || "checkin"}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleEventoEditado = async () => {
    setIsEditarEventoOpen(false);
    await queryClient.invalidateQueries({
      queryKey: ["evento", id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["eventos"],
    });
  };

  const handleParticipanteEditado = async () => {
    setParticipanteParaEditar(null);
    await queryClient.invalidateQueries({
      queryKey: ["evento", id],
    });
  };

  const participanteColumns = evento
    ? [
        participanteColumnHelper.accessor("nome", {
          id: "nome",
          header: "Nome",
          cell: (info) => info.getValue(),
        }),
        participanteColumnHelper.accessor("email", {
          id: "email",
          header: "E-mail",
          cell: (info) => info.getValue(),
        }),
        ...(evento.camposInscricao || []).map((campo) =>
          participanteColumnHelper.display({
            id: campo.identificador,
            header: campo.rotulo,
            cell: ({ row }) =>
              row.original.camposPersonalizados?.[campo.identificador] || "-",
          }),
        ),
        participanteColumnHelper.display({
          id: "acoes",
          header: "Acoes",
          cell: ({ row }) => (
            <button
              type="button"
              className="evento-table-action"
              onClick={() => setParticipanteParaEditar(row.original)}
            >
              Editar
            </button>
          ),
        }),
      ]
    : [];

  const participantesTable = useReactTable({
    data: evento?.participantes || [],
    columns: participanteColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="evento-page">
      <header className="evento-header">
        <div>
          <h1>Detalhes do Evento</h1>
          <p>Visualize as informacoes completas do evento selecionado.</p>
        </div>
        <button
          type="button"
          className="evento-back-btn"
          onClick={() => navigate("/sistemaQR/meus-eventos")}
        >
          Voltar
        </button>
      </header>

      {isLoading && <div className="evento-feedback">Carregando evento...</div>}

      {isError && (
        <div className="evento-feedback error">
          {error instanceof Error
            ? error.message
            : "Nao foi possivel carregar o evento."}
        </div>
      )}

      {!isLoading && !isError && evento && (
        <section className="evento-card-detalhes">
          <div className="evento-topo">
            <div>
              <p className="evento-label">Evento</p>
              <h2>{evento.nome}</h2>
            </div>
            <span className="evento-badge">
              {evento.participantes?.length || 0} participante
              {(evento.participantes?.length || 0) === 1 ? "" : "s"}
            </span>
          </div>

          <div className="evento-grid">
            <div className="evento-info-box">
              <span>Data</span>
              <strong>{formatarData(evento.data)}</strong>
            </div>
            <div className="evento-info-box">
              <span>Horario</span>
              <strong>{formatarHora(evento.data)}</strong>
            </div>
            <div className="evento-info-box">
              <span>Local</span>
              <strong>{evento.local || "Local nao informado"}</strong>
            </div>
          </div>

          <div className="evento-section">
            <div className="evento-section-header">
              <h3>Informacoes do evento</h3>
              <button
                type="button"
                className="evento-edit-btn"
                onClick={() => setIsEditarEventoOpen(true)}
              >
                Editar evento
              </button>
            </div>
          </div>

          <div className="evento-section">
            <h3>Descricao</h3>
            <p>{evento.descricao || "Sem descricao cadastrada."}</p>
          </div>

          <div className="evento-section">
            <h3>Campos de inscricao</h3>
            {evento.camposInscricao && evento.camposInscricao.length > 0 ? (
              <div className="evento-campos-list">
                <div className="evento-campo-item evento-campo-item-obrigatorio">
                  <strong>Nome</strong>
                  <span>obrigatorio</span>
                </div>
                <div className="evento-campo-item evento-campo-item-obrigatorio">
                  <strong>E-mail</strong>
                  <span>obrigatorio</span>
                </div>
                {evento.camposInscricao.map((campo) => (
                  <div
                    key={`${campo.identificador}-${campo.rotulo}`}
                    className="evento-campo-item"
                  >
                    <strong>{campo.rotulo}</strong>
                    <span>{campo.identificador}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="evento-campos-list">
                <div className="evento-campo-item evento-campo-item-obrigatorio">
                  <strong>Nome</strong>
                  <span>obrigatorio</span>
                </div>
                <div className="evento-campo-item evento-campo-item-obrigatorio">
                  <strong>E-mail</strong>
                  <span>obrigatorio</span>
                </div>
              </div>
            )}
          </div>

          <div className="evento-section">
            <h3>Link de check-in</h3>
            <div className="evento-link-box">
              <div>
                <span className="evento-link-label">Link publico</span>
                <strong className="evento-link-url">{checkinUrl}</strong>
              </div>
              <button
                type="button"
                className="evento-copy-btn"
                onClick={handleCopiarLink}
              >
                {copiado ? "Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>

          <div className="evento-section">
            <h3>QR Code do check-in</h3>
            <div className="evento-qr-box">
              <div className="evento-qr-preview" ref={qrCodeRef}>
                <div className="evento-qr-card">
                  <QRCode value={checkinUrl} size={180} level="H" />
                </div>
              </div>
              <button
                type="button"
                className="evento-copy-btn"
                onClick={handleBaixarQrCode}
              >
                Baixar QR Code
              </button>
            </div>
          </div>

          <div className="evento-section">
            <h3>Participantes</h3>
            {evento.participantes && evento.participantes.length > 0 ? (
              <div className="evento-participantes-table-wrapper">
                <table className="evento-participantes-table">
                  <thead>
                    {participantesTable.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody>
                    {participantesTable.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            data-label={String(cell.column.columnDef.header)}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhum participante cadastrado neste evento.</p>
            )}
          </div>
        </section>
      )}

      <ModalEditarEvento
        isOpen={isEditarEventoOpen}
        evento={evento || null}
        onClose={() => setIsEditarEventoOpen(false)}
        onSuccess={handleEventoEditado}
      />

      <ModalEditarParticipante
        isOpen={Boolean(participanteParaEditar && id)}
        eventoId={id || ""}
        participante={participanteParaEditar}
        camposInscricao={evento?.camposInscricao || []}
        onClose={() => setParticipanteParaEditar(null)}
        onSuccess={handleParticipanteEditado}
      />
    </div>
  );
}
