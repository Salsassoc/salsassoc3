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

import CurrencyText from "../common/CurrencyText.js";

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
		fiscalYearId: '',
		name: '',
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

	function renderOperations(_text, record){
		const count = record.operation_count || 0;
		const label = `${count} ${i18n.t('pages.fiscal_years.operations_suffix')}`;
		const href = serviceInstance.createAdminUrl(`/accounting/operations/list?project_id=${record.id}`);
		return (
			<Link to={href} style={{textWrap:'nowrap'}}>{label}</Link>
		);
	}

	function renderIncome(_text, record){
		return <CurrencyText value={record.income_amount || 0} />
	}

	function renderOutcome(_text, record){
		return <CurrencyText value={record.outcome_amount || 0} />
	}

	function getBalance(record){
		return record.income_amount + record.outcome_amount;
	}

	function renderBalance(_text, record){
		const value = getBalance(record) || 0;
		return <CurrencyText value={value} colored={true} />;
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
				sorter: (a, b) => ((a.operation_count||0) - (b.operation_count||0)),
				render: renderOperations
			},
			{
				title: i18n.t('pages.fiscal_years.income'),
				dataIndex: 'income_amount',
				key: 'income_amount',
				align: 'right',
				sorter: (a, b) => ((a.income_amount||0) - (b.income_amount||0)),
				render: renderIncome,
			},
			{
				title: i18n.t('pages.fiscal_years.outcome'),
				dataIndex: 'outcome_amount',
				key: 'outcome_amount',
				align: 'right',
				sorter: (a, b) => ((a.outcome_amount||0) - (b.outcome_amount||0)),
				render: renderOutcome,
			},
			{
				title: i18n.t('pages.fiscal_years.balance'),
				key: 'balance',
				align: 'right',
				sorter: (a, b) => (getBalance(a) - getBalance(b)),
				render: renderBalance,
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
			filter={filter}
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
