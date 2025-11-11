import React from 'react'
import {Link} from "react-router-dom";
import {Space, Popconfirm, Table, Tag} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';

import AccountingOperationsSearchForm from './AccountingOperationsSearchForm.js';

const AccountingOperationsList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [accounts, setAccounts] = React.useState([]);
	const [categories, setCategories] = React.useState([]);
	const [filter, setFilter] = React.useState({
		fiscalYearId: null,
		year: null,
		accountingAccountId: null,
		categoryId: null,
		amountMin: null,
		amountMax: null,
	});

	// Data loading and initialization
	function loadData()
	{
		return loadOperationsList()
			.then(_result => loadFiscalYears())
			.then(_result => loadAccounts())
			.then(_result => loadCategories());
	}

	function loadOperationsList()
	{
		let params = "";
		if (filter.fiscalYearId) {
			params += "&fiscal_year_id=" + filter.fiscalYearId;
		}
		if (filter.year) {
			params += "&year=" + filter.year;
		}
		if (filter.accountingAccountId) {
			params += "&accounting_account_id=" + filter.accountingAccountId;
		}
		if (filter.categoryId) {
			params += "&accounting_operations_category=" + filter.categoryId;
		}
		if (filter.amountMin !== null && filter.amountMin !== undefined && filter.amountMin !== '') {
			params += "&amount_min=" + filter.amountMin;
		}
		if (filter.amountMax !== null && filter.amountMax !== undefined && filter.amountMax !== '') {
			params += "&amount_max=" + filter.amountMax;
		}

		let url = serviceInstance.createServiceUrl("/accounting/operations/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const rawItems = response.result.accounting_operations || [];
				// Ensure newest first already from API; compute accumulation from bottom to top
				const itemsWithAcc = computeAccumulation(rawItems);
				setItems(itemsWithAcc);
			});
	}

	function loadFiscalYears(){
		const url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");
		return fetchJSON(url)
			.then((response) => {
				setFiscalYears(response.result.fiscal_years || []);
			});
	}

	function loadAccounts(){
		const url = serviceInstance.createServiceUrl("/accounting/accounts/list");
		return fetchJSON(url)
			.then((response) => {
				setAccounts(response.result.accounting_accounts || []);
			});
	}

	function loadCategories(){
		const url = serviceInstance.createServiceUrl("/accounting/operations/categories/list");
		return fetchJSON(url)
			.then((response) => {
				setCategories(response.result.accounting_operations_categories || []);
			});
	}

	function computeAccumulation(list){
		// Accumulation = accumulation of the line below + current amount.
		// Since newest first, we iterate from end to start.
		let acc = 0;
		const result = [...list];
		for(let i = result.length - 1; i >= 0; --i){
			acc = acc + (Number(result[i].amount || 0));
			result[i] = { ...result[i], accumulation: acc };
		}
		return result;
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/accounting/operations/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.accounting_operations.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/accounting/operations/add")} />;
	}

	function renderDate(_text, record){
		if(!record.date_value){ return null; }
		return dayjs(record.date_value, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}

	function renderDateEffective(_text, record){
		if(!record.date_effective){ return null; }
		return dayjs(record.date_effective, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}

	function renderLabel(_text, record){
		return <span>{record.label}</span>;
	}

	function renderNumber(_text, record){
		return <span>{record.op_number || record.op_method_number || ''}</span>;
	}

	function renderCategory(_text, record){
		return <span>{record.category_label || ''}</span>;
	}

	function renderCategoryAccountNumber(_text, record){
		return <span>{record.category_account_number || ''}</span>;
	}

	function renderOpMethod(_text, record){
		const map = {
			0: i18n.t('models.accounting_operation.op_method_unknown'),
			10: i18n.t('models.accounting_operation.op_method_checkin'),
			11: i18n.t('models.accounting_operation.op_method_checkout'),
			20: i18n.t('models.accounting_operation.op_method_cash_in'),
			21: i18n.t('models.accounting_operation.op_method_cash_out'),
			30: i18n.t('models.accounting_operation.op_method_transfer_in'),
			31: i18n.t('models.accounting_operation.op_method_transfer_out'),
			32: i18n.t('models.accounting_operation.op_method_direct_debit'),
			33: i18n.t('models.accounting_operation.op_method_interest'),
		};
		return <span>{map[record.op_method] || record.op_method}</span>;
	}

	function formatCurrency(value) {
		try {
			const n = Number(value || 0);
			return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
		} catch(_e){
			return (Number(value || 0)).toFixed(2) + ' €';
		}
	}

	function renderAmount(_text, record){
		const value = record.amount || 0;
		const color = value > 0 ? '#3f8600' : (value < 0 ? '#cf1322' : undefined);
		return (<span style={{ color }}>{formatCurrency(value)}</span>);
	}

	function renderAccumulation(_text, record){
		const value = record.accumulation || 0;
		const color = value > 0 ? null : (value < 0 ? '#cf1322' : undefined);
		return (<span style={{ color }}>{formatCurrency(value)}</span>);
	}

	function renderFiscalYear(_text, record){
		return <span>{record.fiscal_year_title || ''}</span>;
	}

	function renderActions(_text, record)
	{
		return (
			<Space size="middle">
				<Link to={serviceInstance.createAdminUrl("/accounting/operations/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.accounting_operations.remove', {label: record.label})}
							onConfirm={() => onConfirmRemove(record)}>
					<a href="#remove"><DeleteOutlined /></a>
				</Popconfirm>
			</Space>
		);
	}

	function getColumns()
	{
		return [
			{
				title: i18n.t('models.accounting_operation.date_value'),
				dataIndex: 'date_value',
				key: 'date_value',
				render: renderDate
			},
			{
				title: i18n.t('models.accounting_operation.date_effective'),
				dataIndex: 'date_effective',
				key: 'date_effective',
				render: renderDateEffective
			},
			{
				title: i18n.t('models.accounting_operation.label'),
				dataIndex: 'label',
				key: 'label',
				render: renderLabel
			},
			{
				title: i18n.t('models.accounting_operation.op_number'),
				dataIndex: 'op_number',
				key: 'op_number',
				render: renderNumber
			},
			{
				title: i18n.t('models.accounting_operation.category'),
				dataIndex: 'category_label',
				key: 'category_label',
				render: renderCategory
			},
			{
				title: i18n.t('models.accounting_operation.category_account_number'),
				dataIndex: 'category_account_number',
				key: 'category_account_number',
				render: renderCategoryAccountNumber
			},
			{
				title: i18n.t('models.accounting_operation.op_method'),
				dataIndex: 'op_method',
				key: 'op_method',
				render: renderOpMethod
			},
			{
				title: i18n.t('models.accounting_operation.amount'),
				dataIndex: 'amount',
				key: 'amount',
				render: renderAmount
			},
			{
				title: i18n.t('models.accounting_operation.accumulation'),
				dataIndex: 'accumulation',
				key: 'accumulation',
				render: renderAccumulation
			},
			{
				title: i18n.t('models.accounting_operation.fiscal_year'),
				dataIndex: 'fiscal_year_title',
				key: 'fiscal_year_title',
				render: renderFiscalYear
			},
			{
				title: i18n.t('common.actions'),
				key: 'action',
				render: renderActions,
			}
		];
	}

	function onFormSearchFinished(values){
		setFilter({
			fiscalYearId: values.fiscal_year_id,
			year: values.year,
			accountingAccountId: values.accounting_account_id,
			categoryId: values.accounting_operations_category,
			amountMin: values.amount_min,
			amountMax: values.amount_max,
		});
	}

	// Reload list when filter changes
	React.useEffect(() => {
		loadOperationsList();
	}, [filter]);

	const form = (
		<AccountingOperationsSearchForm
			fiscalYears={fiscalYears}
			accounts={accounts}
			categories={categories}
			onFinish={onFormSearchFinished}
		/>
	);

	const tableContent = (
		<Table
			dataSource={items}
			columns={getColumns()}
			rowKey={record => "op_" + record.id}
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
				title={i18n.t("pages.accounting_operations.list")}
				content={tableContent}
				form={form}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default AccountingOperationsList;
