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

type EditarParticipanteFormData = {
  nome: string;
  email: string;
  camposPersonalizados: Record<string, string>;
};

type ModalEditarParticipanteProps = {
  isOpen: boolean;
  eventoId: string;
  participante: EventoParticipante | null;
  camposInscricao: CampoInscricao[];
  onClose: () => void;
  onSuccess?: (participante: EventoParticipante) => void;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "Nao foi possivel atualizar o participante.";
  }

  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  return "Nao foi possivel atualizar o participante.";
}

function getInitialValues(
  participante: EventoParticipante | null,
  camposInscricao: CampoInscricao[],
): EditarParticipanteFormData {
  const camposPersonalizados = Object.fromEntries(
    camposInscricao.map((campo) => [
      campo.identificador,
      participante?.camposPersonalizados?.[campo.identificador] || "",
    ]),
  );

  return {
    nome: participante?.nome || "",
    email: participante?.email || "",
    camposPersonalizados,
  };
}

export default function ModalEditarParticipante({
  isOpen,
  eventoId,
  participante,
  camposInscricao,
  onClose,
  onSuccess,
}: ModalEditarParticipanteProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditarParticipanteFormData>({
    defaultValues: getInitialValues(participante, camposInscricao),
  });

  useEffect(() => {
    reset(getInitialValues(participante, camposInscricao));
  }, [participante, camposInscricao, reset]);

  const editarParticipanteMutation = useMutation({
    mutationFn: ({
      participanteId,
      data,
      token,
    }: {
      participanteId: string;
      data: EditarParticipanteFormData;
      token: string;
    }) =>
      apiService.atualizarParticipante(
        eventoId,
        participanteId,
        {
          nome: data.nome.trim(),
          email: data.email.trim(),
          camposPersonalizados: Object.fromEntries(
            Object.entries(data.camposPersonalizados || {}).map(([chave, valor]) => [
              chave,
              valueOrEmpty(valor),
            ]),
          ),
        },
        token,
      ),
    onSuccess: (participanteAtualizado) => {
      onSuccess?.(participanteAtualizado);
      onClose();
    },
  });

  if (!isOpen || !participante) return null;

  const onSubmit = async (data: EditarParticipanteFormData) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("root", {
        type: "manual",
        message: "Voce precisa estar autenticado para editar participantes.",
      });
      return;
    }

    try {
      await editarParticipanteMutation.mutateAsync({
        participanteId: String(participante._id || participante.id),
        data,
        token,
      });
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
            <h2>Editar Participante</h2>
            <p>Atualize os dados do participante selecionado.</p>
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
              <label
                key={campo.identificador}
                className="modal-form-group"
              >
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
              disabled={editarParticipanteMutation.isPending}
            >
              {editarParticipanteMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function valueOrEmpty(value: string) {
  return value?.trim?.() || "";
}
