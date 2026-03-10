import React, { useState } from "react";
import ModalSucessoConfig from "../../../components/ModalSucessoConfig/Index";
import "./Styles.css";

export default function GerenciarUsuarios() {
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "servidor" // Exemplo de campo extra para API
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handlers dinâmicos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...novoUsuario,
      email: `${novoUsuario.email.trim()}@sefaz.ma.gov.br`,
      dataCadastro: new Date().toISOString()
    };

    try {
      console.log("Payload para API:", payload);
      
      // Chamada real da API:
      // await api.post('/usuarios', payload);
      
      // Simulação de delay da rede
      await new Promise(resolve => setTimeout(resolve, 800));

      setShowSuccessModal(true);
      setNovoUsuario({ nome: "", email: "", senha: "", cargo: "servidor" });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Houve um erro ao processar o cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page-container">
      <main className="admin-main">
        <header className="page-header">
          <h1>Gestão de Acessos</h1>
          <p>Cadastre novos servidores e gerencie permissões do sistema.</p>
        </header>

        <section className="admin-form-card">
          <div className="card-header">
            <h2>Novo Cadastro</h2>
          </div>

          <form onSubmit={handleSubmit} className="dynamic-form">
            <div className="form-grid">
              {/* Nome */}
              <div className="input-block">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: João Silva"
                  value={novoUsuario.nome}
                  onChange={handleChange}
                />
              </div>

              {/* Email Institucional */}
              <div className="input-block">
                <label>E-mail Institucional</label>
                <div className="email-input-group">
                  <input
                    type="text"
                    name="email"
                    required
                    placeholder="usuario.sobrenome"
                    value={novoUsuario.email}
                    onChange={handleChange}
                  />
                  <span className="domain-label">@sefaz.ma.gov.br</span>
                </div>
              </div>

              {/* Senha */}
              <div className="input-block">
                <label>Senha Provisória</label>
                <input
                  type="password"
                  name="senha"
                  required
                  placeholder="••••••••"
                  value={novoUsuario.senha}
                  onChange={handleChange}
                />
              </div>

              {/* Cargo/Perfil (Importante para API) */}
              <div className="input-block">
                <label>Nível de Acesso</label>
                <select name="cargo" value={novoUsuario.cargo} onChange={handleChange}>
                  <option value="admin">Administrador</option>
                  <option value="gestor">Gestor de Área</option>
                </select>
              </div>
            </div>

            <div className="form-footer">
              <button 
                type="submit" 
                className={`btn-primary ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Confirmar Acesso"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <ModalSucessoConfig 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        mensagem={`O usuário ${novoUsuario.nome} foi cadastrado com sucesso.`}
      />
    </div>
  );
}