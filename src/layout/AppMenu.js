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

    let appMenu = {
        route: {
            path: getAdminUrl("/"),
            routes: [],
        }
    }

    appMenu.route.routes.push({
        name: i18n.t('menu.dashboard'),
        path: getAdminUrl("/home"), 
        icon: <DashboardOutlined />,
    });

    //About
    appMenu.route.routes.push({
        name: i18n.t('menu.settings'),
        path: getAdminUrl("/settings"),
        icon: <SettingOutlined />
    });

    return appMenu;
};
