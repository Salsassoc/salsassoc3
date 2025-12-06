import React, { Fragment } from 'react'
import {Helmet} from "react-helmet";

import AppLayout from "../layout/AppLayout.js";

const BaseLayout = (props) => {

    // Get application context
    const layoutData = props.layoutData;

    const pageTitle = layoutData.pageTitle;

    const navBar = layoutData.navBar || false;

    return (
        <Fragment>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{pageTitle}</title>
                {/*<link rel="canonical" href="http://mysite.com/example" />*/}
            </Helmet>
            <AppLayout navBar={navBar}>
                {props.children}
            </AppLayout>
        </Fragment>
    )
};

export default BaseLayout;
