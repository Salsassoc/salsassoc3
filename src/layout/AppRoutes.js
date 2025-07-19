import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import PrivateRoute from '../layout/PrivateRoute.js';
import NotFound from '../layout/NotFound.js';

import Login from '../pages/Login.js';
import Dashboard from '../pages/Dashboard.js';

export const AppRouteWrapper = ({ component, ...rest }) => {
    const router = {
        navigate: useNavigate(),
        location: useLocation(),
        params: useParams()
    }
    const Component = component;
    return <Component router={router} {...rest} />
};

const AppRoutes = () => {

    const navigate = useNavigate(); 

    function handleLogin(user)
    {
      localStorage.setItem('user', JSON.stringify(user));

      //const { from } = props.router.location.state || { from: { pathname: "/" } };
      const { from } = { from: { pathname: "/" } };
      navigate(from);
    };

    const handleLogout = () => {
      localStorage.removeItem('user');
    };

    let privateRoutesConfig = [
        {
            path: "/",
            element: <AppRouteWrapper component={Dashboard} />,
        },
        {
            path: "/dashboard",
            element: <AppRouteWrapper component={Dashboard} />,
        },
        {
            path: "/settings/fiscal_years",
            element: <AppRouteWrapper component={Dashboard} />,
        },
    ];

    const privateRoutes = privateRoutesConfig.map((routeConfig, idx) => {

        let element = routeConfig.element;

        /*
        if(routeConfig.right != undefined){
            if(!user || !user.hasWebUserRight(routeConfig.right))
            {
                element = <AppRouteWrapper component={Forbidden} />
            }
        }*/

        return (
            <Route
                key={idx}
                exact
                path={routeConfig.path}
                element={element}
            />
        )
    });

    return (
      <Routes>
        <Route exact path='/' element={<PrivateRoute />}>
            {privateRoutes}
        </Route>
        <Route path='/logout' element={<AppRouteWrapper component={Login} onLogin={handleLogin} /> } />
        <Route path='/login' element={<AppRouteWrapper component={Login} onLogin={handleLogin} /> } />
        <Route path="*" element={<AppRouteWrapper component={NotFound} /> } />
      </Routes>
    );
}

export default AppRoutes;
