import type { ReactNode } from "react";

import "./styles.css";

type CardEventoProps = {
  nome: string;
  data: string;
  local: string;
  descricao?: string;
  quantidadeParticipantes?: number;
  actions?: ReactNode;
};

export default function CardEvento({
  nome,
  data,
  local,
  descricao,
  quantidadeParticipantes = 0,
  actions,
}: CardEventoProps) {
  return (
    <article className="card-evento">
      <div className="card-evento-topo">
        <div>
          <p className="card-evento-label">Evento</p>
          <h3>{nome}</h3>
        </div>
        <span className="card-evento-badge">
          {quantidadeParticipantes} participante{quantidadeParticipantes === 1 ? "" : "s"}
        </span>
      </div>

      <div className="card-evento-info">
        <div>
          <span>Data</span>
          <strong>{data}</strong>
        </div>

        <div>
          <span>Local</span>
          <strong>{local}</strong>
        </div>
      </div>

      {descricao && <p className="card-evento-descricao">{descricao}</p>}

      {actions && <div className="card-evento-actions">{actions}</div>}
    </article>
  );
}
