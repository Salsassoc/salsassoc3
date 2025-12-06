import React from 'react';

import AlertError from '../components/alerts/AlertError.js';

const PageContentAlertError = ( {pageLoader} ) => {
    // Disabled for now in favor of nofication error
    if(true){
        return null;
    }
    return (<AlertError error={pageLoader.error} handleClose={pageLoader.clearError} />)
}

export default PageContentAlertError;
