import { Navigate, Outlet } from "react-router-dom";
import { NotAuthorized } from "../pages/common/NotAuthorized";
import LayoutSistema from "../layout/LayoutSistema/Index";


interface PrivateRouteProps {
    permissions?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = () => {
    const isUserLoggedIn = localStorage.getItem('auth_user') 

    if (!isUserLoggedIn) {
        return <Navigate to="/portallogin/login" />;
    }

    return (
        <LayoutSistema />
    ) 
}

// export const PublicRoute: React.FC = () => {
//     const isUserLoggedIn = true; // Replace with actual login check

//     return isUserLoggedIn ? (
//         <LayoutSistema>
//             <Outlet />
//         </Layout>
//     ) : (
//         <Navigate to='/login' />
//     );
// }