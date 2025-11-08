import React from 'react';

import { Alert, Space, Row, Col } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';

import i18n from '../utils/i18n.js';

import BaseLayout from '../layout/BaseLayout.js';
import { AppContext } from "../layout/AppContext.js";
import { getAppBreadcrumb } from "../layout/AppBreadcrumb.js";
import PageLayoutData from "../layout/PageLayoutData.js";

import PageContentLoadView from './PageContentLoadView.js';

function PageContentLayout(props) {

    // Get application context
    const appContext = React.useContext(AppContext);

    let pageLoader = appContext.pageLoader;

    let layoutData = props.layoutData;
    layoutData.navBar = true;

    let pageLayoutData = new PageLayoutData();
    pageLayoutData.setPageTitle(layoutData.pageTitle);
    pageLayoutData.setPageStatic(layoutData.pageStatic || false);
    pageLayoutData.setPageBreadcrumb(layoutData.pageBreadcrumb);
    pageLayoutData.setPageHeaderExtra(layoutData.pageHeaderExtra);
    pageLayoutData.setPageTabList(layoutData.pageTabList);
    pageLayoutData.setPageTabActiveKey(layoutData.pageDefaultTab || null);
    pageLayoutData.setUpdateNotifier(() => {
        if(this.checkComponentUpdate()){
            this.forceUpdate();
        }
    })

    function onTabChange (key) {
        appContext.setPageTabActiveKey(key);
    }

    // Get application context
    const serviceInstance = appContext.serviceInstance;

    // Get page layout data
    //const pageLayoutData = this.state.pageLayoutData;
    const pageStatic = pageLayoutData.pageStatic || false;

    // Get responsive active sizes
    //const screens = useBreakpoint();
    const bLowSize = (window.innerWidth < 768);

    const pageBreadcrumb = (bLowSize ? {} : getAppBreadcrumb(serviceInstance, pageLayoutData));

    // Define state
    const [isPreloadFinished, setIsPreloadFinished] = React.useState(pageStatic);

    React.useEffect(() => {
        // This will restore page loader every time the current page is loaded
        pageLoader.reset();
    }, []);

    React.useEffect(() => {
        if(appContext.status){
            // Tell that global loading are finished
            setIsPreloadFinished(true);

            // Load data if needed
            if(props.loadData){
                // Load all data from service if needed
                pageLoader.loadData(props.loadData, props.updateDataState);
            }
        }
    }, [appContext.status]);

    const tabActiveKey = (appContext.pageTabActiveKey || pageLayoutData.pageTabActiveKey);

    return (
        <BaseLayout layoutData={layoutData}>
            <Space direction="vertical">
                <PageContainer
                    fixedHeader
                    fixSiderbar
                    header={{
                        title: pageLayoutData.pageTitle,
                        breadcrumb: pageBreadcrumb,
                    }}
                    tabActiveKey={tabActiveKey}
                    tabList={pageLayoutData.pageTabList}
                    onTabChange={onTabChange}
                    extra={pageLayoutData.pageHeaderExtra}
                    footer={pageLayoutData.pageFooter}
                >
                    <PageContentLoadView pageLoader={pageLoader} pageStatic={pageStatic} pagePreloadFinished={isPreloadFinished}>
                        {props.children}
                    </PageContentLoadView>
                </PageContainer>
            </Space>
        </BaseLayout>
    );
}

export default PageContentLayout;
