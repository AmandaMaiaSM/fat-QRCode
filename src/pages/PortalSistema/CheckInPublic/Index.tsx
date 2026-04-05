import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "react-router-dom";

import logoCheckList from "../../../assets/logoCheckList.png";
import {
  apiService,
  type Evento,
  type InscreverParticipantePayload,
} from "../../../services/api";
import "./styles.css";

type FormCheckIn = {
  nome: string;
  email: string;
  camposPersonalizados: Record<string, string>;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "Nao foi possivel registrar sua presenca.";
  }

  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  return "Nao foi possivel registrar sua presenca.";
}

function formatarDataHora(valor: string) {
  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export default function CheckInPublic() {
  const { eventoId } = useParams();
  const [sucesso, setSucesso] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    data: evento,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["checkin-evento", eventoId],
    queryFn: () => apiService.obterEventoPorId(eventoId as string),
    enabled: Boolean(eventoId),
  });

  const initialForm = useMemo<FormCheckIn>(() => {
    const campos =
      evento?.camposInscricao?.reduce<Record<string, string>>((acc, campo) => {
        acc[campo.identificador] = "";
        return acc;
      }, {}) || {};

    return {
      nome: "",
      email: "",
      camposPersonalizados: campos,
    };
  }, [evento]);

  const [form, setForm] = useState<FormCheckIn>({
    nome: "",
    email: "",
    camposPersonalizados: {},
  });

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const mutation = useMutation({
    mutationFn: (payload: InscreverParticipantePayload) =>
      apiService.inscreverParticipante(eventoId as string, payload),
    onSuccess: () => {
      setSucesso(true);
      setSubmitError("");
      setForm(initialForm);
    },
  });

  const eventoAtual = evento as Evento | undefined;

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCampoChange = (
    identificador: string,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      camposPersonalizados: {
        ...prev.camposPersonalizados,
        [identificador]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoId || !eventoAtual) return;

    const payload: InscreverParticipantePayload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      camposPersonalizados: Object.fromEntries(
        (eventoAtual.camposInscricao || []).map((campo) => [
          campo.identificador,
          form.camposPersonalizados[campo.identificador]?.trim() || "",
        ]),
      ),
    };

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const handleNovoRegistro = () => {
    setSucesso(false);
    setSubmitError("");
    setForm(initialForm);
  };

  if (isLoading) {
    return (
      <div className="checkin-container">
        <div className="checkin-card">
          <h2 className="error-msg">Carregando evento...</h2>
        </div>
      </div>
    );
  }

  if (isError || !eventoAtual) {
    return (
      <div className="checkin-container">
        <div className="checkin-card">
          <h2 className="error-msg">
            {error instanceof Error
              ? error.message
              : "Evento nao encontrado."}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-container">
      <div className="checkin-card">

        <header className="checkin-header">
          <img src={logoCheckList} alt="Logo do Evento" className="checkin-logo" />
          <h1>{eventoAtual.nome}</h1>
          <p>
            {formatarDataHora(eventoAtual.data)} - {eventoAtual.local || "Local nao informado"}
          </p>
          {eventoAtual.descricao && (
            <p className="checkin-descricao">{eventoAtual.descricao}</p>
          )}
        </header>

        {sucesso ? (
          <div className="sucesso-container">
            <div className="icon-check">OK</div>
            <h3>Presença confirmada!</h3>
            <p>Sua participacao foi registrada com sucesso.</p>
            <button onClick={handleNovoRegistro} className="btn-voltar">
              Novo Registro
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkin-form">
            <div className="input-group">
              <label>Nome Completo</label>
              <input
                type="text"
                name="nome"
                placeholder="Ex: Amanda Maia"
                value={form.nome}
                onChange={handleBaseChange}
                required
              />
            </div>

            <div className="input-group">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleBaseChange}
                required
              />
            </div>

            {eventoAtual.camposInscricao?.map((campo) => (
              <div className="input-group" key={campo.identificador}>
                <label>{campo.rotulo}</label>
                <input
                  type="text"
                  name={campo.identificador}
                  placeholder={`Digite ${campo.rotulo.toLowerCase()}`}
                  value={form.camposPersonalizados[campo.identificador] || ""}
                  onChange={(e) =>
                    handleCampoChange(campo.identificador, e.target.value)
                  }
                  required
                />
              </div>
            ))}

            {submitError && <div className="submit-error">{submitError}</div>}

            <button
              type="submit"
              className="btn-submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Enviando..." : "Confirmar Presenca"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
