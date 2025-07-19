import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './layout/AppRoutes.js'

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
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
