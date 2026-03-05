
import { Outlet } from 'react-router-dom';

import SiderBar from '../../components/SiderBar/Index'; 
import './Styles.css';

export default function LayoutSistema() {
    return (
        <div className='layout-sistema'>
            <SiderBar />

           <main className='Layout-main'>
                <Outlet />
           </main>  
        </div>
    );
}