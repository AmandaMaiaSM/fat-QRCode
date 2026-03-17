import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

import {
    Menu,
    LayoutDashboard,
    CalendarDays,
    Plus,
    UserPen,
    IdCard,
    Settings,
    CirclePower,  
    
} from "lucide-react";


import './Styles.css';

export default function SiderBar() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(true);

  // O NavLink do React Router já providencia o estado de ativo automaticamente
  const navClass = ({ isActive }: { isActive: boolean }) => 
    `nav-item ${isActive ? 'active' : ''}`;

  return (
    <aside className={`sidebar ${activeMenu ? 'aberto' : 'fechado'}`}>

      <div className='sidebar-header'>
        <Menu className="menu-icon" onClick={() => setActiveMenu(prev => !prev)} />
        {activeMenu && <h2>QR Presença</h2>}
      </div>

      <nav className='sidebar-nav'>
        <NavLink title="Dashboard" to="/sistemaQR/dashboard" className={navClass}>
          <LayoutDashboard className="nav-icon" />
          {activeMenu && <span>Dashboard</span>}
        </NavLink>
        
        <NavLink title="Meus Eventos" to="/sistemaQR/meus-eventos" className={navClass}>
          <CalendarDays className="nav-icon" />
          {activeMenu && <span>Meus Eventos</span>}
        </NavLink>
        
        <NavLink title="Criar Evento" to="/sistemaQR/criar-evento" className={navClass}>
          <Plus className="nav-icon" />
          {activeMenu && <span>Criar Evento</span>}
        </NavLink>

        <NavLink title='Registrar Presenças' to="/sistemaQR/registrar-presencas" className={navClass}>
          <UserPen className="nav-icon" />
          {activeMenu && <span>Registrar Presenças</span>}
        </NavLink>

        <NavLink title='Emitir Certificado' to="/sistemaQR/emitir-certificado" className={navClass}>
          <IdCard className="nav-icon" />
          {activeMenu && <span>Emitir Certificado</span>}
        </NavLink>

        <NavLink title='Emitir certificado 02' to="/sistemaQR/emitir-certificado-02" className={navClass}>
          <IdCard className="nav-icon" />
          {activeMenu && <span>Emitir Certificado 02</span>}
        </NavLink>

        <NavLink title='Configurações' to="/sistemaQR/configuracoes" className={navClass}>  
            <Settings className="nav-icon" />
            {activeMenu && <span>Configurações</span>}
        </NavLink>

        
      </nav>

      <div className='sidebar-footer'>
        <NavLink title='Sair' to="/sistemaQR/sair" className="logout-btn">
            <CirclePower  className="logout-btn" />
        </NavLink>
      </div>
    </aside>
  );
}