# FAT QRCode — Portal de Eventos e Presenças

Aplicação web para gestão de eventos com foco em:
- geração/uso de QR Code para check-in;
- visualização e edição de participantes;
- lista de presença;
- registro manual de presenças com campos adicionais dinâmicos.

## Status do Projeto

🚧 Em evolução (frontend funcional com dados locais e componentes de modal).

## Funcionalidades implementadas (frontend)

- **Meus Eventos**
  - listagem de eventos;
  - busca por nome;
  - abrir modal de **Lista de Presença**;
  - ações por participante (editar, adicionar, excluir);
  - modais auxiliares:
    - confirmação de exclusão,
    - edição de evento,
    - exibição de QR Code,
    - download.

- **Registrar Presenças**
  - cadastro manual de participantes;
  - campos padrão: `nome`, `email`, `telefone`;
  - criação de **campos adicionais dinâmicos** (ex.: CPF, Matrícula, Setor);
  - remoção de campos adicionais;
  - múltiplos participantes no mesmo formulário.

## Stack

- **React**
- **TypeScript**
- **CSS**
- **React Router** (navegação entre páginas)

## Estrutura (resumo)

```text
fat-QRCode/
├─ src/
│  ├─ components/
│  │  ├─ ModalEditarEvento/
│  │  ├─ ModalConfirmacao/
│  │  ├─ ModalQRCode/
│  │  └─ ModalDownload/
│  └─ pages/
│     └─ PortalSistema/
│        ├─ MeusEventos/
│        └─ RegistrarPresencas/
└─ ...
```

## Como rodar localmente (Windows / VS Code)

```bash
cd "c:\Users\amand\OneDrive\Desktop\QRCODE-VersaoF\fat-QRCode"
npm install
npm run dev
```

A aplicação iniciará em uma URL local (normalmente `http://localhost:5173`).

## Scripts comuns

```bash
npm run dev
npm run build
npm run preview
```
## Resultado 


## Autora

Projeto desenvolvido por **Amanda Maia Soares Silva**.
