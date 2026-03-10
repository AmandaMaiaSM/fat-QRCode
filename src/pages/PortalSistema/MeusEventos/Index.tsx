import React, { useState, useEffect, useMemo } from "react";

import ModalQRCode from "components/ModalQRCode/Index";
import ModalConfirmacao from "components/ModalConfirmacao/Index";
import ModalEditarEvento from "components/ModalEditarEvento/Index";
import ModalDownload from "components/ModalDownload/Index";


import "./styles.css";

type Participante = {
  id: number;
  nome: string;
  email: string;
  hora: string;
};

type Evento = {
  id: number;
  nome: string;
  data: string;
  local: string;
  qrCodeValue?: string;
  participantes: Participante[];
};

// --- DADOS FICTÍCIOS ---
const eventosIniciais: Evento[] = [
  {
    id: 1,
    nome: "Workshop de React",
    data: "2023-10-25",
    local: "Auditório Principal",
    participantes: [
      { id: 101, nome: "João Silva", email: "joao@email.com", hora: "08:30" },
      { id: 102, nome: "Maria Oliveira", email: "maria@email.com", hora: "08:45" },
    ]
  },
  {
    id: 2,
    nome: "Palestra de Segurança",
    data: "2023-11-10",
    local: "Sala de Reunião B",
    qrCodeValue: "http://localhost:5173/checkin/evt-1",
    participantes: [
      { id: 201, nome: "Ana Santos", email: "ana@email.com", hora: "14:05" },
    ]
  }
];


export default function MeusEventos() {

    const [eventos, setEventos] = useState<Evento[]>(eventosIniciais);
    const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);
    const [showConfirmacaoModal, setShowConfirmacaoModal] = useState(false);
    const [showEditarModal, setShowEditarModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    const [novoParticipante, setNovoParticipante] = useState({ nome: "", email: "", hora: "" });
    
    const [adicionarParticipanteAtivo, setAdicionarParticipanteAtivo] = useState(false);
    const [dadosEdicao, setDadosEdicao] = useState<{ id: number | null; nome: string; data: string }>({ id: null, nome: "", data: "" });
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
    const [idParticipanteEditando, setIdParticipanteEditando] = useState<number | null>(null);
    const [novoNomeParticipante, setNovoNomeParticipante] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    // Adicione estes estados junto com os outros useState
    const [qrValueSelecionado, setQrValueSelecionado] = useState("");
    const [nomeEventoQr, setNomeEventoQr] = useState("");
    const [modalQrAberto, setModalQrAberto] = useState(false);


    
    
    // Adicionar participante ao evento selecionado
    const adicionarParticipante = (p0: boolean) => {
        if(!novoParticipante.nome || !novoParticipante.email || !novoParticipante.hora) return;
        
        const novoId = Date.now();
        const participanteCompleto = { ...novoParticipante, id: novoId };

        // Atualiza a lista global de eventos
        setEventos(prevEventos => prevEventos.map(evnt => {
            if (evnt.id === eventoSelecionado?.id) {
                return {
                    ...evnt,
                    participantes: [...evnt.participantes, participanteCompleto]
                };
            }
            return evnt;
        }));

        // Atualizando o evento selecionado para refletir a adição do participante
        setEventoSelecionado(evnt => {
            if (!evnt) return null; // 
            return {
                ...evnt,
                participantes: [...evnt.participantes, participanteCompleto]
            };
        });

        // Reset de campos
        setNovoParticipante({ nome: "", email: "", hora: "" }); 
        setAdicionarParticipanteAtivo(false);
    };
    
    // Abrir modal para adicionar participante
    const handleAbrirAdicionarParticipante = (pessoa: { nome: any; email: any; hora: any; }) => {
        setNovoParticipante(pessoa ? { nome: pessoa.nome, email: pessoa.email, hora: pessoa.hora } : { nome: "", email: "", hora: "" });
        setAdicionarParticipanteAtivo(true);
    };
    // Cancelar adição de participante
    const handleCancelarAdicionarParticipante = () => {
        setAdicionarParticipanteAtivo(false);
        setNovoParticipante({ nome: "", email: "", hora: "" });
    };

    // --- EFEITOS ---
    // Salva no localStorage sempre que a lista de eventos muda (ainda ver se vale a pena fazerrr)
    

    // LÓGICA DE FILTRAGEM  

    // FUNÇÕES DE AÇÃO
      const handleAbrirEdicao = (evento: { id: any; nome: any; data: any; }) => {
        setDadosEdicao({ id: evento.id, nome: evento.nome, data: evento.data });
        setModalEditarAberto(true);
    };

    const handleAbrirConfirmacao = (id: React.SetStateAction<number | null>) => {
        setIdParaExcluir(id);
        setModalExcluirAberto(true);
    };

    const confirmarExclusao = () => {
        setEventos(prev => prev.filter(ev => ev.id !== idParaExcluir));
        setModalExcluirAberto(false);
        setIdParaExcluir(null);
    };

    const salvarEdicao = () => {
        setEventos(prev => prev.map(ev => 
        ev.id === dadosEdicao.id ? { ...ev, nome: dadosEdicao.nome, data: dadosEdicao.data } : ev
        ));
        setModalEditarAberto(false);
    };


    //modal de ModalDanload para baixar a lista de presença do evento selecionados
    const handleVerPresenca = (evento: React.SetStateAction<Evento | null>) => {
        setEventoSelecionado(evento);
        setModalAberto(true);
        setIdParticipanteEditando(null);
        setNovoNomeParticipante("");
    };

    // Excluir participante
    const handleExcluirParticipante = (idParticipante: number) => {
        if (!eventoSelecionado) return;

        // Atualiza a lista principal
        setEventos(prevEventos => prevEventos.map(ev => {
            // utilizamos o eventoSelecionado.id para garantir que estamos editando o evento correto,
            //  mesmo que o estado do evento selecionado ainda não tenha sido atualizado 
            // (devido à natureza assíncrona do setState)
            if (ev.id === eventoSelecionado.id) {
                return {
                    ...ev,
                    participantes: ev.participantes.filter(p => p.id !== idParticipante)
                };
            }
            return ev;
        }));

        //  Atualiza o estado do evento que está sendo visualizado
        setEventoSelecionado(evnt => {
            // Se evnt for null, retornamos null (encerra a função)
            if (!evnt) return null;

            return {
                ...evnt,
                participantes: evnt.participantes.filter(p => p.id !== idParticipante)
            };
        });
    };
    // Editar nome do participante
    const handleEditarParticipante = (idParticipante: number, nomeAtual: string) => {
        setIdParticipanteEditando(idParticipante);
        setNovoNomeParticipante(nomeAtual);
    };
    
    // Salvar nome editado do participante
    const salvarNomeParticipante = () => {
        if (!eventoSelecionado || idParticipanteEditando === null) return;

        // 1. Atualiza na lista global
        setEventos(prev => prev.map(ev => {
            if (ev.id === eventoSelecionado.id) {
                return {
                    ...ev,
                    participantes: ev.participantes.map(p => 
                        p.id === idParticipanteEditando ? { ...p, nome: novoNomeParticipante } : p
                    )
                };
            }
            return ev;
        }));

        // Atualiza no estado do evento selecionado
        setEventoSelecionado(evnt => {
            if (!evnt) return null;
            return {
                ...evnt,
                participantes: evnt.participantes.map(p => 
                    p.id === idParticipanteEditando ? { ...p, nome: novoNomeParticipante } : p
                )
            };
        });

        //  Limpa os estados de edição
        setIdParticipanteEditando(null);
        setNovoNomeParticipante("");
    };

    const handleCancelarEdicaoParticipante = () => {
        setIdParticipanteEditando(null);
        setNovoNomeParticipante("");
    };

   // Função para abrir modal de QR Code
    const handleVerQRCode = (evento: Evento) => {
        setQrValueSelecionado(evento.qrCodeValue || "");
        setNomeEventoQr(evento.nome);
        setModalQrAberto(true);
    };

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="page-header">
                    <h1>Meus Eventos</h1>
                    <p>Gerencie seus eventos  e veja quem marcou presença.</p>
                </header>

                {/* Barra de busca  ainda finalizar */}
                <div className="search-bar">
                    <input type="text"
                        placeholder="Buscar por nome do evento..." 
                        />
                </div>

            </main >
        </div>
    );
}



