import { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { Download, Pen, Trash2 } from "lucide-react";
import "./Styles.css";  

export interface Participante {
  nome: string;
  email: string;
}

export default function EmitirCertificado() {

  const [selectedEvento, setSelectedEvento] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulação de participantes
  const listaParticipantes: Participante[] = [
    { nome: "Amanda Maia SOARES SILVA", email: "amanda@email.com" },
    { nome: "João Silva", email: "joao@email.com" }
  ];

  const handleFileChange = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedDocumento = evento.target.files?.[0];

    if (uploadedDocumento) {
      const url = URL.createObjectURL(uploadedDocumento);
      setFile(url);
    }
  };

  const gerarPDF = (nomeParticipante: string): void => {

    if (!file) {
      alert("Por favor, anexe um modelo primeiro");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = file;

    img.onload = () => {

      canvas.width = img.width;
      canvas.height = img.height;

      // Fundo do certificado
      ctx.drawImage(img, 0, 0);

      // Estilo do nome
      ctx.font = "bold 70px Georgia";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(
        nomeParticipante,
        canvas.width / 2,
        canvas.height / 2 - 40
      );

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height
      );

      pdf.save(
        `Certificado_${nomeParticipante.replace(/\s/g, "_")}.pdf`
      );
    };
  };

  // Gerar todos certificados
  const handleEmitirTodos = (e: React.FormEvent) => {
    e.preventDefault();

    listaParticipantes.forEach((p) => {
      gerarPDF(p.nome);
    });
  };

  return (
    <div className="emitir-certificado-container">

      <main className="emitir-certificado-main">

        <header className="page-header">
          <h1>Emitir Certificado</h1>
          <p>Selecione o evento e gere certificados em PDF.</p>
        </header>

        {/* Canvas oculto */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        <section className="form-section">

          <form className="emitir-form" onSubmit={handleEmitirTodos}>

            <div className="form-group">
              <label>Evento:</label>

              <select
                value={selectedEvento}
                onChange={(e) => setSelectedEvento(e.target.value)}
                required
              >

                <option value="">Selecione um evento...</option>
                <option value="evento1">
                  Workshop de Tributação  
                </option>
                <option value="evento2">
                  Palestra Inovação TIC
                </option>

              </select>
            </div>

            <div className="form-group">
              <label>Modelo do Certificado (PNG/JPG):</label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />

            </div>

            <div className="form-group">
              <label>Cor do nome no certificado:</label>

              <div className="color-picker-group">
                <input
                  type="color"
                  className="color-input"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>

              <span className="color-hex-text">
                {textColor.toUpperCase()}
              </span>

            </div>

            {file && (

              <div className="preview-section">

                <div className="preview-header">
                  <h2>Lista de Participantes</h2>
                  <p>
                    Estes são os nomes que serão gerados nos certificados.
                  </p>
                </div>

                <table className="participantes-table">

                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Download</th>
                      <th>Ação</th>
                    </tr>
                  </thead>

                  <tbody>

                    {listaParticipantes.map((p, index) => (

                      <tr key={index}>

                        <td>{p.nome}</td>

                        <td>

                          <button
                            type="button"
                            className="btn-action"
                            onClick={() => gerarPDF(p.nome)}
                          >

                            <Download className="btnImg"/>

                          </button>

                        </td>

                        <td className="actions-cell">

                          <button
                            type="button"
                            className="btn-action"
                          >
                            <Pen className="btnImg" />
                          </button>

                          <button
                            type="button"
                            className="btn-action delete"
                          >
                            <Trash2 className="btnImg" />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

            <button
              type="submit"
              className="btn-emitir"
            >

              Gerar Certificados em Lote

            </button>

          </form>

        </section>

      </main>

    </div>
  );
}