import { useEffect, useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { apiService, type Evento as EventoApi } from "../../../services/api";

import "./Styles.css";

// Configurar worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function EditorCertificado() {
  const PDF_RENDER_SCALE = 1.5;

  type ParticipanteEvento = {
    id?: string;
    nome: string;
    email?: string;
  };

  type EventoFrontend = {
    id: string | number;
    nome: string;
    participantes: ParticipanteEvento[];
  };

  const defaultConfig = {
    x: 300,
    y: 300,
    fontSize: 30,
    color: "#000000",
  };

  const [pdfTemplate, setPdfTemplate] = useState<File | null>(null);
  const [eventosDisponiveis, setEventosDisponiveis] = useState<
    EventoFrontend[]
  >([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState("");
  const [participantes, setParticipantes] = useState<ParticipanteEvento[]>([]);

  const [config, setConfig] = useState(defaultConfig);
  const [configByParticipant, setConfigByParticipant] = useState<
    Record<string, typeof defaultConfig>
  >({});

  const [dragging, setDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const nomePreviewRef = useRef<HTMLDivElement | null>(null);

  const participantePreview = participantes[previewIndex];
  const eventoSelecionado = eventosDisponiveis.find(
    (ev) => String(ev.id) === eventoSelecionadoId,
  );

  useEffect(() => {
    let ativo = true;

    const carregarEventos = async () => {
      try {
        const eventos = await apiService.listarEventos();

        if (!ativo) return;

        const eventosNormalizados: EventoFrontend[] = (eventos || []).map(
          (evento: EventoApi) => ({
            id: evento._id || evento.id || "",
            nome: evento.nome,
            participantes: (evento.participantes || []).map((participante) => ({
              id: participante._id || participante.id,
              nome: participante.nome,
              email: participante.email,
            })),
          }),
        );

        setEventosDisponiveis(
          eventosNormalizados.filter((evento) => String(evento.id).trim()),
        );
      } catch {
        if (!ativo) return;
        setEventosDisponiveis([]);
      }
    };

    void carregarEventos();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!participantePreview) return;
    const savedConfig = configByParticipant[participantePreview.nome];
    setConfig(savedConfig || defaultConfig);
  }, [previewIndex, participantePreview, configByParticipant]);

  const atualizarConfig = (partial: Partial<typeof defaultConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };

      if (participantePreview) {
        setConfigByParticipant((prevMap) => ({
          ...prevMap,
          [participantePreview.nome]: next,
        }));
      }
      return next;
    });
  };

  const carregarParticipantesDoEvento = (eventoId: string) => {
    setEventoSelecionadoId(eventoId);
    setPreviewIndex(0);
    setConfig(defaultConfig);
    setConfigByParticipant({});

    const evento = eventosDisponiveis.find((ev) => String(ev.id) === eventoId);
    setParticipantes(evento?.participantes || []);
  };

  // Upload + renderização
  const handleFile = async (e: any) => {
    const file = e.target.files[0];

    if (file) {
      setPdfTemplate(file);
      await renderPDF(file);
    }
  };

  // 🎨 Renderizar PDF no canvas
  const renderPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      const page = await pdf.getPage(1);

      const scale = PDF_RENDER_SCALE;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Armazenar escala para conversão de coordenadas
      sessionStorage.setItem("canvasScale", String(scale));

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise;
    } catch (error) {
      console.error("Erro ao renderizar PDF:", error);
      alert("Nao foi possivel carregar este PDF. Tente outro arquivo.");
    }
  };

  // Drag isso aqui é meio complexo porque o canvas é só uma imagem,
  // então a gente tem que calcular os limites manualmente pra não deixar
  //  o texto sair da área do certificado. Aí tem umas contas pra converter
  // as coordenadas do mouse pro sistema de coordenadas do PDF, considerando a escala do canvas.
  // E também tem um ajuste no Y pra manter o texto visualmente alinhado mesmo quando a fonte é maior
  // ou menor que o baseline que a gente escolheu. Enfim, é um pouco de matemática, mas nada impossível!
  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e: any) => {
    if (!dragging) return;

    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const canvas = canvasRef.current;
    const nomePreview = nomePreviewRef.current;
    if (!wrapperRect || !canvas || !nomePreview) return;

    const canvasRect = canvas.getBoundingClientRect();
    const nomeRect = nomePreview.getBoundingClientRect();

    // Posição do mouse relativa ao wrapper
    let x = e.clientX - wrapperRect.left;
    let y = e.clientY - wrapperRect.top;

    // Limites reais do canvas dentro do wrapper
    const minX = canvasRect.left - wrapperRect.left;
    const minY = canvasRect.top - wrapperRect.top;
    const maxX = canvasRect.right - wrapperRect.left - nomeRect.width;
    const maxY = canvasRect.bottom - wrapperRect.top - nomeRect.height;

    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    atualizarConfig({ x, y });
  };

  const getCanvasOffsetInWrapper = () => {
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();

    if (!wrapperRect || !canvasRect) {
      return { offsetX: 0, offsetY: 0 };
    }

    return {
      offsetX: canvasRect.left - wrapperRect.left,
      offsetY: canvasRect.top - wrapperRect.top,
    };
  };

  //  HEX → RGB e
  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
      r: ((bigint >> 16) & 255) / 255,
      g: ((bigint >> 8) & 255) / 255,
      b: (bigint & 255) / 255,
    };
  };

  //  primeira letra maiúscula, resto minúscula
  const capitalize = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  //  Gerar certificado
  const sanitizeFileName = (valor: string) => {
    return valor
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  };

  const montarCertificado = async (
    nome: string,
    configOverride?: typeof defaultConfig,
  ): Promise<{
    pdfBytes: Uint8Array;
    nomeFinal: string;
    nomeArquivo: string;
  }> => {
    if (!pdfTemplate) throw new Error("Template PDF ausente");

    const configAtual = configOverride || configByParticipant[nome] || config;

    const bytes = await pdfTemplate.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);

    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { r, g, b } = hexToRgb(configAtual.color);
    const { height, width } = page.getSize();

    // Recuperar escala e converter coordenadas
    const scale = parseFloat(
      sessionStorage.getItem("canvasScale") || String(PDF_RENDER_SCALE),
    );

    const { offsetX, offsetY } = getCanvasOffsetInWrapper();
    const canvas = canvasRef.current;
    const canvasRect = canvas?.getBoundingClientRect();

    if (!canvas || !canvasRect) {
      alert("Nao foi possivel calcular a posicao no certificado.");
      throw new Error("Canvas indisponivel para calculo de posicao");
    }

    const previewStyle = nomePreviewRef.current
      ? window.getComputedStyle(nomePreviewRef.current)
      : null;
    const previewPaddingLeft = previewStyle
      ? parseFloat(previewStyle.paddingLeft || "0")
      : 0;
    const previewPaddingTop = previewStyle
      ? parseFloat(previewStyle.paddingTop || "0")
      : 0;

    // Converter posição visual (wrapper/canvas) para coordenadas do PDF
    const xNoCanvas = Math.max(0, configAtual.x - offsetX + previewPaddingLeft);
    const yNoCanvas = Math.max(0, configAtual.y - offsetY + previewPaddingTop);

    // Coordenadas de arraste estao em pixels exibidos; converter para pixels reais do canvas.
    const displayToCanvasX = canvas.width / canvasRect.width;
    const displayToCanvasY = canvas.height / canvasRect.height;

    const xNoCanvasReal = xNoCanvas * displayToCanvasX;
    const yNoCanvasReal = yNoCanvas * displayToCanvasY;

    let pdfX = xNoCanvasReal / scale;
    const pdfYTop = yNoCanvasReal / scale;

    // Capitalizar nome
    const nomeFinal = capitalize(nome);

    const textWidth = font.widthOfTextAtSize(nomeFinal, configAtual.fontSize);
    const textHeight = font.heightAtSize(configAtual.fontSize);

    // PDF usa origem no canto inferior esquerdo; no preview usamos origem no topo.
    let pdfY = height - pdfYTop - textHeight;

    // Garantir que o texto nao saia da pagina final.
    pdfX = Math.max(0, Math.min(pdfX, width - textWidth));
    pdfY = Math.max(0, Math.min(pdfY, height - textHeight));

    page.drawText(nomeFinal, {
      x: pdfX,
      y: pdfY,
      size: configAtual.fontSize,
      font,
      color: rgb(r, g, b),
    });

    const pdfBytes = await pdfDoc.save();

    return {
      pdfBytes,
      nomeFinal,
      nomeArquivo: `Certificado_${sanitizeFileName(nomeFinal)}.pdf`,
    };
  };

  const gerarCertificado = async (
    nome: string,
    configOverride?: typeof defaultConfig,
  ) => {
    if (!pdfTemplate) {
      alert("Envie um PDF primeiro");
      return;
    }

    try {
      const { pdfBytes, nomeArquivo } = await montarCertificado(
        nome,
        configOverride,
      );

      saveAs(
        new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
        nomeArquivo,
      );
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      alert("Nao foi possivel gerar este certificado.");
    }
  };

  //  LOTE
  const gerarTodos = async () => {
    if (participantes.length === 0) {
      alert("Selecione um evento com participantes");
      return;
    }

    if (!pdfTemplate) {
      alert("Envie um PDF primeiro");
      return;
    }

    try {
      const zip = new JSZip();

      for (const p of participantes) {
        const { pdfBytes, nomeArquivo } = await montarCertificado(
          p.nome,
          configByParticipant[p.nome] || defaultConfig,
        );

        zip.file(nomeArquivo, pdfBytes);
      }

      const nomeEvento = eventoSelecionado
        ? sanitizeFileName(capitalize(eventoSelecionado.nome))
        : "Evento";

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `Certificados_${nomeEvento}.zip`);
    } catch (error) {
      console.error("Erro ao gerar certificados em lote:", error);
      alert("Nao foi possivel gerar todos os certificados.");
    }
  };

  const visualizarAnterior = () => {
    if (participantes.length === 0) return;
    setPreviewIndex((atual) => {
      if (atual === 0) return participantes.length - 1;
      return atual - 1;
    });
  };

  const visualizarProximo = () => {
    if (participantes.length === 0) return;
    setPreviewIndex((atual) => {
      if (atual === participantes.length - 1) return 0;
      return atual + 1;
    });
  };

  return (
    <div className="editor-container-EmitirC">
      <h1>Editor de Certificado</h1>

      {/* CONTROLES */}
      <div className="controls-EmitirC">
        <input type="file" accept="application/pdf" onChange={handleFile} />

        <label>Evento</label>
        <select
          value={eventoSelecionadoId}
          onChange={(e) => carregarParticipantesDoEvento(e.target.value)}
        >
          <option value="">Selecione um evento</option>

          {eventosDisponiveis.map((evento) => (
            <option key={String(evento.id)} value={String(evento.id)}>
              {evento.nome}
            </option>
          ))}
        </select>

        <label>Tamanho</label>

        <input
          type="range"
          min="10"
          max="80"
          value={config.fontSize}
          onChange={(e) =>
            atualizarConfig({ fontSize: Number(e.target.value) })
          }
        />

        <label>Cor</label>
        <input
          type="color"
          value={config.color}
          onChange={(e) => atualizarConfig({ color: e.target.value })}
        />

        <label>Pré-visualização</label>
        <div className="preview-nav-EmitirC">
          <button
            type="button"
            onClick={visualizarAnterior}
            aria-label="Participante anterior"
          >
            {"<"}
          </button>
          <span className="preview-counter-EmitirC">
            {participantes.length > 0 ? previewIndex + 1 : 0}/
            {participantes.length}
          </span>
          <button
            type="button"
            onClick={visualizarProximo}
            aria-label="Próximo participante"
          >
            {">"}
          </button>
        </div>
      </div>

      {eventoSelecionadoId && (
        <div className="lista-EmitirC">
          <h3>
            Nomes para emissao{" "}
            {eventoSelecionado ? `- ${eventoSelecionado.nome}` : ""}
          </h3>
          {participantes.length === 0 ? (
            <p>
              Este evento ainda nao possui participantes na lista de presenca.
            </p>
          ) : (
            participantes.map((p, i) => (
              <div key={p.id || `${p.nome}-${i}`}>{capitalize(p.nome)}</div>
            ))
          )}
        </div>
      )}

      {/* PREVIEW */}
      <div
        className="canvas-wrapper-EmitirC"
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="canvas-EmitirC" />

        <div
          className="nome-preview-EmitirC"
          ref={nomePreviewRef}
          onMouseDown={handleMouseDown}
          style={{
            left: config.x,
            top: config.y,
            fontSize: config.fontSize,
            color: config.color,
          }}
        >
          {participantePreview
            ? capitalize(participantePreview.nome)
            : "Nome do Participante"}
        </div>
      </div>

      {/* LISTA */}
      <div className="lista-EmitirC">
        {participantes.map((p, i) => (
          <button
            key={p.id || `${p.nome}-${i}`}
            onClick={() => gerarCertificado(p.nome)}
          >
            Baixar {p.nome}
          </button>
        ))}
      </div>

      <button
        className="btn-lote-EmitirC"
        onClick={() =>
          participantePreview && gerarCertificado(participantePreview.nome)
        }
      >
        Baixar Certificado em Pré-visualização
      </button>

      <button className="btn-lote-EmitirC" onClick={gerarTodos}>
        Gerar Todos
      </button>
    </div>
  );
}
