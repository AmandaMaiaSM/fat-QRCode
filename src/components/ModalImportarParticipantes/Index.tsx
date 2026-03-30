import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { X } from "lucide-react";

import type {
  CampoInscricao,
  InscreverParticipantePayload,
} from "../../services/api";
import "./Styles.css";

type ParticipanteImportacao = InscreverParticipantePayload & {
  __rowId: string;
};

type ModalImportarParticipantesProps = {
  isOpen: boolean;
  participantes: InscreverParticipantePayload[];
  camposInscricao: CampoInscricao[];
  errorMessage?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (participantes: InscreverParticipantePayload[]) => Promise<void> | void;
};

const columnHelper = createColumnHelper<ParticipanteImportacao>();

function buildInitialSelection(participantes: ParticipanteImportacao[]) {
  return participantes.reduce<RowSelectionState>((acc, participante) => {
    acc[participante.__rowId] = true;
    return acc;
  }, {});
}

export default function ModalImportarParticipantes({
  isOpen,
  participantes,
  camposInscricao,
  errorMessage,
  isSubmitting = false,
  onClose,
  onConfirm,
}: ModalImportarParticipantesProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const data = useMemo<ParticipanteImportacao[]>(
    () =>
      participantes.map((participante, index) => ({
        ...participante,
        __rowId: `${participante.email}-${index}`,
      })),
    [participantes],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRowSelection(buildInitialSelection(data));
  }, [isOpen, data]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            ref={(element) => {
              if (element) {
                element.indeterminate = table.getIsSomeRowsSelected();
              }
            }}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Selecionar todos os participantes"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Selecionar ${row.original.nome}`}
          />
        ),
      }),
      columnHelper.accessor("nome", {
        header: "Nome",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "E-mail",
        cell: (info) => info.getValue(),
      }),
      ...camposInscricao.map((campo) =>
        columnHelper.display({
          id: campo.identificador,
          header: campo.rotulo,
          cell: ({ row }) =>
            row.original.camposPersonalizados?.[campo.identificador] || "-",
        }),
      ),
    ],
    [camposInscricao],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.__rowId,
  });

  const participantesSelecionados = table
    .getSelectedRowModel()
    .rows.map((row) => {
      const { __rowId, ...participante } = row.original;
      return participante;
    });

  const handleConfirm = async () => {
    await onConfirm(participantesSelecionados);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-criar-evento-overlay">
      <div className="modal-criar-evento-container modal-importar-participantes-container">
        <div className="modal-criar-evento-header">
          <div>
            <h2>Confirmar importacao</h2>
            <p>Revise a planilha e envie apenas os participantes marcados.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-importar-resumo">
          <div className="modal-importar-pill">
            {participantes.length} encontrado
            {participantes.length === 1 ? "" : "s"}
          </div>
          <div className="modal-importar-pill modal-importar-pill-selected">
            {participantesSelecionados.length} selecionado
            {participantesSelecionados.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="modal-importar-table-wrapper">
          <table className="modal-importar-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      data-label={String(cell.column.columnDef.header)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {errorMessage && (
          <div className="modal-submit-error">{errorMessage}</div>
        )}

        <div className="modal-actions">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="modal-submit-btn"
            onClick={handleConfirm}
            disabled={isSubmitting || participantesSelecionados.length === 0}
          >
            {isSubmitting
              ? "Importando..."
              : `Importar ${participantesSelecionados.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}
