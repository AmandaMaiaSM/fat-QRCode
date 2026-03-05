import qrCodeImg from "../../../assets/QRcode02.png";
import { NavLink, useNavigate } from "react-router-dom";
import "./styles.css";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      
      {/* HEADER  */}
      <div className="Cabecalho">
        <header className="header">
           
            <img src={qrCodeImg} alt="Logo" className="logo-img" /> 
           <div style={{flex: 1}}></div> 
           
           <button 
             className="btn-header"
             onClick={() => navigate("/portallogin")}
           >
             Voltar
           </button>
        </header>
      </div>

      <main className="login-card">
        
        {/* LADO ESQUERDO */}
        <div className="login-left">
          <img src={qrCodeImg} alt="QR Presença" className="login-logo" />
          <h1>Bem-vindo ao<br />QR Presença</h1>
          <p>Faça login para continuar</p>
        </div>

        {/* LADO DIREITO */}
        <div className="login-right">
          <h2 className="botao_direta">Entrar</h2>

          <form className="login-form">
            <label>
              Email
              <input type="email" placeholder="seu @sefaz.ma.gov.br" />
            </label>

            <label>
              Senha
              <input type="password" placeholder="••••••••" />
            </label>

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Lembrar-me
              </label>
              <NavLink to="/portallogin/esqueci-senha">Esqueci a senha</NavLink>
            </div>

            <button type="submit" className="btn-login">
              Entrar
            </button>
          </form>
        </div>
      </main>

    </div>
  );
}