import React from 'react'

import i18n from '../utils/i18n.js';

import AppLayout from './AppLayout.js';

import Result from '../components/results/Result.js';

const NotFound = () => {
    return (
        <AppLayout>
            <Result status="404" />
        </AppLayout>
    );
}

export default NotFound;