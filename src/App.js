import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './layout/AppRoutes.js'
import AppContextProvider from './layout/AppContext.js';

//import {getCurrentLocaleShort, getAntdLocale} from './utils/i18n.js';

const App = () => {

  // Fix dayjs locale
  /*
  const currentLocale = getCurrentLocaleShort();
  const localeFile = require('dayjs/locale/' + currentLocale + '.js');
  if(localeFile){
    dayjs.locale(currentLocale);
  }*/

  return (
    <AppContextProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppContextProvider>
  );
};

export default App;
