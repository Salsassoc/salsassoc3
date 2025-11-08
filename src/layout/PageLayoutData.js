class PageLayoutData
{
    constructor()
    {
        this.pageStatic = false;
        this.pageTitle = null;
        this.pageBreadcrumb = null;
        this.pageHeaderExtra = null;
        this.pageTabList = null;
        this.pageTabActiveKey = null;
        this.pageFooter = null;
        this.notifier = null;
    }

    setPageStatic = (pageStatic) => {
        this.pageStatic = pageStatic;
    }

    setPageTitle = (title) => {
        this.pageTitle = title;
    }

    setPageBreadcrumb = (breadcrumb) => {
        this.pageBreadcrumb = breadcrumb;
    }

    setPageTabList = (tabList) => {
        this.pageTabList = tabList;
        this.notifyUpdate();
    }

    setPageTabActiveKey = (tabActiveKey) => {
        this.pageTabActiveKey = tabActiveKey;
    }

    setPageHeaderExtra = (headerExtra) => {
        this.pageHeaderExtra = headerExtra;
    }

    setPageFooter = (footer) => {
        this.pageFooter = footer;
    }

    setUpdateNotifier = (notifier) => {
        this.notifier = notifier;
    }

    notifyUpdate = () => {
        if(this.notifier){
            this.notifier();
        }
    }

};

export default PageLayoutData;