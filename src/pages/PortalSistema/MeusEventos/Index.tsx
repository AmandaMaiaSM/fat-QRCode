import React, { useState, useEffect, useMemo } from "react";

import ModalQRCode from "../../../components/ModalQRCode/Index";
import ModalConfirmacao from "../../../components/ModalConfirmacao/Index";
import ModalEditarEvento from "../../../components/ModalEditarEvento/Index";
import ModalDownload from "../../../components/ModalDownload/Index";
import {CirclePlus, Download, Eye, ListChecks, Pencil, QrCode, Trash2, X } from "lucide-react";



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

type DadosEdicao = {
    id: number | null;
    nome: string;
    data: string;
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
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [novoParticipante, setNovoParticipante] = useState({ nome: "", email: "", hora: "" });
    const [adicionarParticipanteAtivo, setAdicionarParticipanteAtivo] = useState(false);
    const [dadosEdicao, setDadosEdicao] = useState<DadosEdicao>({ id: null, nome: '', data: '' });
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
    const [idParticipanteEditando, setIdParticipanteEditando] = useState<number | null>(null);
    const [novoNomeParticipante, setNovoNomeParticipante] = useState("");
    const [novoEmailParticipante, setNovoEmailParticipante] = useState("");
    const [novaHoraParticipante, setNovaHoraParticipante] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    // Adicione estes estados junto com os outros useState
    const [qrValueSelecionado, setQrValueSelecionado] = useState("");
    const [nomeEventoQr, setNomeEventoQr] = useState("");
    const [modalQrAberto, setModalQrAberto] = useState(false);
    const [termoPesquisa, setTermoPesquisa] = useState("");

    //Funçao de busca 
    const eventosFiltrados = useMemo(() => {
        return eventos.filter(evento =>
            evento.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
        );
    }, [eventos, termoPesquisa]);
        
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
    const handleAbrirEdicao = (evento: Evento) => {
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
        setNovoEmailParticipante("");
        setNovaHoraParticipante("");
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
    const handleEditarParticipante = (
        idParticipante: number,
        nomeAtual: string,
        emailAtual: string,
        horaAtual: string
    ) => {
        setIdParticipanteEditando(idParticipante);
        setNovoNomeParticipante(nomeAtual);
        setNovoEmailParticipante(emailAtual);
        setNovaHoraParticipante(horaAtual);
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
                        p.id === idParticipanteEditando
                            ? { ...p, nome: novoNomeParticipante, email: novoEmailParticipante, hora: novaHoraParticipante }
                            : p
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
                    p.id === idParticipanteEditando
                        ? { ...p, nome: novoNomeParticipante, email: novoEmailParticipante, hora: novaHoraParticipante }
                        : p
                )
            };
        });

        //  Limpa os estados de edição
        setIdParticipanteEditando(null);
        setNovoNomeParticipante("");
        setNovoEmailParticipante("");
        setNovaHoraParticipante("");
    };

    const handleCancelarEdicaoParticipante = () => {
        setIdParticipanteEditando(null);
        setNovoNomeParticipante("");
        setNovoEmailParticipante("");
        setNovaHoraParticipante("");
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
                        value={termoPesquisa}
                        onChange={ (e) => setTermoPesquisa(e.target.value)}
                        />
                </div>
                
                <div className="table-container">
                    <table className="events-table">
                        <thead>
                            <tr>
                                <th>Nome do Evento</th>
                                <th>Data</th>
                                <th>Local</th>
                                <th>Quantidade de Participantes</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventosFiltrados.map(evento => (
                                <tr key={evento.id}>
                                    <td>{evento.nome}</td>
                                    <td>{evento.data}</td>
                                    <td>{evento.local}</td>
                                    <td>
                                        <span className="badge-count">
                                             {evento.participantes?.length || 0} pessoas
                                        </span>
                                    </td>

                                    <td>
                                        <button className="btn-action qr" onClick={() => handleVerQRCode(evento)} title="Ver QR Code">
                                            <QrCode size={18} />
                                        </button>

                                        <button className="btn-action view"onClick={() => handleVerPresenca(evento)} title="Ver Lista">
                                            <ListChecks  size={18} />
                                        </button>

                                        <button className="btn-action edit" onClick={() => handleAbrirEdicao(evento)} title="Editar Evento">
                                            <Pencil size={18} />
                                        </button>

                                        <button className="btn-action delete" onClick={() => handleAbrirConfirmacao(evento.id)} title="Excluir">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {eventosFiltrados.length === 0 && (
                        <p className="empty-state">Nenhum evento encontrado. </p>
                    )}
                </div>
                {/*Modal de lista de presença  */}
                {modalAberto && eventoSelecionado && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Lista de Presença - {eventoSelecionado.nome}</h2>
                                <button className="btn-close" onClick={() => setModalAberto(false)}>
                                    <X />
                                </button>
                            </div>

                             {/* Formulário para adicionar participante (aparece só quando ativado) */}
                             <div className="modal-body">
                                <>
                                    {adicionarParticipanteAtivo && (
                                        <div className= {`add-participant-form ${adicionarParticipanteAtivo ? "active" : ""}`}>
                                            <h2> Novo Participante </h2>
                                            <br />

                                            <label htmlFor="nome">Nome:</label>
                                            <input 
                                                type="text"
                                                placeholder="Nome"
                                                value={novoParticipante.nome}
                                                onChange={e => setNovoParticipante({ ...novoParticipante, nome: e.target.value })}
                                                className="input-Add-participante"
                                            />
                                            <label htmlFor="email">Email:</label>
                                            <input 
                                                type="email"    
                                                placeholder="Email"
                                                value={novoParticipante.email}
                                                onChange={e => setNovoParticipante({ ...novoParticipante, email: e.target.value })}
                                                className="input-Add-participante"
                                            />
                                            <label htmlFor="hora">Hora de Chegada:</label>
                                            <input 
                                                type="time"
                                                placeholder="Hora (ex: 08:00)"
                                                value={novoParticipante.hora}
                                                onChange={e => setNovoParticipante({ ...novoParticipante, hora: e.target.value })}
                                                className="input-Add-participante"
                                            />
                                            <div className="add-participante-actions">
                                                <button className="btn-save" onClick={() => adicionarParticipante(false)}>Adicionar</button>
                                                <button className="btn-cancel" onClick={handleCancelarAdicionarParticipante}>Cancelar</button>
                                            </div>
                                        </div>
                                    )}

                                    {eventoSelecionado.participantes.length > 0 ? (
                                        <table className="attendess-table">
                                            <thead>
                                                <tr>
                                                    <th>Nome</th>
                                                    <th>Email</th>
                                                    <th>Hora de Chegada</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="participantes-table-body">
                                                {eventoSelecionado.participantes.map(pessoa => (
                                                    //
                                                    <tr key={pessoa.id}>
                                                            <td>
                                                                {idParticipanteEditando === pessoa.id ? (
                                                                    <input
                                                                        type="text"
                                                                        value={novoNomeParticipante}
                                                                        onChange={e => setNovoNomeParticipante(e.target.value)}
                                                                        className="EditarNome"
                                                                    />
                                                                ) : (
                                                                    pessoa.nome
                                                                )}
                                                            </td>
                                                            <td>
                                                                {idParticipanteEditando === pessoa.id ? (
                                                                    <input
                                                                        type="email"
                                                                        value={novoEmailParticipante}
                                                                        onChange={e => setNovoEmailParticipante(e.target.value)}
                                                                    />
                                                                ) : (
                                                                    pessoa.email
                                                                )}
                                                            </td>
                                                            <td>
                                                                {idParticipanteEditando === pessoa.id ? (
                                                                    <input
                                                                        type="time"
                                                                        value={novaHoraParticipante}
                                                                        onChange={e => setNovaHoraParticipante(e.target.value)}
                                                                    />
                                                                ) : (
                                                                    pessoa.hora
                                                                )}
                                                            </td>

                                                        <td>
                                                            {idParticipanteEditando === pessoa.id ? (
                                                                <>
                                                                    <button className="btn-save" onClick={salvarNomeParticipante}>Salvar</button>
                                                                    <button className="btn-cancel" onClick={handleCancelarEdicaoParticipante}>Cancelar</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button className="btn-action"
                                                                        title="Editar"
                                                                        style={{marginLeft: 8}}
                                                                        onClick={() => handleEditarParticipante(pessoa.id, pessoa.nome, pessoa.email, pessoa.hora)}
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>
                                                                    <button className="btn-action"
                                                                        title="Adicionar"
                                                                        onClick={() => handleAbrirAdicionarParticipante(pessoa)}
                                                                    >
                                                                        <CirclePlus/>
                                                                    </button>
                                                                    <button className="btn-action"
                                                                        title="Excluir"
                                                                        onClick={() => handleExcluirParticipante(pessoa.id)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>          
                                                ))}
                                                {/* Linhas da tabela de participantes */}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="empty-state">Ninguém realizou check-in ainda.</p>
                                    )}
                                </>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn-action" 
                                    onClick={() => setShowDownloadModal(true)}
                                    >
                                        Baixar Lista
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Modaois */}
                <ModalConfirmacao
                    isOpen={modalExcluirAberto}
                    onClose={() => setModalExcluirAberto(false)}
                    onConfirm={confirmarExclusao}
                    mensagem="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
                />
                <ModalEditarEvento
                    isOpen={modalEditarAberto}
                    onClose={() => setModalEditarAberto(false)} 
                    onSave={salvarEdicao}
                    dadosEdicao={dadosEdicao}
                    setDadosEdicao={setDadosEdicao}
                />
                <ModalQRCode 
                    isOpen={modalQrAberto} 
                    onClose={() => setModalQrAberto(false)} 
                    qrValue={qrValueSelecionado}
                    nomeEvento={nomeEventoQr}
                />
                <ModalDownload 
                    isOpen={showDownloadModal}
                    onClose={() => setShowDownloadModal(false)}
                />

            </main >
        </div>
    );
}



