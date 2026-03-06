import React, { useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import "./styles.css";

type ModalQRCodeProps = {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  nomeEvento: string;
};

const ModalQRCode: React.FC<ModalQRCodeProps> = ({
  isOpen,
  onClose,
  qrValue,
  nomeEvento,
}) => {
  const qrRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const baixarQR = () => {
    const node = qrRef.current;
    if (!node) return;

    toPng(node, { cacheBust: true, backgroundColor: "white" })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `qrcode-${nomeEvento}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error("Erro ao baixar QR Code", err));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h3>QR Code: {nomeEvento}</h3>

        <div
          ref={qrRef}
          className="qr-display-area"
          style={{ background: "white", padding: "20px" }}
        >
          <QRCode value={qrValue} size={200} />
        </div>

        <div className="modal-buttons">
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
          <button className="btn-confirmar" onClick={baixarQR}>
            Baixar Imagem
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalQRCode;