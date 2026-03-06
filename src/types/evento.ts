export interface Participante {
  id: number
  nome: string
  email: string
  hora: string
}

export interface Evento {
  id: number
  nome: string
  data: string
  local: string
  participantes: Participante[]
  qrCodeValue?: string
}