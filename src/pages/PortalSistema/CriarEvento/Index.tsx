import { useRef, useState, ChangeEvent } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { v4 as uuidv4 } from 'uuid'; 

import ModalSucessoEvento from "../../../components/ModalSucessoEvento/Index";
import "./Styles.css";

export default function CriarEvento() {
    const qrCodeValue = useRef(null); 

    //Estados 
    const [eventoId] = useState(() => `evt-${uuidv4()}`);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [form, setForm] = useState({
        name: "",
        date: "",
        time: "",
        location: "",
        descricao: ""
    });
   
    // ESTADOS DOS CAMPOS DINÂMICOS (Movidos para o topo)
    const [camposExtras, setCamposExtras] = useState<Campo[]>([]);
    const [novoCampoNome, setNovoCampoNome] = useState("");

    // --- VARIÁVEIS AUXILIARES ---
    const baseUrl = window.location.origin; 
    const qrValue = `${baseUrl}/checkin/${eventoId}`;
    // --- FUNÇÕES DOS CAMPOS DINÂMICOS ---
    const adicionarCampo = () => {
        if (novoCampoNome.trim() === "") return;
        const campo = {
        id: Date.now(),
        label: novoCampoNome,
        name: novoCampoNome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "_"), 
        };
        setCamposExtras([...camposExtras, campo]);
        setNovoCampoNome("");
    };

    interface Campo {
        id: number;
        label: string;
        name: string;
    }

    const removerCampo = (id: number): void => {
        setCamposExtras(camposExtras.filter((c: Campo) => c.id !== id));
    };
    // --- FUNÇÕES DO FORMULÁRIO ---
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    };
    

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const novoEvento = {
        id: eventoId,
        nome: form.name,
        data: form.date,
        hora: form.time,
        local: form.location,
        descricao: form.descricao,
        qrCodeValue: `${baseUrl}/checkin/${eventoId}`,
        camposPersonalizados: camposExtras, 
        participantes: []
        };

        // Exibe o ID do evento criado no console
        console.log('Evento criado:', novoEvento);

        const eventosSalvos = JSON.parse(localStorage.getItem('meus_eventos') || '[]');
        localStorage.setItem('meus_eventos', JSON.stringify([...eventosSalvos, novoEvento]));

        setShowSuccessModal(true);
    };

    // --- OUTRAS FUNÇÕES (Download e Scroll) ---
    const downloadQRCode = () => {
        if (qrCodeValue.current === null) return;
        toPng(qrCodeValue.current, { cacheBust: true, backgroundColor: 'white' })
        .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `${form.name || "evento"}-qrcode.png`;
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => console.error("Erro ao gerar QR Code", err));
    };

    const scrollToTicket = () => {
        setShowSuccessModal(false);
        setTimeout(() => {
        document.querySelector('.preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

   return (
    <div className="dashboard-container">
      <main className="main-content">
        <header className="page-header">
           <h1>Criar Novo Evento</h1>
           <p>Preencha os dados abaixo para gerar o QR Code de check-in.</p>
        </header>

        <div className="content-wrapper">
          <section className="form-section">
            <form className="create-event-form" onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="name">Nome do Evento</label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição do Evento</label>
                <textarea id="descricao" name="descricao" value={form.descricao} onChange={handleChange} rows={3} placeholder="Digite uma descrição para o evento..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Data</label>
                  <input type="date" id="date" name="date" value={form.date} onChange={handleChange} required />
                </div>  
                <div className="form-group">
                  <label htmlFor="time">Hora</label>
                  <input type="time" id="time" name="time" value={form.time} onChange={handleChange} required />
                </div>
              </div>
              

              <div className="form-group">
                <label htmlFor="location">Local</label>
                <input type="text" id="location" name="location" value={form.location} onChange={handleChange} required />
              </div>  


              <hr />
              <h3 style={{fontSize: '16px', margin: '20px 0 10px'}}>Configuração do Check-in</h3>
              
              <div className="dynamic-fields-section">
                <div className="form-row" style={{alignItems: 'flex-end'}}>
                  <div className="form-group" style={{flex: 1}}>
                    <label>Campos adicionais:</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Matrícula, CPF.."
                      value={novoCampoNome}
                      onChange={(e) => setNovoCampoNome(e.target.value)}
                    />
                  </div>
                  {/* Importante: type="button" para não dar submit */}
                  <button type="button" className="btn-add" onClick={adicionarCampo} style={{marginBottom: '20px', height: '45px'}}>
                    +
                  </button>
                </div>

                <div className="tags-container" style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                  {camposExtras.map(campo => (
                    <span key={campo.id} className="tag" style={{background: '#eee', padding: '5px 10px', borderRadius: '15px', fontSize: '12px'}}>
                      {campo.label}
                      <button type="button" onClick={() => removerCampo(campo.id)} style={{marginLeft: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'red'}}>x</button>
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-submit" style={{marginTop: '30px'}}>
                Salvar Evento
              </button>
            </form>
          </section>

          {/* ASIDE PREVIEW  */}
          <aside className="preview-section">
            {/* código do ticket e QR Code ... */}
            <div className="event-card">
               <div className="card-header"><span>TICKET DE ACESSO</span></div>
               <div className="card-body">
                 <h4>{form.name || "Nome do Evento"}</h4>
                 <div className="card-info">
                   <p><strong>Data:</strong> {form.date || "--/--/----"}</p>
                   <p><strong>Hora:</strong> {form.time || "--:--"}</p>
                   <p><strong>Local:</strong> {form.location || "Local não definido"}</p>
                 </div>
                 <div className="qr-container" ref={qrCodeValue}>
                    <QRCode value={form.name ? qrValue : "vazio"} size={140} level={"H"} />
                 </div>
               </div>
               <div className="card-footer">
                 <button type="button" className="btn-download" onClick={downloadQRCode} disabled={!form.name}>
                   Baixar QR Code
                 </button>
               </div>
            </div>
          </aside>
        </div>

        <ModalSucessoEvento 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onVerTicket={scrollToTicket}
        />
      </main>
    </div>
  );

}