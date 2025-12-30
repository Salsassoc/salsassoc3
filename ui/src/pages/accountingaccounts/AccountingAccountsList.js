import React from 'react'
import {Link} from "react-router-dom";
import {Space, Popconfirm, Table, Tag} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';

import TCALayout from '../../components/layout/TCALayout.js';
import ButtonAdd from '../../components/buttons/ButtonAdd.js';

const AccountingAccountsList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);

	// Data loading and initialization
	function loadData()
	{
		return loadAccountsList();
	}

	function loadAccountsList()
	{
		let url = serviceInstance.createServiceUrl("/accounting/accounts/list");

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.accounting_accounts;
				setItems(items);
			});
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/accounting/accounts/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.accounting_accounts.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/accounting/accounts/add")} />;
	}

	function renderType(_text, record){
		let color = 'default';
		let label = i18n.t('models.accounting_account.type_other');
		switch(record.type){
			case 1:
				color = 'green';
				label = i18n.t('models.accounting_account.type_cash');
				break;
			case 2:
				color = 'blue';
				label = i18n.t('models.accounting_account.type_bank');
				break;
			default:
				color = 'default';
				label = i18n.t('models.accounting_account.type_other');
		}
		return (
			<Tag color={color}>{label}</Tag>
		);
	}

	function formatCurrency(value) {
		try {
			return new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(value || 0);
		} catch (e) {
			return `${value}`;
		}
	}

	function renderOperationsCount(_text, record){
		return (
			<span>{record.operation_count} {i18n.t('pages.fiscal_years.operations_suffix')}</span>
		);
	}

	function renderIncome(_text, record){
		return formatCurrency(record.income_amount);
	}

	function renderOutcome(_text, record){
		return formatCurrency(record.outcome_amount);
	}

	function getBalance(record){
		return record.income_amount + record.outcome_amount;
	}

	function renderBalance(_text, record){
		const value = getBalance(record) || 0;
		const color = value > 0 ? '#3f8600' : (value < 0 ? '#cf1322' : undefined);
		return (<span style={{ color }}>{formatCurrency(value)}</span>);
	}

	function getColumns()
	{
		return [
			{
				title: i18n.t('models.accounting_account.label'),
				dataIndex: 'label',
				key: 'label',
			},
			{
				title: i18n.t('models.accounting_account.type'),
				key: 'type',
				align: 'center',
				render: renderType
			},
			{
				title: i18n.t('pages.fiscal_years.operations'),
				key: 'operation_count',
				align: 'center',
				render: renderOperationsCount
			},
			{
				title: i18n.t('pages.fiscal_years.income'),
				key: 'income_amount',
				align: 'right',
				render: renderIncome
			},
			{
				title: i18n.t('pages.fiscal_years.outcome'),
				key: 'outcome_amount',
				align: 'right',
				render: renderOutcome
			},
			{
				title: i18n.t('pages.fiscal_years.balance'),
				key: 'balance',
				align: 'right',
				render: renderBalance
			},
			{
				title: i18n.t("common.actions"),
				key: 'actions',
				width: 100,
				render: (_text, record) => (
					<Space size="middle">
						<Link to={serviceInstance.createAdminUrl("/accounting/accounts/edit/"+record.id)}><EditOutlined /></Link>
						<Popconfirm 
							title={i18n.t("pages.accounting_accounts.remove", {label: record.label})}
							onConfirm={() => onConfirmRemove(record)} 
							okText="Yes" 
							cancelText="No">
							<a><DeleteOutlined /></a>
						</Popconfirm>
					</Space>
				),
			}
		];
	}
	
	const tableContent = (
		<Table
			dataSource={items}
			columns={getColumns()}
			rowKey={record => "accounting_account_" + record.id} 
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
				title={i18n.t("pages.accounting_accounts.list", { count: (items ? items.length : 0) })}
				content={tableContent}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default AccountingAccountsList;
