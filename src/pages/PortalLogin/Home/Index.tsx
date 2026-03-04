import React from "react";
import { useNavigate } from "react-router-dom";
import qrCodeImg from "../../../assets/QRcode02.png";
import phoneImg from "../../../assets/maocelular.png";
import listImg from "../../../assets/list.png";
import "./styles.css";

export  default function Home() {
  const navigate = useNavigate();

  return (
    <div className="start-container">

      {/* HEADER - Mudei a classe aqui para 'header-start' */}
      <header className="header-start">
        <img src={qrCodeImg} alt="QR Presença" className="logo-img" />
        <button 
          className="btn-header"
          onClick={() => navigate("../login")}
        >
            Iniciar
        </button>
      </header>

      {/* HERO */}
      <section className="hero">
        {/* Imagem esquerda */}
        <div className="hero-image">
          <img src={phoneImg} alt="Check-in com QR Code" className="phone-img" />
        </div>

        {/* Conteúdo central */}
        <div className="hero-content">
          <h1>Bem-vindo ao</h1>
          <h1 className="title-highlight">QR Presença</h1>

          <p>
            Gerencie a presença em eventos de forma fácil e eficiente
            através do check-in com QR Code.
          </p>

          <button 
            className="btn-start" 
            onClick={() => navigate("../login")}
            >
                Iniciar
            </button>
        </div>

        {/* Imagem direita */}
        <div className="hero-image">
          <img src={listImg} alt="Lista de presença" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 Sefaz - MA centro de treinamento. Todos os direitos reservados.
      </footer>

    </div>
  );
}