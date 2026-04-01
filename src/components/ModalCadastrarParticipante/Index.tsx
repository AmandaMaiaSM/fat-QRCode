import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { X } from "lucide-react";

import {
  apiService,
  type CampoInscricao,
  type EventoParticipante,
} from "../../services/api";
import "./Styles.css";

type CadastrarParticipanteFormData = {
  nome: string;
  email: string;
  camposPersonalizados: Record<string, string>;
};

type ModalCadastrarParticipanteProps = {
  isOpen: boolean;
  eventoId: string;
  camposInscricao: CampoInscricao[];
  onClose: () => void;
  onSuccess?: (participante: EventoParticipante) => void;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "Nao foi possivel cadastrar o participante.";
  }

  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  return "Nao foi possivel cadastrar o participante.";
}

function getInitialValues(
  camposInscricao: CampoInscricao[],
): CadastrarParticipanteFormData {
  return {
    nome: "",
    email: "",
    camposPersonalizados: Object.fromEntries(
      camposInscricao.map((campo) => [campo.identificador, ""]),
    ),
  };
}

function valueOrEmpty(value: string) {
  return value?.trim?.() || "";
}

export default function ModalCadastrarParticipante({
  isOpen,
  eventoId,
  camposInscricao,
  onClose,
  onSuccess,
}: ModalCadastrarParticipanteProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CadastrarParticipanteFormData>({
    defaultValues: getInitialValues(camposInscricao),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(getInitialValues(camposInscricao));
    clearErrors();
  }, [isOpen, camposInscricao, reset, clearErrors]);

  const cadastrarParticipanteMutation = useMutation({
    mutationFn: (data: CadastrarParticipanteFormData) =>
      apiService.inscreverParticipante(eventoId, {
        nome: data.nome.trim(),
        email: data.email.trim(),
        camposPersonalizados: Object.fromEntries(
          Object.entries(data.camposPersonalizados || {}).map(([chave, valor]) => [
            chave,
            valueOrEmpty(valor),
          ]),
        ),
      }),
    onSuccess: (eventoAtualizado) => {
      const participanteCadastrado =
        eventoAtualizado.participantes?.[eventoAtualizado.participantes.length - 1];

      if (participanteCadastrado) {
        onSuccess?.(participanteCadastrado);
      }

      onClose();
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CadastrarParticipanteFormData) => {
    try {
      await cadastrarParticipanteMutation.mutateAsync(data);
    } catch (error) {
      setError("root", {
        type: "server",
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="modal-criar-evento-overlay">
      <div className="modal-criar-evento-container">
        <div className="modal-criar-evento-header">
          <div>
            <h2>Cadastrar Participante</h2>
            <p>Adicione manualmente um participante neste evento.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="modal-criar-evento-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-form-grid">
            <label className="modal-form-group">
              <span>Nome</span>
              <input
                type="text"
                {...register("nome", {
                  required: "Informe o nome do participante.",
                })}
              />
              {errors.nome && (
                <small className="modal-form-error">{errors.nome.message}</small>
              )}
            </label>

            <label className="modal-form-group">
              <span>E-mail</span>
              <input
                type="email"
                {...register("email", {
                  required: "Informe o e-mail do participante.",
                })}
              />
              {errors.email && (
                <small className="modal-form-error">{errors.email.message}</small>
              )}
            </label>

            {camposInscricao.map((campo) => (
              <label key={campo.identificador} className="modal-form-group">
                <span>{campo.rotulo}</span>
                <input
                  type="text"
                  {...register(`camposPersonalizados.${campo.identificador}`)}
                />
              </label>
            ))}
          </div>

          {errors.root?.message && (
            <div className="modal-submit-error">{errors.root.message}</div>
          )}

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="modal-submit-btn"
              disabled={cadastrarParticipanteMutation.isPending}
            >
              {cadastrarParticipanteMutation.isPending
                ? "Cadastrando..."
                : "Cadastrar participante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
