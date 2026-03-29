import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";

import { apiService } from "../../../services/api";
import "./style.css";

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
  const qrCodeRef = useRef<HTMLDivElement | null>(null);

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
            <h3>Descricao</h3>
            <p>{evento.descricao || "Sem descricao cadastrada."}</p>
          </div>

          <div className="evento-section">
            <h3>Campos de inscricao</h3>
            {evento.camposInscricao && evento.camposInscricao.length > 0 ? (
              <div className="evento-campos-list">
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
              <p>Nenhum campo extra configurado.</p>
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
              <div className="evento-participantes-list">
                {evento.participantes.map((participante) => (
                  <article
                    key={participante._id || participante.id || participante.email}
                    className="evento-participante-card"
                  >
                    <div className="evento-participante-topo">
                      <div>
                        <strong>{participante.nome}</strong>
                        <span>{participante.email}</span>
                      </div>
                    </div>

                    {participante.camposPersonalizados &&
                      Object.keys(participante.camposPersonalizados).length > 0 && (
                        <div className="evento-participante-campos">
                          {Object.entries(participante.camposPersonalizados).map(
                            ([chave, valor]) => (
                              <div
                                key={`${participante.email}-${chave}`}
                                className="evento-participante-campo"
                              >
                                <span>{chave}</span>
                                <strong>{valor}</strong>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </article>
                ))}
              </div>
            ) : (
              <p>Nenhum participante cadastrado neste evento.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
