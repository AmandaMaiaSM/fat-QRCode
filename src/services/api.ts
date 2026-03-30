import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL nao foi definida no arquivo .env");
}

type RequestOptions = AxiosRequestConfig & {
  token?: string;
};

export type UserRole = "admin" | "organizer" | string;

export type AuthUser = {
  id: string;
  nome: string;
  email: string;
  roles: UserRole[];
};

export type LoginPayload = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type CampoInscricao = {
  identificador: string;
  rotulo: string;
};

export type EventoParticipante = {
  _id?: string;
  id?: string;
  nome: string;
  email: string;
  camposPersonalizados: Record<string, string>;
};

export type Evento = {
  _id?: string;
  id?: string;
  nome: string;
  descricao?: string;
  local?: string;
  data: string;
  camposInscricao?: CampoInscricao[];
  participantes?: EventoParticipante[];
};

export type CriarEventoPayload = {
  nome: string;
  descricao?: string;
  local?: string;
  data: string;
  camposInscricao?: CampoInscricao[];
};

export type AtualizarEventoPayload = Partial<{
  nome: string;
  descricao: string;
  local: string;
  data: string;
}>;

export type InscreverParticipantePayload = {
  nome: string;
  email: string;
  camposPersonalizados: Record<string, string>;
};

export type AtualizarParticipantePayload = Partial<{
  nome: string;
  email: string;
  camposPersonalizados: Record<string, string>;
}>;

export type HealthcheckResponse = {
  message: string;
};

export type ApiDataResponse<T> = {
  message: string;
  data: T;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function request<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const response = await api.request<T>({
    url: path,
    ...options,
    headers: {
      ...options?.headers,
      ...(options?.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
    },
  });

  return response.data;
}

export const apiService = {
  baseUrl: API_BASE_URL,

  healthcheck() {
    return request<HealthcheckResponse>("/");
  },

  login(data: LoginPayload) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      data,
    });
  },

  listarEventos() {
    return request<ApiDataResponse<Evento[]>>("/eventos", {
      method: "GET",
    }).then((response) => response.data);
  },

  obterEventoPorId(eventoId: string) {
    return request<ApiDataResponse<Evento>>(`/eventos/${eventoId}`, {
      method: "GET",
    }).then((response) => response.data);
  },

  criarEvento(data: CriarEventoPayload, token: string) {
    return request<ApiDataResponse<Evento>>("/eventos", {
      method: "POST",
      data,
      token,
    }).then((response) => response.data);
  },

  atualizarEvento(
    eventoId: string,
    data: AtualizarEventoPayload,
    token: string,
  ) {
    return request<ApiDataResponse<Evento>>(`/eventos/${eventoId}`, {
      method: "PUT",
      data,
      token,
    }).then((response) => response.data);
  },

  inscreverParticipante(eventoId: string, data: InscreverParticipantePayload) {
    return request<ApiDataResponse<Evento>>(`/eventos/${eventoId}/participantes`, {
      method: "POST",
      data,
    }).then((response) => response.data);
  },

  obterParticipantePorId(eventoId: string, participanteId: string) {
    return request<ApiDataResponse<EventoParticipante>>(
      `/eventos/${eventoId}/participantes/${participanteId}`,
      {
        method: "GET",
      },
    ).then((response) => response.data);
  },

  atualizarParticipante(
    eventoId: string,
    participanteId: string,
    data: AtualizarParticipantePayload,
    token: string,
  ) {
    return request<ApiDataResponse<EventoParticipante>>(
      `/eventos/${eventoId}/participantes/${participanteId}`,
      {
        method: "PUT",
        data,
        token,
      },
    ).then((response) => response.data);
  },

  excluirEvento(eventoId: string, token: string) {
    return request<ApiDataResponse<Evento>>(`/eventos/${eventoId}`, {
      method: "DELETE",
      token,
    }).then((response) => response.data);
  },
};

export default api;
