import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

import qrCodeImg from "../../../assets/QRcode02.png";
import { apiService } from "../../../services/api";
import "./styles.css";

type LoginFormData = {
  email: string;
  senha: string;
};

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      senha: "",
    },
  });
  const loginMutation = useMutation({
    mutationFn: apiService.login,
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);

      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));

      navigate("/sistemaQR/dashboard");
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Nao foi possivel fazer login."
          : "Nao foi possivel fazer login.";

      setError("root", {
        type: "server",
        message,
      });
    }
  };

  return (
    <div className="login-container">
      <div className="Cabecalho">
        <header className="header">
          <img src={qrCodeImg} alt="Logo" className="logo-img" />
          <div style={{ flex: 1 }}></div>

          <button
            className="btn-header"
            onClick={() => navigate("/portallogin")}
          >
            Voltar
          </button>
        </header>
      </div>

      <main className="login-card">
        <div className="login-left">
          <img src={qrCodeImg} alt="QR Presenca" className="login-logo" />
          <h1>
            Bem-vindo ao
            <br />
            QR Presenca
          </h1>
          <p>Faca login para continuar</p>
        </div>

        <div className="login-right">
          <h2 className="botao_direta">Entrar</h2>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <label>
              Email
              <input
                type="email"
                placeholder="seu@sefaz.ma.gov.br"
                {...register("email", {
                  required: "Informe seu e-mail.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Digite um e-mail valido.",
                  },
                })}
              />
              {errors.email && (
                <span className="field-error">{errors.email.message}</span>
              )}
            </label>

            <label>
              Senha
              <input
                type="password"
                placeholder="••••••••"
                {...register("senha", {
                  required: "Informe sua senha.",
                })}
              />
              {errors.senha && (
                <span className="field-error">{errors.senha.message}</span>
              )}
            </label>

            <div className="login-options">
              <NavLink to="/portallogin/esqueci-senha">Esqueci a senha</NavLink>
            </div>

            {errors.root?.message && (
              <div className="form-error">{errors.root.message}</div>
            )}

            <button
              type="submit"
              className="btn-login"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {isSubmitting || loginMutation.isPending
                ? "Entrando..."
                : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
