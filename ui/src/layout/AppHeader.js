import React, {Fragment, useContext} from 'react';
import { Link } from "react-router-dom";
import i18n from '../utils/i18n.js';

import {  Dropdown, Space, Avatar, Grid } from 'antd';
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


	function getMenuAccount()
	{
		let items = [];

		if(shortMode){
			items.push({
				key: 'menu-account-username',
				label: user.getUsername(),
				disabled: true
			});
			items.push({
				type: 'divider'
			});
		}

		items.push({
			key: 'menu-account-myaccount',
			label: <Link to={"/account/edit"}>{i18n.t("menu_account.my_account")}</Link>,
		});
		items.push({
			key: 'menu-account-username',
			label: <Link to={"/logout"}>{i18n.t("menu_account.logout")}</Link>,
		});

		return items;
	}

	function getDropdownMenu(user)
	{
		if(!user){
			return null;
		}

		const items = getMenuAccount();
		return (
			<Dropdown menu={{ items }} placement="bottomRight" trigger={dropdownTrigger} >
				<a className="app-header-dropdown-link" onClick={e => e.preventDefault()}>
					{shortMode ? "" : user.getUsername()} <UserOutlined /><CaretDownOutlined />
				</a>
			</Dropdown>
		);
	}

    return (
        <div>
	        <Space size={"large"} className="app-header-right" style={{ padding: 0 }}>
	            {getBreakpointName()}
	            {userIsLogged ? getDropdownMenu(user) : null }
	        </Space>
        </div>
    );
}

export default AppHeader;
