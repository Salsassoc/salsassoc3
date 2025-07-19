import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './layout/AppRoutes.js'

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
