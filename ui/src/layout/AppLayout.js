import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { Grid } from 'antd';
import ProLayout from '@ant-design/pro-layout';

import AppHeader from "../layout/AppHeader.js";

import {getAppMenu} from '../layout/AppMenu.js';

const AppLayout = (props) => {

  const screens = Grid.useBreakpoint();
  const lowRes = (screens.xs || !screens.lg);

  const [pathname, setPathname] = useState(window.location.pathname);

  const navBar = props.navBar;

  function getAppTitle () {
    return "Salsassoc";
  }

  function getAppLogo () {
    return "/logos/logo.png";
  }

  function getMenuProps (bVisible) {
    if(bVisible){
      const routeProps = (navBar ? getAppMenu() : null);
      return {
        ...routeProps,
        onMenuHeaderClick: (e) => console.log(e),
        menuItemRender: (item, dom) => (
          <div
            onClick={() => {
              setPathname(item.path || '/');
            }}
          >
            <Link to={item.path}>{dom}</Link>
          </div>
        )
      };
    }else{
      return {
        //siderWidth:"0",
        collapsed:true,
        collapsedButtonRender:null,
        //menuRender: null,
        //menuDataRender: null,
      };
    }
  }

  function getProLayoutStyle()
  {
    let pageContainer = {
        /*colorBgPageContainer: '#ff0000',*/
    };

    if(lowRes){
      pageContainer = {
        paddingInlinePageContainerContent: (screens.md ? 20 : 10),
        paddingBlockPageContainerContent: 10
      }
    }else{
      pageContainer = {
        paddingBlockPageContainerContent: 10,
      }
    }

    return {
      //bgLayout: '#ff0000',
      header: {
        colorBgHeader: '#90CAF9',
        colorHeaderTitle: '#ffffff',
      },/*
      sider: {
        colorMenuBackground: '#ff0000',
      },*/
      pageContainer: pageContainer,
    }
  }

  const appTitle = getAppTitle();
  const appLogo = getAppLogo();

  const menuProps = getMenuProps(navBar);

  return (
    <ProLayout
        location={{
            pathname,
        }}
        fixSiderbar
        //fixedHeader
        layout={navBar ? "mix" : "top"}
        navTheme="dark"
        title={appTitle}
        //colorPrimary="#6200ee"
        //logo={appLogo}
        {...menuProps}
        rightContentRender={() => (
            <AppHeader />
        )}
        footerRender={null}
        token={getProLayoutStyle()}
        >
        {props.children}
    </ProLayout>
  );
};

export default AppLayout;
