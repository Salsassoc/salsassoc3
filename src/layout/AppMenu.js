import React from 'react';

import {
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';

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
        name: 'Dashboard',
        path: getAdminUrl("/home"),
        icon: <DashboardOutlined />,
    });

    //About
    appMenu.route.routes.push({
        name: 'Settings',
        path: getAdminUrl("/settings"),
        icon: <SettingOutlined />
    });

    return appMenu;
};
