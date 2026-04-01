import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CirclePower,
  IdCard,
  LayoutDashboard,
  Menu,
  Settings,
  UserPen,
} from "lucide-react";

import "./Styles.css";

export default function SiderBar() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(true);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item ${isActive ? "active" : ""}`;

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    navigate("/portallogin/login", { replace: true });
  };

  return (
    <aside className={`sidebar ${activeMenu ? "aberto" : "fechado"}`}>
      <div className="sidebar-header">
        <Menu className="menu-icon" onClick={() => setActiveMenu((prev) => !prev)} />
        {activeMenu && <h2>QR Presenca</h2>}
      </div>

      <nav className="sidebar-nav">
        <NavLink title="Dashboard" to="/sistemaQR/dashboard" className={navClass}>
          <LayoutDashboard className="nav-icon" />
          {activeMenu && <span>Dashboard</span>}
        </NavLink>

        <NavLink title="Meus Eventos" to="/sistemaQR/meus-eventos" className={navClass}>
          <CalendarDays className="nav-icon" />
          {activeMenu && <span>Meus Eventos</span>}
        </NavLink>

        <NavLink
          title="Emitir Certificado"
          to="/sistemaQR/emitir-certificado"
          className={navClass}
        >
          <IdCard className="nav-icon" />
          {activeMenu && <span>Emitir Certificado</span>}
        </NavLink>

        <NavLink
          title="Emitir Certificado 02"
          to="/sistemaQR/emitir-certificado-02"
          className={navClass}
        >
          <IdCard className="nav-icon" />
          {activeMenu && <span>Emitir Certificado 02</span>}
        </NavLink>

        <NavLink title="Configuracoes" to="/sistemaQR/configuracoes" className={navClass}>
          <Settings className="nav-icon" />
          {activeMenu && <span>Configuracoes</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          title="Sair"
          className="logout-btn"
          onClick={handleLogout}
        >
          <CirclePower className="logout-icon" />
          {activeMenu && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
