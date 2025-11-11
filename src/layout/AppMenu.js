import React from 'react';

import {
  DashboardOutlined,
  SettingOutlined,
  CalendarOutlined,
  ProductOutlined,
  BankOutlined
} from '@ant-design/icons';

import {AppContext} from "../layout/AppContext.js";

import i18n from '../utils/i18n.js';

export function getAppMenu()
{
    const appContext = React.useContext(AppContext);
    const serviceInstance = appContext.serviceInstance;

    function getAdminUrl(path){
        return serviceInstance.createAdminUrl(path);
    }

    let subRoutes = [];
    let appMenu = {
        route: {
            path: getAdminUrl("/"),
            routes: [],
        }
    }

    // Dahsboard
    appMenu.route.routes.push({
        name: i18n.t('menu.dashboard'),
        path: getAdminUrl("/dashboard"), 
        icon: <DashboardOutlined />,
    });

    // Accounting
    subRoutes = [];
    subRoutes.push({
        name: i18n.t('menu.accounting_accounts'),
        path: getAdminUrl("/accounting/accounts/list"),
        exact: true,
    });
    subRoutes.push({
        name: i18n.t('menu.accounting_operation_categories'),
        path: getAdminUrl("/accounting/operations/categories/list"),
        exact: true,
    });
    appMenu.route.routes.push({
        name: i18n.t('menu.accounting'),
        path: getAdminUrl("/accounting"),
        icon: <BankOutlined />,
        routes: subRoutes,
    });

    // Fiscal years
    appMenu.route.routes.push({
        name: i18n.t('menu.fiscal_years'),
        path: getAdminUrl("/fiscal_years/list"),
        icon: <CalendarOutlined />,
        exact: true,
    });

    // Cotisations
    appMenu.route.routes.push({
        name: i18n.t('menu.cotisations'),
        path: getAdminUrl("/cotisations/list"),
        icon: <ProductOutlined />,
        exact: true,
    });

    // Settings
    /*
    subRoutes = [];
    appMenu.route.routes.push({
        name: i18n.t('menu.settings'),
        path: getAdminUrl("/settings"),
        icon: <SettingOutlined />,
        routes: subRoutes,
    });
    */

    return appMenu;
};
