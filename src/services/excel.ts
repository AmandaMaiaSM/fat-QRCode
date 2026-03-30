import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type {
    Evento,
    EventoParticipante,
    InscreverParticipantePayload,
} from "./api";

/**
 * Gera e baixa um template Excel para participantes de evento, usando identificadores como cabeçalhos.
 * @param evento Evento com camposInscricao
 */
export function baixarTemplateParticipantes(evento: Evento) {
    if (!evento) return;
    const headers = ["nome", "email", ...(evento.camposInscricao?.map(c => c.identificador) || [])];
    const data = [headers.reduce((acc, h) => ({ ...acc, [h]: "" }), {})];
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `template-participantes-${evento.nome || "evento"}.xlsx`);
}

export async function lerParticipantesDeExcel(
    file: File,
    evento: Evento,
): Promise<InscreverParticipantePayload[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const primeiraAba = workbook.SheetNames[0];

    if (!primeiraAba) {
        return [];
    }

    const worksheet = workbook.Sheets[primeiraAba];
    const linhas = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
    });

    return linhas
        .map((linha) => ({
            nome: String(linha.nome || "").trim(),
            email: String(linha.email || "").trim(),
            camposPersonalizados: Object.fromEntries(
                (evento.camposInscricao || []).map((campo) => [
                    campo.identificador,
                    String(linha[campo.identificador] || "").trim(),
                ]),
            ),
        }))
        .filter((participante) => participante.nome && participante.email);
}

export function baixarParticipantesDoEventoEmExcel(
    evento: Evento,
    participantes: EventoParticipante[],
) {
    if (!evento) return;

    const headers = [
        "nome",
        "email",
        ...(evento.camposInscricao?.map((campo) => campo.identificador) || []),
    ];

    const data = participantes.map((participante) => ({
        nome: participante.nome || "",
        email: participante.email || "",
        ...Object.fromEntries(
            (evento.camposInscricao || []).map((campo) => [
                campo.identificador,
                participante.camposPersonalizados?.[campo.identificador] || "",
            ]),
        ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `participantes-${evento.nome || "evento"}.xlsx`);
}
