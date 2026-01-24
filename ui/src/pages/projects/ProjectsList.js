import React from 'react'
import {Link} from "react-router-dom";
import {Space, Popconfirm, Table} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';

import ProjectsSearchForm from './ProjectsSearchForm.js';

const ProjectsList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [filter, setFilter] = React.useState({
		fiscalYearId: null,
		name: null,
	});

	// Data loading and initialization
	function loadData()
	{
		return loadProjectsList()
			.then(_result => loadFiscalYears());
	}

	function loadProjectsList()
	{
		let params = "";
		if (filter.fiscalYearId) {
			params += "&fiscal_year_id=" + filter.fiscalYearId;
		}
		if (filter.name) {
			params += "&name=" + encodeURIComponent(filter.name);
		}

		let url = serviceInstance.createServiceUrl("/projects/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.projects || [];
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

		let url = serviceInstance.createServiceUrl("/projects/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.projects.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/projects/add")} />;
	}

	function getTableActions(record)
	{
		return (
			<Space>
				<Link to={serviceInstance.createAdminUrl("/projects/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.projects.remove', {label: record.name})}
					okText="OK"
					cancelText="Cancel"
					onConfirm={() => onConfirmRemove(record)}
				>
					<a href="#remove"><DeleteOutlined /></a>
				</Popconfirm>
			</Space>
		);
	}

	function getFiscalYearLabel(id)
	{
		const y = (fiscalYears || []).find(y => y.id === id);
		return y ? y.title : id;
	}

	function getColumns()
	{
		return [
			{
				title: i18n.t('models.project.name'),
				dataIndex: 'name',
				key: 'name',
			},
			{
				title: i18n.t('models.project.project_date'),
				dataIndex: 'project_date',
				key: 'project_date',
				align: 'center',
				render: (value) => (value ? dayjs(value).format(i18n.t('common.date_format')) : ''),
			},
			{
				title: i18n.t('models.project.fiscal_year'),
				dataIndex: 'fiscal_year_id',
				key: 'fiscal_year_id',
				align: 'center',
				render: (value) => getFiscalYearLabel(value),
			},
			{
				title: i18n.t('pages.fiscal_years.operations'),
				dataIndex: 'operation_count',
				key: 'operation_count',
				align: 'right',
				render: (value) => (value != null ? value : 0),
			},
			{
				title: i18n.t('pages.fiscal_years.income'),
				dataIndex: 'income_amount',
				key: 'income_amount',
				align: 'right',
				render: (value) => (value != null ? Number(value).toFixed(2) : '0.00'),
			},
			{
				title: i18n.t('pages.fiscal_years.outcome'),
				dataIndex: 'outcome_amount',
				key: 'outcome_amount',
				align: 'right',
				render: (value) => (value != null ? Number(value).toFixed(2) : '0.00'),
			},
			{
				title: i18n.t('pages.fiscal_years.balance'),
				key: 'balance',
				align: 'right',
				render: (_text, record) => {
					const income = Number(record.income_amount || 0);
					const outcome = Number(record.outcome_amount || 0);
					return (income - outcome).toFixed(2);
				},
			},
			{
				title: i18n.t('common.actions'),
				key: 'actions',
				align: 'center',
				render: (_text, record) => getTableActions(record),
			},
		];
	}

	function onFormSearchFinished(values)
	{
		setFilter({
			fiscalYearId: (values.fiscal_year_id ? values.fiscal_year_id : null),
			name: (values.name ? values.name : null),
		});
	}

	React.useEffect(() => {
		loadData();
	}, [filter]);

	const columns = getColumns();

	const form = (
		<ProjectsSearchForm
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
				title={i18n.t("pages.projects.list", { count: (items ? items.length : 0) })}
				content={tableContent}
				form={form}
				actions={tableActions}
			/>
		</PageContentLayout>
	);
}

export default ProjectsList;
