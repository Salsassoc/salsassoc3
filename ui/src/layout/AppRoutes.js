import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";

import PrivateRoute from '../layout/PrivateRoute.js';
import NotFound from '../layout/NotFound.js';

import Login from '../pages/Login.js';
import Logout from '../pages/Logout.js';
import Dashboard from '../pages/dashboard/Dashboard.js';
import FiscalYearsList from '../pages/fiscalyears/FiscalYearsList.js';
import FiscalYearsEdit from '../pages/fiscalyears/FiscalYearsEdit.js';
import CotisationsList from '../pages/cotisations/CotisationsList.js';
import CotisationsEdit from '../pages/cotisations/CotisationsEdit.js';
import AccountingOperationCategoriesList from '../pages/accountingoperationcategories/AccountingOperationCategoriesList.js';
import AccountingOperationCategoriesEdit from '../pages/accountingoperationcategories/AccountingOperationCategoriesEdit.js';
import AccountingAccountsList from '../pages/accountingaccounts/AccountingAccountsList.js';
import AccountingAccountsEdit from '../pages/accountingaccounts/AccountingAccountsEdit.js';
import AccountingOperationsList from '../pages/accountingoperations/AccountingOperationsList.js';
import AccountingOperationsEdit from '../pages/accountingoperations/AccountingOperationsEdit.js';
import MembersList from '../pages/members/MembersList.js';
import MembersEdit from '../pages/members/MembersEdit.js';
import MembershipsList from '../pages/memberships/MembershipsList.js';
import MembershipsEdit from '../pages/memberships/MembershipsEdit.js';

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
            path: "/fiscal_years/list",
            element: <AppRouteWrapper component={FiscalYearsList} />,
        },
        {
            path: "/fiscal_years/add",
            element: <AppRouteWrapper component={FiscalYearsEdit} />,
        },
        {
            path: "/fiscal_years/edit/:id",
            element: <AppRouteWrapper component={FiscalYearsEdit} />,
        },
        // Cotisations
        {
            path: "/cotisations/list",
            element: <AppRouteWrapper component={CotisationsList} />,
        },
        {
            path: "/cotisations/add",
            element: <AppRouteWrapper component={CotisationsEdit} />,
        },
        {
            path: "/cotisations/edit/:id",
            element: <AppRouteWrapper component={CotisationsEdit} />,
        },
        // Accounting operations categories
        {
            path: "/accounting/operations/categories/list",
            element: <AppRouteWrapper component={AccountingOperationCategoriesList} />,
        },
        {
            path: "/accounting/operations/categories/add",
            element: <AppRouteWrapper component={AccountingOperationCategoriesEdit} />,
        },
        {
            path: "/accounting/operations/categories/edit/:id",
            element: <AppRouteWrapper component={AccountingOperationCategoriesEdit} />,
        },
        // Accounting accounts
        {
            path: "/accounting/accounts/list",
            element: <AppRouteWrapper component={AccountingAccountsList} />,
        },
        {
            path: "/accounting/accounts/add",
            element: <AppRouteWrapper component={AccountingAccountsEdit} />,
        },
        {
            path: "/accounting/accounts/edit/:id",
            element: <AppRouteWrapper component={AccountingAccountsEdit} />,
        },
        // Accounting operations
        {
            path: "/accounting/operations/list",
            element: <AppRouteWrapper component={AccountingOperationsList} />,
        },
        {
            path: "/accounting/operations/add",
            element: <AppRouteWrapper component={AccountingOperationsEdit} />,
        },
        {
            path: "/accounting/operations/edit/:id",
            element: <AppRouteWrapper component={AccountingOperationsEdit} />,
        },
        // Members
        {
            path: "/members/list",
            element: <AppRouteWrapper component={MembersList} />,
        },
        {
            path: "/members/add",
            element: <AppRouteWrapper component={MembersEdit} />,
        },
        {
            path: "/members/edit/:id",
            element: <AppRouteWrapper component={MembersEdit} />,
        },
        // Memberships
        {
            path: "/memberships/list",
            element: <AppRouteWrapper component={MembershipsList} />,
        },
        {
            path: "/memberships/add",
            element: <AppRouteWrapper component={MembershipsEdit} />,
        },
        {
            path: "/memberships/edit/:id",
            element: <AppRouteWrapper component={MembershipsEdit} />,
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
        <Route path='/logout' element={<AppRouteWrapper component={Logout} /> } />
        <Route path='/login' element={<AppRouteWrapper component={Login} /> } />
        <Route path="*" element={<AppRouteWrapper component={NotFound} /> } />
      </Routes>
    );
}

export default AppRoutes;
