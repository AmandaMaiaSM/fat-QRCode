import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

import { apiService, type EventoParticipante } from "../../../services/api";
import ModalEditarEvento from "../../../components/ModalEditarEvento/Index";
import ModalEditarParticipante from "../../../components/ModalEditarParticipante/Index";
import ModalCadastrarParticipante from "../../../components/ModalCadastrarParticipante/Index";
import ModalImportarParticipantes from "../../../components/ModalImportarParticipantes/Index";
import ModalConfirmacao from "../../../components/ModalConfirmacao/Index";
import { formatarData, formatarHora } from "../../../services/data";
import {
  baixarTemplateParticipantes,
  baixarParticipantesDoEventoEmExcel,
  lerParticipantesDeExcel,
} from "../../../services/excel";
import "./style.css";

const participanteColumnHelper = createColumnHelper<EventoParticipante>();

async function copiarTexto(texto: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Continua para o fallback abaixo.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = texto;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

export default function EventoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copiado, setCopiado] = useState(false);
  const [isEditarEventoOpen, setIsEditarEventoOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCadastrarParticipanteOpen, setIsCadastrarParticipanteOpen] =
    useState(false);
  const [participanteParaEditar, setParticipanteParaEditar] =
    useState<EventoParticipante | null>(null);
  const [participanteParaRemover, setParticipanteParaRemover] =
    useState<EventoParticipante | null>(null);
  const [importacaoMensagem, setImportacaoMensagem] = useState<string | null>(
    null,
  );
  const [participantesImportacao, setParticipantesImportacao] = useState<
    Array<{
      nome: string;
      email: string;
      camposPersonalizados: Record<string, string>;
    }>
  >([]);
  const qrCodeRef = useRef<HTMLDivElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
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

  const checkinUrl = id ? `${window.location.origin}/checkin/${id}` : "";

  const importarParticipantesMutation = useMutation({
    mutationFn: async (
      participantesSelecionados: Array<{
        nome: string;
        email: string;
        camposPersonalizados: Record<string, string>;
      }>,
    ) => {
      if (!id) {
        throw new Error("Evento nao encontrado para importar participantes.");
      }

      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error(
          "Voce precisa estar autenticado para importar participantes.",
        );
      }

      if (participantesSelecionados.length === 0) {
        throw new Error("Selecione ao menos um participante para importar.");
      }

      return apiService.adicionarVariosParticipantes(
        id,
        participantesSelecionados,
        token,
      );
    },
    onSuccess: async (_, participantesSelecionados) => {
      setImportacaoMensagem(
        `Importacao concluida com sucesso para ${participantesSelecionados.length} participante${participantesSelecionados.length === 1 ? "" : "s"}.`,
      );
      setIsImportModalOpen(false);
      setParticipantesImportacao([]);
      await queryClient.invalidateQueries({
        queryKey: ["evento", id],
      });
    },
    onError: (mutationError) => {
      setImportacaoMensagem(
        mutationError instanceof Error
          ? mutationError.message
          : "Nao foi possivel importar os participantes.",
      );
    },
  });

  const excluirParticipanteMutation = useMutation({
    mutationFn: async (participanteId: string) => {
      if (!id) {
        throw new Error("Evento nao encontrado para remover participante.");
      }

      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error(
          "Voce precisa estar autenticado para remover participantes.",
        );
      }

      return apiService.excluirParticipante(id, participanteId, token);
    },
    onSuccess: async () => {
      setParticipanteParaRemover(null);
      await queryClient.invalidateQueries({
        queryKey: ["evento", id],
      });
    },
  });

  const exportarParticipantesMutation = useMutation({
    mutationFn: async () => {
      if (!id || !evento) {
        throw new Error("Evento nao encontrado para exportar participantes.");
      }

      const participantes = await apiService.listarParticipantesDoEvento(id);
      baixarParticipantesDoEventoEmExcel(evento, participantes);
      return participantes.length;
    },
    onSuccess: (quantidade) => {
      setImportacaoMensagem(
        `Exportacao concluida com sucesso para ${quantidade} participante${quantidade === 1 ? "" : "s"}.`,
      );
    },
    onError: (mutationError) => {
      setImportacaoMensagem(
        mutationError instanceof Error
          ? mutationError.message
          : "Nao foi possivel exportar os participantes.",
      );
    },
  });

  const handleCopiarLink = async () => {
    if (!checkinUrl) return;

    const copiou = await copiarTexto(checkinUrl);

    if (!copiou) {
      setImportacaoMensagem("Nao foi possivel copiar o link automaticamente.");
      return;
    }

    setImportacaoMensagem(null);
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

  const handleBaixarTemplate = () => {
    if (!evento) return;

    baixarTemplateParticipantes(evento);
  };

  const handleExportarParticipantes = async () => {
    setImportacaoMensagem(null);
    await exportarParticipantesMutation.mutateAsync();
  };

  const handleImportarArquivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImportacaoMensagem(null);

    try {
      if (!evento) {
        throw new Error("Evento nao encontrado para importar participantes.");
      }

      const participantes = await lerParticipantesDeExcel(file, evento);

      if (participantes.length === 0) {
        throw new Error(
          "Nenhum participante valido foi encontrado na planilha.",
        );
      }

      setParticipantesImportacao(participantes);
      setIsImportModalOpen(true);
    } catch (error) {
      setImportacaoMensagem(
        error instanceof Error
          ? error.message
          : "Nao foi possivel ler a planilha selecionada.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleConfirmarImportacao = async (
    participantesSelecionados: Array<{
      nome: string;
      email: string;
      camposPersonalizados: Record<string, string>;
    }>,
  ) => {
    await importarParticipantesMutation.mutateAsync(participantesSelecionados);
  };

  const handleFecharImportacao = () => {
    if (importarParticipantesMutation.isPending) {
      return;
    }

    setIsImportModalOpen(false);
    setParticipantesImportacao([]);
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

  const handleParticipanteCadastrado = async () => {
    setIsCadastrarParticipanteOpen(false);
    setImportacaoMensagem("Participante cadastrado com sucesso.");
    await queryClient.invalidateQueries({
      queryKey: ["evento", id],
    });
  };

  const handleConfirmarRemocaoParticipante = async () => {
    const participanteId = String(
      participanteParaRemover?._id || participanteParaRemover?.id || "",
    );

    if (!participanteId) {
      return;
    }

    await excluirParticipanteMutation.mutateAsync(participanteId);
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
          header: "AÇÕES",
          cell: ({ row }) => (
            <div className="evento-table-actions">
              <button
                type="button"
                className="evento-table-action"
                onClick={() => setParticipanteParaEditar(row.original)}
                aria-label={`Editar participante ${row.original.nome}`}
              >
                <Pencil size={16} aria-hidden="true" />
                <span className="evento-table-action-label">Editar</span>
              </button>
              <button
                type="button"
                className="evento-table-action evento-table-action-danger"
                onClick={() => setParticipanteParaRemover(row.original)}
                aria-label={`Remover participante ${row.original.nome}`}
              >
                <Trash2 size={16} aria-hidden="true" />
                <span className="evento-table-action-label">Remover</span>
              </button>
            </div>
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
          <p>Visualize as informacões completas do evento selecionado.</p>
        </div>
        <button
          type="button"
          className="evento-back-btn"
          onClick={() => navigate("/sistemaQR/meus-eventos")}
        >
          Voltar para eventos
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
              <span>Horário</span>
              <strong>{formatarHora(evento.data)}</strong>
            </div>
            <div className="evento-info-box">
              <span>Local</span>
              <strong>{evento.local || "Local nao informado"}</strong>
            </div>
          </div>

          <div className="evento-section">
            <div className="evento-section-header">
              <h3>Informacões do evento</h3>
              <button
                type="button"
                className="evento-edit-btn"
                onClick={() => setIsEditarEventoOpen(true)}
              >
                Editar informacões
              </button>
            </div>
          </div>

          <div className="evento-section-separator" aria-hidden="true" />

          <div className="evento-section">
            <h3>Descricão</h3>
            <p>{evento.descricao || "Sem descricao cadastrada."}</p>
          </div>

          <div className="evento-section-separator" aria-hidden="true" />

          <div className="evento-section">
            <h3>Campos de inscricão</h3>
            <div className="evento-campos-list">
              <div className="evento-campo-item evento-campo-item-obrigatorio">
                <strong>Nome</strong>
                <span>Obrigatorio</span>
              </div>
              <div className="evento-campo-item evento-campo-item-obrigatorio">
                <strong>E-mail</strong>
                <span>Obrigatorio</span>
              </div>
              {(evento.camposInscricao || []).map((campo) => (
                <div
                  key={`${campo.identificador}-${campo.rotulo}`}
                  className="evento-campo-item"
                >
                  <strong>{campo.rotulo}</strong>
                  <span>{campo.identificador}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="evento-section-separator" aria-hidden="true" />

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
                {copiado ? "Link copiado!" : "Copiar link de check-in"}
              </button>
            </div>
          </div>

          <div className="evento-section-separator" aria-hidden="true" />

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
                Baixar imagem do QR Code
              </button>
            </div>
          </div>

          <div className="evento-section-separator" aria-hidden="true" />

          <div className="evento-section">
            <div className="evento-section-header">
              <h3>Participantes</h3>

              <div className="evento-participantes-actions">
                <button
                  type="button"
                  className="evento-secondary-btn"
                  onClick={() => {
                    setImportacaoMensagem(null);
                    setIsCadastrarParticipanteOpen(true);
                  }}
                >
                  Adicionar participante
                </button>

                <button
                  type="button"
                  className="evento-secondary-btn"
                  onClick={handleBaixarTemplate}
                >
                  Baixar modelo da planilha
                </button>

                <button
                  type="button"
                  className="evento-secondary-btn"
                  onClick={() => importInputRef.current?.click()}
                  disabled={importarParticipantesMutation.isPending}
                >
                  {importarParticipantesMutation.isPending
                    ? "Importando planilha..."
                    : "Importar participantes por planilha"}
                </button>

                <input
                  ref={importInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportarArquivo}
                  hidden
                />

                <button
                  type="button"
                  className="evento-copy-btn"
                  onClick={handleExportarParticipantes}
                  disabled={exportarParticipantesMutation.isPending}
                >
                  {exportarParticipantesMutation.isPending
                    ? "Exportando participantes..."
                    : "Exportar participantes"}
                </button>
              </div>
            </div>

            {importacaoMensagem && (
              <div
                className={`evento-feedback ${importarParticipantesMutation.isError ? "error" : ""}`}
              >
                {importacaoMensagem}
              </div>
            )}

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

      <ModalCadastrarParticipante
        isOpen={Boolean(isCadastrarParticipanteOpen && id)}
        eventoId={id || ""}
        camposInscricao={evento?.camposInscricao || []}
        onClose={() => setIsCadastrarParticipanteOpen(false)}
        onSuccess={handleParticipanteCadastrado}
      />

      <ModalImportarParticipantes
        isOpen={isImportModalOpen}
        participantes={participantesImportacao}
        camposInscricao={evento?.camposInscricao || []}
        errorMessage={isImportModalOpen ? importacaoMensagem : null}
        isSubmitting={importarParticipantesMutation.isPending}
        onClose={handleFecharImportacao}
        onConfirm={handleConfirmarImportacao}
      />

      <ModalConfirmacao
        isOpen={Boolean(participanteParaRemover)}
        onClose={() => {
          if (excluirParticipanteMutation.isPending) {
            return;
          }

          setParticipanteParaRemover(null);
        }}
        onConfirm={handleConfirmarRemocaoParticipante}
        mensagem={
          participanteParaRemover
            ? `Tem certeza que deseja remover o participante ${participanteParaRemover.nome}?`
            : "Tem certeza que deseja remover este participante?"
        }
      />
    </div>
  );
}
