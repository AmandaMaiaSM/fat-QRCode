import { Routes, Route } from "react-router-dom";

import Home from "../pages/PortalLogin/Home/Index";
import PortalLogin from "../pages/PortalLogin/Login/Index";
import LayoutPortalLogin from "../layout/LayoutPortalLogin/Index";
import EsqueciSenha from "../pages/PortalLogin/EsqueciSenha/Index";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/portallogin" element={<LayoutPortalLogin />}>
        <Route index element={<Home />} />
        <Route path="login" element={<PortalLogin />} />
        <Route path="esqueci-senha" element={<EsqueciSenha />} />
      </Route>
    </Routes>
  );
}