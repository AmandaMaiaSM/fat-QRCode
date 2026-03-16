export interface Participante {
  id: number
  nome: string
  email: string
  hora: string
  [key: string]: string | number
}

export interface CampoPersonalizado {
  id: number
  label: string
  name: string
}

export interface Evento {
  id: number
  nome: string
  data: string
  local: string
  participantes: Participante[]
  qrCodeValue?: string
  camposPersonalizados?: CampoPersonalizado[]
}