import { useEffect, useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.min?url";

import "./Styles.css";

// Configurar worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function EditorCertificado() {

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
        color: "#000000"
    };

    const [pdfTemplate, setPdfTemplate] = useState<File | null>(null);
    const [eventosDisponiveis, setEventosDisponiveis] = useState<EventoFrontend[]>([]);
    const [eventoSelecionadoId, setEventoSelecionadoId] = useState("");
    const [participantes, setParticipantes] = useState<ParticipanteEvento[]>([]);

    const [config, setConfig] = useState(defaultConfig);
    const [configByParticipant, setConfigByParticipant] = useState<Record<string, typeof defaultConfig>>({});

    const [dragging, setDragging] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const participantePreview = participantes[previewIndex];
    const eventoSelecionado = eventosDisponiveis.find(
        (ev) => String(ev.id) === eventoSelecionadoId,
    );

    useEffect(() => {
        const eventosSalvos = localStorage.getItem("meus_eventos");
        if (!eventosSalvos) return;

        try {
        const parsed = JSON.parse(eventosSalvos);
        if (Array.isArray(parsed)) {
            setEventosDisponiveis(parsed);
        }
        } catch {
            // Ignora JSON inválido para não quebrar a tela
        }
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
                    [participantePreview.nome]: next
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
        const arrayBuffer = await file.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const scale = 1.5;
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
            canvas
        }).promise;
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

        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calcular posição com limites
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Limitar X (evitar sair para esquerda)
        x = Math.max(0, x);
        // Limitar X (evitar sair para direita - considerar largura aproximada do texto)
        x = Math.min(x, canvas.width - 100);

        // Limitar Y (evitar sair para cima)
        y = Math.max(0, y);
        // Limitar Y (evitar sair para baixo)
        y = Math.min(y, canvas.height - 50);

        atualizarConfig({ x, y });
    };

    //  HEX → RGB e
    const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.replace("#", ""), 16);
        return {
            r: ((bigint >> 16) & 255) / 255,
            g: ((bigint >> 8) & 255) / 255,
            b: (bigint & 255) / 255
        };
    };

    //  primeira letra maiúscula, resto minúscula
    const capitalize = (text: string) => {
        return text
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    //  Gerar certificado
    const gerarCertificado = async (nome: string, configOverride?: typeof defaultConfig) => {

        if (!pdfTemplate) {
            alert("Envie um PDF primeiro");
            return;
        }

        const configAtual = configOverride || configByParticipant[nome] || config;

        const bytes = await pdfTemplate.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);

        const page = pdfDoc.getPages()[0];
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const { r, g, b } = hexToRgb(configAtual.color);
        const { height, width } = page.getSize();

        // Recuperar escala e converter coordenadas
        const scale = parseFloat(sessionStorage.getItem("canvasScale") || "1.5");
        
        // Dividir por scale para voltar às coordenadas reais do PDF
        let pdfX = configAtual.x / scale;
        let pdfY = configAtual.y / scale;

        // Ajustar Y baseado no tamanho da fonte para manter posição visual constante
        const baselineFontSize = 30;
        const fontSizeDiff = configAtual.fontSize - baselineFontSize;
        pdfY = pdfY - fontSizeDiff / 2;

        // Capitalizar nome
        const nomeFinal = capitalize(nome);
        // Centralizar X automaticamente
        const textWidth = font.widthOfTextAtSize(nomeFinal, configAtual.fontSize);
        pdfX = (width - textWidth) / 2;

        page.drawText(nomeFinal, {
            x: pdfX,
            y: height - pdfY,
            size: configAtual.fontSize,
            font,
            color: rgb(r, g, b)
        });

        const pdfBytes = await pdfDoc.save();

        saveAs(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), `Certificado_${nomeFinal}.pdf`);
    };

    //  LOTE
    const gerarTodos = async () => {
        if (participantes.length === 0) {
            alert("Selecione um evento com participantes");
            return;
        }

        for (const p of participantes) {
            await gerarCertificado(p.nome, configByParticipant[p.nome] || defaultConfig);
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

    <div className="editor-container">

        <h1>Editor de Certificado</h1>

        {/* CONTROLES */}
        <div className="controls">

            <input
                type="file"
                accept="application/pdf"
                onChange={handleFile}
            />

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
                onChange={(e) =>
                    atualizarConfig({ color: e.target.value })
                }
            />

            <label>Pré-visualização</label>
            <div>
                <button type="button" onClick={visualizarAnterior}>Anterior</button>
                <span> {participantes.length > 0 ? previewIndex + 1 : 0}/{participantes.length} </span>
                <button type="button" onClick={visualizarProximo}>Próximo</button>
            </div>

        </div>

        {eventoSelecionadoId && (
            <div className="lista">
                <h3>
                    Nomes para emissao {eventoSelecionado ? `- ${eventoSelecionado.nome}` : ""}
                </h3>
                {participantes.length === 0 ? (
                        <p>Este evento ainda nao possui participantes na lista de presenca.</p>
                    ) : (
                        
                        participantes.map((p, i) => (
                        <div key={p.id || `${p.nome}-${i}`}>
                            {capitalize(p.nome)}
                        </div>
                    ))
                )}
            </div>
        )}

        {/* PREVIEW */}
            <div
                    className="canvas-wrapper"
                    ref={wrapperRef}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >

                <canvas ref={canvasRef} className="canvas" />

                <div
                    className="nome-preview"
                    onMouseDown={handleMouseDown}
                    style={{

                        left: config.x,
                        top: config.y,
                        fontSize: config.fontSize,
                        color: config.color
                    }}
                >
                    {participantePreview ? capitalize(participantePreview.nome) : "Nome do Participante"}
                </div>

            </div>

            {/* LISTA */}
            <div className="lista">
                {participantes.map((p, i) => (

                    <button key={p.id || `${p.nome}-${i}`} onClick={() => gerarCertificado(p.nome)}>
                        Baixar {p.nome}
                    </button>
                ))}
            </div>

            <button
                className="btn-lote"
                onClick={() => participantePreview && gerarCertificado(participantePreview.nome)}
            >
                Baixar Certificado em Pré-visualização
            </button>

            <button className="btn-lote" onClick={gerarTodos}>
                Gerar Todos
            </button>

        </div>
    );
}