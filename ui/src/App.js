import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';

import {configureBackend} from './authentication/backend.js';

import AppRoutes from './layout/AppRoutes.js'
import AppContextProvider from './layout/AppContext.js';

import style from "./style.js"
ConfigProvider.config({
    theme: style
});

import {getCurrentLocaleShort, getAntdLocale} from './utils/i18n.js';

const App = () => {

	// Fix dayjs locale
	/*
	const currentLocale = getCurrentLocaleShort();
	const localeFile = require('dayjs/locale/' + currentLocale + '.js');
	if(localeFile){
		dayjs.locale(currentLocale);
	}*/

    // Configure the backend
    configureBackend();

	return (
		<ConfigProvider locale={getAntdLocale()} theme={style}>
			<AppContextProvider>
			<BrowserRouter>
				<AppRoutes />
			</BrowserRouter>
			</AppContextProvider>
		</ConfigProvider>
	);
};

export default App;
