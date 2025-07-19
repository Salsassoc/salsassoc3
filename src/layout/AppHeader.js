import React, {Fragment, useContext} from 'react';
import { Link } from "react-router-dom";

import { Menu, Dropdown, Space, Switch, Avatar, Grid, Popover } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    CaretDownOutlined,
} from '@ant-design/icons';

import User from '../models/User.js';

import {AppContext} from "../layout/AppContext.js";

const { useBreakpoint } = Grid;

const AppHeader = () => {

    // Get application context
    const appContext = useContext(AppContext);
    const user = appContext.user;

    // Get responsive active sizes
    const screens = useBreakpoint();

    // Display logged in infos
    const userIsLogged = (user !== null);

    // Display options
    const shortMode = screens.xs;
    const dropdownTrigger = (screens.xl ? ['hover'] : ['click']);

    // Version
    const version = (status ? status.application.version : "");
    const versionLabel = (shortMode ? null : <span>{version}</span>);

    function getBreakpointName(){
        return null;/*
        if(screens.xxl){
            return "XXL";
        }
        if(screens.xl){
            return "XL";
        }
        if(screens.lg){
            return "LG";
        }
        if(screens.md){
            return "MD";
        }
        if(screens.sm){
            return "SM";
        }
        if(screens.xs){
            return "XS";
        }
        return "NONE";*/
    }

    // Menu account
    const menuAccount = (
        <Menu>
            {shortMode ? 
                <Fragment>
                    <Menu.Item key="menu-account-username">{user ? user.getUsername() : ""}</Menu.Item>
                    <Menu.Divider />
                </Fragment>
            : ""}
            <Menu.Item key="menu-account-myaccount">
                <Link to={"/account/edit"}>{"My_Account"}</Link>
            </Menu.Item>
            <Menu.Item key="menu-account-logout">
                <Link to={"/logout"}>{"Logout"}</Link>
            </Menu.Item>
        </Menu>
    );

    return (
        <div>
        <Space size={"large"} className="app-header-right" style={{ padding: 0 }}>
            {getBreakpointName()}
            {userIsLogged ?
                <Fragment>
                    {user != null ?
                        <Dropdown overlay={menuAccount} placement="bottomRight" trigger={dropdownTrigger} >
                            <a className="app-header-dropdown-link" onClick={e => e.preventDefault()}>
                                {shortMode ? "" : user.getUsername()} <UserOutlined /><CaretDownOutlined />
                            </a>
                        </Dropdown>
                        : ""
                    }
                </Fragment>
            : 
                <Fragment />
            }
        </Space>
        </div>
    );
}

// 
<Avatar shape="square" size="small" icon={<UserOutlined />} />

export default AppHeader;
