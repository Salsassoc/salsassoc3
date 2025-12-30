import React from 'react'
import {Link} from "react-router-dom";
import {Space, Popconfirm, Table, Select} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';

import CotisationsSearchForm from './CotisationsSearchForm.js';

const CotisationsList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [filter, setFilter] = React.useState({
		fiscalYearId: null,
		cotisationType: null,
	});

	// Data loading and initialization
	function loadData()
	{
		return loadCotisationsList()
			.then(_result => loadFiscalYears());
	}

	function loadCotisationsList()
	{
		let params = "";
		if (filter.fiscalYearId) {
			params += "&fiscal_year_id=" + filter.fiscalYearId;
		}
		if (filter.cotisationType) {
			params += "&type=" + filter.cotisationType;
		}

		let url = serviceInstance.createServiceUrl("/cotisations/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.cotisations;
				setItems(items);
			});
	}

	function loadFiscalYears()
	{
		const url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");
		return fetchJSON(url)
			.then((response) => {
				setFiscalYears(response.result.fiscal_years || []);
			});
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/cotisations/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.cotisations.title");

		// Set page breadcrumb
		const pageBreadcrumb = [
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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/cotisations/add")} />;
	}

	function renderLabel(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.label}</span>;
	}

	function renderType(_text, record)
	{
		const typeMap = {
			1: i18n.t('models.cotisation.type_membership'),
			2: i18n.t('models.cotisation.type_course'),
			3: i18n.t('models.cotisation.type_donation'),
			4: i18n.t('models.cotisation.type_credit'),
		};
		return <span>{typeMap[record.type] || record.type}</span>;
	}

	function renderStartDate(_text, record)
	{
		return dayjs(record.start_date, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}

	function renderEndDate(_text, record)
	{
		return dayjs(record.end_date, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}

	function renderAmount(_text, record)
	{
		return <span>{Number(record.amount).toFixed(2)} €</span>;
	}

	function renderMembers(_text, record)
	{
		const n = record.members_count || 0;
		return <span>{n} {i18n.t('pages.cotisations.members_suffix')}</span>;
	}

	function renderCollectedAmount(_text, record)
	{
		return <span>{Number(record.collected_amount).toFixed(2)} €</span>;
	}

	function renderActions(_text, record)
	{
		return (
			<Space size="middle">
				<Link to={serviceInstance.createAdminUrl("/cotisations/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.cotisations.remove', {label: record.label})}
							onConfirm={() => onConfirmRemove(record)}>
					<a><DeleteOutlined /></a>
				</Popconfirm>
			</Space>
		);
	}

	function getColumns()
	{
		return [
			{
				title: i18n.t('models.cotisation.label'),
				dataIndex: 'label',
				key: 'label',
				render: renderLabel
			},
			{
				title: i18n.t('models.cotisation.type'),
				dataIndex: 'type',
				key: 'type',
				render: renderType
			},
			{
				title: i18n.t('models.cotisation.start_date'),
				dataIndex: 'start_date',
				key: 'start_date',
				render: renderStartDate
			},
			{
				title: i18n.t('models.cotisation.end_date'),
				dataIndex: 'end_date',
				key: 'end_date',
				render: renderEndDate
			},
			{
				title: i18n.t('pages.cotisations.base_amount'),
				dataIndex: 'amount',
				key: 'amount',
				render: renderAmount
			},
			{
				title: i18n.t('pages.cotisations.members'),
				dataIndex: 'members_count',
				key: 'members_count',
				render: renderMembers
			},
			{
				title: i18n.t('pages.cotisations.collected_amount'),
				dataIndex: 'collected_amount',
				key: 'collected_amount',
				render: renderCollectedAmount
			},
			{
				title: i18n.t('common.actions'),
				key: 'action',
				render: renderActions,
			}
		];
	}

	function onFormSearchFinished(values) {
		setFilter({
			fiscalYearId: values.fiscal_year_id,
			cotisationType: values.cotisation_type,
			usersGroup: values.usersgroup,
		});
	}

    // Handle dataObject update
    React.useEffect(() => {
        loadCotisationsList();
    }, [filter]);

	const form = (
		<CotisationsSearchForm
			fiscalYears={fiscalYears}
			onFinish={onFormSearchFinished}
		/>
	);

	const tableContent = (
		<Table
			dataSource={items}
			columns={getColumns()}
			rowKey={record => "cotisation_" + record.id} 
			pagination={{
				defaultPageSize: 50
			}}
			size="small"
		/>
	);

	const tableActions = getTableHeaderExtra(serviceInstance);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<TCALayout
				title={i18n.t("pages.cotisations.list", { count: (items ? items.length : 0) })}
				content={tableContent}
				form={form}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default CotisationsList;
