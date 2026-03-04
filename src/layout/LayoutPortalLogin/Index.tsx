import { Outlet } from "react-router-dom";
import "./styles.css";

export default function LayoutPortalLogin() {
  return (
    <div className="layout-login">
      <main className="layout-login-main">
        <Outlet />
      </main>
    </div>
  );
}