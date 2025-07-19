import React from 'react';

import {
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import i18n from '../utils/i18n.js';

export function getAppMenu()
{
    function getAdminUrl(path){
        return path;
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


    // Settings
    subRoutes = [];
    subRoutes.push({
        name: i18n.t('menu.settings_fiscal_years'),
        path: getAdminUrl("/settings/fiscalyears"),
        exact: true,
    });
    subRoutes.push({
        name: i18n.t('menu.settings_cotisations'),
        path: getAdminUrl("/settings/cotisations"),
        exact: true,
    });
    subRoutes.push({
        name: i18n.t('menu.settings_operation_categories'),
        path: getAdminUrl("/settings/operation_categories"),
        exact: true,
    });

    appMenu.route.routes.push({
        name: i18n.t('menu.settings'),
        path: getAdminUrl("/settings"),
        icon: <SettingOutlined />,
        routes: subRoutes,
    });

    return appMenu;
};
