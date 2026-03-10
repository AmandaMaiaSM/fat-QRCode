import React, { useState } from "react";
 

import ModalConfirmacao from "components/ModalConfirmacao/Index";
import ModalExcluirConta from "../../../components/ModalExcluirConta/Index";
import ModalSucessoConfig from "../../../components/ModalSucessoConfig/Index";
import ModalSalvarConfig from "../../../components/ModalSalvarConfig/Index";

import "./styles.css";


export default function Config() {
  const [perfil, setPerfil] = useState({
    nome: "Amanda Maia Soares",
    email: "amanda.maia@sefaz.ma.gov.br",
    empresa: "Sefaz MA",
    notificacoes: true,
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [mensagemSalvar, setMensagemSalvar] = useState("Configurações salvas com sucesso!");

  // --- FUNÇÕES ---
  const handleChange = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil({ ...perfil, [evento.target.name]: evento.target.value });
  };

  const handleSave = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
  
    setMensagemSalvar("Suas informações de perfil foram atualizadas!"); 
    setShowSaveModal(true); 
  };

  const handleUpdatePassword = () => {
    setMensagemSalvar("Sua senha foi alterada com sucesso!"); 
    setShowSaveModal(true);
  };
  const confirmarSalvar = () => {
    console.log("Dados salvos no sistema:", perfil);
  
    setShowSaveModal(false);
    setShowSuccessModal(true);
  };


  const confirmarExclusao = () => {
    console.log("Conta excluída definitivamente");
    setShowDeleteModal(false);
    // Redirecionar para login
  };

  return (
    <div className="dashboard-container">
      
      <main className="main-content">
        <header className="page-header">
          <h1>Configurações</h1>
          <p>Gerencie seus dados e preferências da conta.</p>
        </header>

        <div className="settings-grid">
          {/* PERFIL */}
          <section className="settings-card">
            <div className="card-header-settings"><h3>Meus Dados</h3></div>
            <div className="card-body-settings">
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input type="text" name="nome" value={perfil.nome} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={perfil.email} disabled className="input-disabled" />
                </div>
                <div className="form-group">
                  <label>Organização</label>
                  <input type="text" name="empresa" value={perfil.empresa} onChange={handleChange} />
                </div>
                <button type="submit" className="btn-save outline">Salvar Alterações</button>
              </form>
            </div>
          </section>

          {/* SEGURANÇA */}
          <section className="settings-card">
            <div className="card-header-settings"><h3>Segurança</h3></div>
            <div className="card-body-settings">
              <div className="form-group">
                <label>Senha Atual</label>
                <input type="password" placeholder="••••••" />
              </div>
              <div className="form-group">
                <label>Nova Senha</label>
                <input type="password" placeholder="Nova senha" />
              </div>
              <button className="btn-save outline" onClick={handleUpdatePassword}>Atualizar Senha</button>
            </div>
          </section>

          {/* ZONA DE PERIGO */}
          <section className="settings-card danger-zone">
            <div className="card-header-settings"><h3>Zona de Perigo</h3></div>
            <div className="card-body-settings">
              <p>Uma vez deletada, sua conta não pode ser recuperada.</p>
              <br />
              <button className="btn-delete" 
                onClick={() => setShowDeleteModal(true)}>
                Excluir Minha Conta
              </button>
            </div>
          </section>
        </div>

        {/* MODAIS */}
        <ModalSalvarConfig 
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onConfirm={confirmarSalvar} 
        />

        <ModalExcluirConta 
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmarExclusao}
        />
    
        <ModalSucessoConfig 
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          mensagem={mensagemSalvar}
        />

      </main>
    </div>
  );
}