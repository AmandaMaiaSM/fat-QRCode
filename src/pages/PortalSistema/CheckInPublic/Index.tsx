import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./styles.css";

type Participante = {
  id: number;
  nome: string;
  email: string;
  hora: string;
  [key: string]: string | number; // Permite campos extras dinâmicos
};

type Campo = {
  id: number;
  label: string;
  name: string;
};

type Evento = {
  id: string;
  nome: string;
  data: string;
  hora: string;
  local: string;
  descricao?: string;
  participantes: Participante[];
  camposPersonalizados?: Campo[];
};

type FormCheckIn = {
  nome: string;
  email: string;
  [key: string]: string;
};

export default function CheckInPublic() {
  const { eventoId } = useParams();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [form, setForm] = useState<FormCheckIn>({
    nome: "",
    email: "",
  });
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    const eventos = JSON.parse(localStorage.getItem("meus_eventos") || "[]");
    const eventoEncontrado = eventos.find((ev: Evento) => ev.id === eventoId);
    setEvento(eventoEncontrado);
  }, [eventoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evento) return;

    const eventos = JSON.parse(localStorage.getItem("meus_eventos") || "[]");

    const novosEventos = eventos.map((ev: Evento) => {
      if (ev.id === eventoId) {
        const { nome, email, ...camposExtras } = form;
        const novoParticipante: Participante = {
          id: Date.now(),
          nome,
          email,
          hora: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          ...camposExtras,
        };

        return {
          ...ev,
          participantes: [...(ev.participantes || []), novoParticipante],
        };
      }
      return ev;
    });

    localStorage.setItem("meus_eventos", JSON.stringify(novosEventos));
    setSucesso(true);
  };

  if (!evento) {
    return (
      <div className="checkin-container">
        <h2 className="error-msg">Evento não encontrado.</h2>
      </div>
    );
  }

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <header className="checkin-header">
          <h1>{evento.nome}</h1>
          <p>
            {evento.data} — {evento.local}
          </p>
          {evento.descricao && (
            <p className="checkin-descricao">{evento.descricao}</p>
          )}
        </header>

        {sucesso ? (
          <div className="sucesso-container">
            <div className="icon-check">✓</div>
            <h3>Presença confirmada!</h3>
            <p>Sua participação foi registrada com sucesso.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-voltar"
            >
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
                onChange={handleChange}
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
                onChange={handleChange}
                required
              />
            </div>

            {/* Campos Dinâmicos */}
            {evento.camposPersonalizados?.map((campo) => (
              <div className="input-group" key={campo.id}>
                <label>{campo.label}</label>
                <input
                  type="text"
                  name={campo.name}
                  placeholder={`Digite seu ${campo.label.toLowerCase()}`}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <button type="submit" className="btn-submit">
              Confirmar Presença
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
