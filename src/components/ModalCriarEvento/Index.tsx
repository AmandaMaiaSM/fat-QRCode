import { useMutation } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { X } from "lucide-react";
import { AxiosError } from "axios";

import {
  apiService,
  type CampoInscricao,
  type CriarEventoPayload,
  type Evento,
} from "../../services/api";
import "./Styles.css";

type CampoForm = CampoInscricao & {
};

type CriarEventoFormData = {
  nome: string;
  descricao: string;
  local: string;
  data: string;
  hora: string;
  camposInscricao: CampoForm[];
};

type ModalCriarEventoProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (evento: Evento) => void;
};

const defaultCampo = (): CampoForm => ({
  identificador: "",
  rotulo: "",
});

function getErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return "Nao foi possivel criar o evento.";
  }

  const responseData = error.response?.data;

  if (typeof responseData?.message === "string") {
    return responseData.message;
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  return "Nao foi possivel criar o evento.";
}

export default function ModalCriarEvento({
  isOpen,
  onClose,
  onSuccess,
}: ModalCriarEventoProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CriarEventoFormData>({
    defaultValues: {
      nome: "",
      descricao: "",
      local: "",
      data: "",
      hora: "",
      camposInscricao: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "camposInscricao",
  });

  const criarEventoMutation = useMutation({
    mutationFn: ({ data, token }: { data: CriarEventoPayload; token: string }) =>
      apiService.criarEvento(data, token),
    onSuccess: (eventoCriado) => {
      onSuccess?.(eventoCriado);
      reset({
        nome: "",
        descricao: "",
        local: "",
        data: "",
        hora: "",
        camposInscricao: [],
      });
      onClose();
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CriarEventoFormData) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("root", {
        type: "manual",
        message: "Voce precisa estar autenticado para criar um evento.",
      });
      return;
    }

    const camposInscricao = data.camposInscricao
      .map(({ identificador, rotulo }) => ({
        identificador: identificador.trim(),
        rotulo: rotulo.trim(),
      }))
      .filter((campo) => campo.identificador || campo.rotulo);

    const dataComHora = data.hora
      ? `${data.data}T${data.hora}:00`
      : data.data;

    const payload: CriarEventoPayload = {
      nome: data.nome.trim(),
      descricao: data.descricao.trim(),
      local: data.local.trim(),
      data: dataComHora,
      camposInscricao,
    };

    try {
      await criarEventoMutation.mutateAsync({ data: payload, token });
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
            <h2>Criar Evento</h2>
            <p>Preencha os dados do evento e configure os campos da inscricao.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          className="modal-criar-evento-form"
          onSubmit={handleSubmit(onSubmit)}
        >
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

          <div className="modal-campos-section">
            <div className="modal-campos-header">
              <div>
                <h3>Campos de inscricao</h3>
                <p>Adicione campos extras opcionais para o formulario do participante.</p>
              </div>
              <button
                type="button"
                className="modal-add-campo-btn"
                onClick={() => append(defaultCampo())}
              >
                Adicionar campo
              </button>
            </div>

            <div className="modal-campos-list">
              {fields.map((field, index) => (
                <div className="modal-campo-item" key={field.id}>
                  <label className="modal-form-group">
                    <span>Identificador</span>
                    <input
                      type="text"
                      placeholder="empresa"
                      {...register(`camposInscricao.${index}.identificador`, {
                        required: "Informe o identificador do campo.",
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message:
                            "Use apenas letras sem acento, numeros e _. Nao use espacos.",
                        },
                      })}
                    />
                    {errors.camposInscricao?.[index]?.identificador && (
                      <small className="modal-form-error">
                        {errors.camposInscricao[index]?.identificador?.message}
                      </small>
                    )}
                  </label>

                  <label className="modal-form-group">
                    <span>Rotulo</span>
                    <input
                      type="text"
                      placeholder="Empresa"
                      {...register(`camposInscricao.${index}.rotulo`, {
                        required: "Informe o rotulo do campo.",
                      })}
                    />
                    {errors.camposInscricao?.[index]?.rotulo && (
                      <small className="modal-form-error">
                        {errors.camposInscricao[index]?.rotulo?.message}
                      </small>
                    )}
                  </label>

                  <button
                    type="button"
                    className="modal-remove-campo-btn"
                    onClick={() => remove(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
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
              disabled={criarEventoMutation.isPending}
            >
              {criarEventoMutation.isPending ? "Criando..." : "Criar evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
