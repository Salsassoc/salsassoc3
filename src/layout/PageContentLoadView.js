import React, { Fragment } from 'react';

import { Skeleton, Spin } from 'antd';

import Result from '../components/results/Result.js';

import { AppContext } from "../layout/AppContext.js";

const PageContentLoadView = (props) => {
    
    // Get application context
    const appContext = React.useContext(AppContext);

    const pageLoader = props.pageLoader;
    const pageStatic = props.pageStatic;
    const pagePreloadFinished = props.pagePreloadFinished;
    const error = pageLoader.error;

    const urlSearchParams = new URLSearchParams(window.location.search);
    const debug = (urlSearchParams.get('debug') != null);

    function isLoading()
    {
        if(pageStatic){
            return false;
        }
        return pageLoader.isInitializingOrProcessing()
    }

    function hasFatalError()
    {
        const hasError = (pageLoader.hasError());
        if(!displayLoading && hasError){
            if(error?.isFatal()){
                return true;
            }
            return !pageLoader.hasLoadedOnce();
        }
        return false;
    }

    const displayLoading = !pagePreloadFinished || (isLoading() && !pageLoader.hasLoadedOnce());
    const displayFatalError = hasFatalError();
    const displayContent = pageStatic || (!displayLoading && (debug || !displayFatalError));
    
    return (
        <Fragment>
            {displayFatalError ? <Result status="500" /> : ""}
            {displayLoading ? 
                <Spin size="large">
                    <Skeleton loading={displayLoading} />
                </Spin> : ""
            }
            <div style={{display:(displayContent ? "block" : "none")}}>
                {props.children}
            </div>
        </Fragment>
    );
}

export default PageContentLoadView;
