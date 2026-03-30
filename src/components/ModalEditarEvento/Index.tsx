import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { X } from "lucide-react";

import {
  apiService,
  type AtualizarEventoPayload,
  type Evento,
} from "../../services/api";
import "./Styles.css";

type EditarEventoFormData = {
  nome: string;
  descricao: string;
  local: string;
  data: string;
  hora: string;
};

type ModalEditarEventoProps = {
  isOpen: boolean;
  evento: Evento | null;
  onClose: () => void;
  onSuccess?: (evento: Evento) => void;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "Nao foi possivel atualizar o evento.";
  }

  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  return "Nao foi possivel atualizar o evento.";
}

function getInitialValues(evento: Evento | null): EditarEventoFormData {
  if (!evento) {
    return {
      nome: "",
      descricao: "",
      local: "",
      data: "",
      hora: "",
    };
  }

  const dataEvento = new Date(evento.data);
  const data = Number.isNaN(dataEvento.getTime())
    ? ""
    : dataEvento.toISOString().slice(0, 10);
  const hora = Number.isNaN(dataEvento.getTime())
    ? ""
    : dataEvento.toTimeString().slice(0, 5);

  return {
    nome: evento.nome || "",
    descricao: evento.descricao || "",
    local: evento.local || "",
    data,
    hora,
  };
}

export default function ModalEditarEvento({
  isOpen,
  evento,
  onClose,
  onSuccess,
}: ModalEditarEventoProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditarEventoFormData>({
    defaultValues: getInitialValues(evento),
  });

  useEffect(() => {
    reset(getInitialValues(evento));
  }, [evento, reset]);

  const editarEventoMutation = useMutation({
    mutationFn: ({
      eventoId,
      data,
      token,
    }: {
      eventoId: string;
      data: AtualizarEventoPayload;
      token: string;
    }) => apiService.atualizarEvento(eventoId, data, token),
    onSuccess: (eventoAtualizado) => {
      onSuccess?.(eventoAtualizado);
      onClose();
    },
  });

  if (!isOpen || !evento) return null;

  const onSubmit = async (data: EditarEventoFormData) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("root", {
        type: "manual",
        message: "Voce precisa estar autenticado para editar um evento.",
      });
      return;
    }

    const payload: AtualizarEventoPayload = {
      nome: data.nome.trim(),
      descricao: data.descricao.trim(),
      local: data.local.trim(),
      data: `${data.data}T${data.hora}:00`,
    };

    try {
      await editarEventoMutation.mutateAsync({
        eventoId: String(evento._id || evento.id),
        data: payload,
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
            <h2>Editar Evento</h2>
            <p>Atualize apenas nome, descricao, local, data e horario.</p>
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
                  required: "Informe o nome do evento.",
                })}
              />
              {errors.nome && (
                <small className="modal-form-error">{errors.nome.message}</small>
              )}
            </label>

            <label className="modal-form-group">
              <span>Data</span>
              <input
                type="date"
                {...register("data", {
                  required: "Informe a data do evento.",
                })}
              />
              {errors.data && (
                <small className="modal-form-error">{errors.data.message}</small>
              )}
            </label>

            <label className="modal-form-group">
              <span>Horario</span>
              <input
                type="time"
                {...register("hora", {
                  required: "Informe o horario do evento.",
                })}
              />
              {errors.hora && (
                <small className="modal-form-error">{errors.hora.message}</small>
              )}
            </label>

            <label className="modal-form-group modal-form-group-full">
              <span>Descricao</span>
              <textarea
                rows={3}
                {...register("descricao", {
                  required: "Informe a descricao do evento.",
                })}
              />
              {errors.descricao && (
                <small className="modal-form-error">
                  {errors.descricao.message}
                </small>
              )}
            </label>

            <label className="modal-form-group modal-form-group-full">
              <span>Local</span>
              <input
                type="text"
                {...register("local", {
                  required: "Informe o local do evento.",
                })}
              />
              {errors.local && (
                <small className="modal-form-error">{errors.local.message}</small>
              )}
            </label>
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
              disabled={editarEventoMutation.isPending}
            >
              {editarEventoMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
