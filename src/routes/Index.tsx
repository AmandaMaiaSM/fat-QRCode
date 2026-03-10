import { Routes, Route, Navigate } from "react-router-dom";


import Home from "../pages/PortalLogin/Home/Index";
import PortalLogin from "../pages/PortalLogin/Login/Index";
import LayoutPortalLogin from "../layout/LayoutPortalLogin/Index";
import EsqueciSenha from "../pages/PortalLogin/EsqueciSenha/Index";

//Rotas do sistema interno
import LayoutSistema from "../layout/LayoutSistema/Index";
import Dashboard from "../pages/PortalSistema/Dashboard/Index";
//import MeusEventos from "../pages/PortalSistema/MeusEventos/Index";

import RegistrarPresencas from "../pages/PortalSistema/RegistrarPresencas/Index";
import EmitirCertificado from "../pages/PortalSistema/EmitirCertificado/Index";
import CriarEvento from "../pages/PortalSistema/CriarEvento/Index";
import Configuracoes from "../pages/PortalSistema/Configuracao/Index";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota para redirecionar para o portal de login */}
      <Route path="/" element={<Navigate to="/portallogin" replace />} />
        <Route path="/portallogin" element={<LayoutPortalLogin />}>
        <Route index element={<Home />} />
        <Route path="login" element={<PortalLogin />} />
        <Route path="esqueci-senha" element={<EsqueciSenha />} />
      </Route>

      {/*Rotas para o sitema interno */}
      <Route path="/sistemaQR" element={<LayoutSistema />}>
        {/*Rotas filhas do sistema interno */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* <Route path="meus-eventos" element={<MeusEventos />} /> */}
        <Route path="registrar-presencas" element={<RegistrarPresencas />} />
        <Route path="emitir-certificado" element={<EmitirCertificado />} />
        <Route path="criar-evento" element={<CriarEvento />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>

      {/* Rota para lidar com páginas não encontradas */}
      <Route path="*" element={<h1>Página não encontrada (404)</h1>} />

    </Routes>
  );
}