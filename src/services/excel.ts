import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Evento } from "./api";

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
