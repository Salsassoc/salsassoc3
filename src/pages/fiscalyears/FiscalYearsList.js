import React from 'react'
import {Link} from "react-router-dom";
import {Space, Popconfirm, Table, Checkbox} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';

const FiscalYearsList = (props) => {

    // Get application context
    const appContext = React.useContext(AppContext);
    const serviceInstance = appContext.serviceInstance;
    const pageLoader = appContext.pageLoader;

    // Define data state
    const [items, setItems] = React.useState([]);

    // Data loading and initialization
    function loadData()
    {
        return loadFiscalYearsList();
    }

    function loadFiscalYearsList()
    {
        let url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");

        return fetchJSON(url)
            .then((response) => {
                const items = response.result;
                setItems(items);
            });
    }

    function onConfirmRemove(record)
    {
        pageLoader.startRemoving();

        let url = serviceInstance.createServiceUrl("/fiscal_years/delete?id="+record.id);

        let opts = {
            method: "DELETE"
        };

        fetchJSON(url, opts)
            .then((_result) => {
                pageLoader.endRemoving();
                return loadData();
            })
            .catch((error) => {
                pageLoader.errorRemoving(error);
            });
    }

    // Compute layout data
    function getLayoutData()
    {
        // Set page title
        let pageTitle = i18n.t("pages.fiscal_years.title");

        // Set page breadcrumb
        const pageBreadcrumb = [
            {
                breadcrumbName: i18n.t("menu.settings"),
            }
        ];

        // Compute layout data
        const layoutData = {
            pageTitle: pageTitle,
            pageBreadcrumb: pageBreadcrumb
        }
        return layoutData;
    }

    // Rendering data
    function getTableHeaderExtra(serviceInstance)
    {
        return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/settings/fiscal_years/add")} />;
    }

    function renderIsCurrent(_text, record)
    {
        return (
            <Checkbox disabled checked={record.is_current} />
        );
    }

    function renderStartDate(_text, record)
    {
        return dayjs(record.start_date, "YYYY-MM-DD").format(i18n.t('common.date_format'));
    }

    function renderEndDate(_text, record)
    {
        return dayjs(record.end_date, "YYYY-MM-DD").format(i18n.t('common.date_format'));
    }

    function formatCurrency(value) {
        try {
            return new Intl.NumberFormat(i18n.language || 'fr-FR', { style: 'currency', currency: 'EUR' }).format(value || 0);
        } catch (e) {
            return (value || 0).toFixed(2);
        }
    }

    function renderMembers(_text, record){
        const count = record.membership_count || 0;
        return `${count} ${i18n.t('pages.fiscal_years.members_suffix')}`;
    }

    function renderAmount(_text, record){
        const amount = record.membership_amount || 0;
        return formatCurrency(amount);
    }

    function getColums()
    {
        return [
            {
                title: i18n.t("models.fiscal_years.title"),
                dataIndex: 'title',
                key: 'title',
                sorter: (a, b) => a.title.localeCompare(b.title),
            },
            {
                title: i18n.t('models.fiscal_years.start_date'),
                dataIndex: 'start_date',
                key: 'start_date',
                align: 'center',
                sorter: (a, b) => (a.start_date - b.start_date),
                render: renderStartDate,
            },
            {
                title: i18n.t('models.fiscal_years.end_date'),
                dataIndex: 'end_date',
                key: 'end_date',
                align: 'center',
                sorter: (a, b) => (a.end_date - b.end_date),
                render: renderEndDate,
            },
            {
                title: i18n.t('pages.fiscal_years.members'),
                key: 'membership_count',
                align: 'right',
                sorter: (a, b) => ((a.membership_count||0) - (b.membership_count||0)),
                render: renderMembers
            },
            {
                title: i18n.t('pages.fiscal_years.membership_amount'),
                key: 'membership_amount',
                align: 'right',
                sorter: (a, b) => ((a.membership_amount||0) - (b.membership_amount||0)),
                render: renderAmount
            },
            /*
            {
                title: i18n.t('models.fiscal_years.is_current'),
                dataIndex: 'is_current',
                key: 'is_current',
                align: 'center',
                sorter: (a, b) => (a.is_current - b.is_current),
                render: renderIsCurrent
            },
            */
            {
                title: i18n.t('common.actions'),
                align: 'center',
                key: 'actions',
                render: (text, record) => (
                    <Space size="middle">
                      <Link to={serviceInstance.createAdminUrl("/settings/fiscal_years/edit/"+record.id)}><EditOutlined /></Link>
                      <Popconfirm
                            title={i18n.t("pages.fiscal_years.remove", {label: record.title})}
                            onConfirm={() => onConfirmRemove(record)}
                        >
                        <a><DeleteOutlined /></a>
                      </Popconfirm>
                    </Space>
                )
            },
        ];
    }

    const tableContent = (
        <Table
            dataSource={items}
            columns={getColums()}
            rowKey={record => "fiscalyear_" + record.id} 
            pagination={{
                defaultPageSize: 50
            }}
        />
    );
    const tableActions = getTableHeaderExtra(serviceInstance);

    return (
        <PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
            <TCALayout
                title={i18n.t("pages.fiscal_years.list")}
                content={tableContent}
                actions={tableActions}
            />
        </PageContentLayout>
    )

};

export default FiscalYearsList;
