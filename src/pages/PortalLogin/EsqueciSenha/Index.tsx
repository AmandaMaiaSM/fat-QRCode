import React from "react";
import "./styles.css";
import qrCodeImg from "../../../assets/QRcode02.png"; 
import { useNavigate } from "react-router-dom";

export default function EsqueciSenha() {
  const navigate = useNavigate();

  // lógica de integração com o backend para envio do link de recuperação
  const handleRecuperar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Enviamos um link de recuperação para o seu e-mail!");
    navigate("/portallogin/login");
  };

  return (
    <div className="forgot-container">
      
      {/* HEADER */}
      <div className="Cabecalho">
        <header className="header">
          <div style={{flex: 1}}></div> 
          <button 
            className="btn-header"
            onClick={() => navigate("/portallogin/login")} 
          >
            Voltar ao Login
          </button>
        </header>
      </div>

      {/* CARTÃO CENTRAL */}
      <main className="forgot-card">
        
        {/* LADO ESQUERDO */}
        <div className="forgot-left">
          <img src={qrCodeImg} alt="QR Presença" className="forgot-logo" />
          <h1>Recuperação<br />de Senha</h1>
          <p>Não se preocupe, vamos ajudar você a recuperar seu acesso.</p>
        </div>

        {/* LADO DIREITO */}
        <div className="forgot-right">
          <h2>Esqueceu a senha?</h2>
          <p className="instruction-text">
            Digite seu e-mail cadastrado abaixo para receber as instruções de redefinição.
          </p>

          <form className="forgot-form" onSubmit={handleRecuperar}>
            <label>
              E-mail
              <input type="email" placeholder="seu@email.com" required />
            </label>

            <button type="submit" className="btn-send">
              Enviar Link
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
