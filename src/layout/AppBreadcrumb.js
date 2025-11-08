import { Link } from 'react-router-dom';

import i18n from '../utils/i18n.js';

export function getAppBreadcrumbRoutes(serviceInstance, layoutData)
{
    let routes = [];

    // Always add dashboard
    routes[0] = {
        href: serviceInstance.createAdminUrl('/dashboard'),
        breadcrumbName: i18n.t("Common_Home"),
    };

    if(layoutData.pageBreadcrumb){
        routes = [...routes, ...layoutData.pageBreadcrumb];
    }

    if(layoutData.pageTitle){
        routes = [...routes, {
            breadcrumbName: layoutData.pageTitle,
        }];
    }

    return routes;
};

export function getAppBreadcrumbItemRender(route, params, routes, paths) {
    return route.breadcrumbName;
}


export function getAppBreadcrumb(serviceInstance, layoutData) {
    return {
        itemRender: getAppBreadcrumbItemRender,
        items: getAppBreadcrumbRoutes(serviceInstance, layoutData),
    }
}