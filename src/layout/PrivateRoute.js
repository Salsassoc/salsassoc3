import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
    const location = useLocation();
    const auth = localStorage.getItem('user');

      console.log(location, auth);

    if(auth){
        // If authorized, return an outlet that will render child elements
        return <Outlet />;
    }

    // If not, return element that will navigate to login page
    return auth ? <Outlet /> : <Navigate to="/login" replace state={{from: location}} />;
}

export default PrivateRoute;