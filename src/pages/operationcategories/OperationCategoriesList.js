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

const OperationCategoriesList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);

	// Data loading and initialization
	function loadData()
	{
		return loadCategoriesList();
	}

	function loadCategoriesList()
	{
		let url = serviceInstance.createServiceUrl("/accounting_operations/categories/list");

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.accounting_operations_categories;
				setItems(items);
			});
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/accounting_operations/categories/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.accounting_operation_categories.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/accounting/operations/categories/add")} />;
	}

	function renderIsInternalMove(_text, record)
	{
		return (
			<Tag>{record.is_internal_move ? i18n.t("common.yes") : i18n.t("common.no")}</Tag>
		);
	}

	function getColumns()
	{
		return [
			{
				title: i18n.t('models.accounting_operation_category.label'),
				dataIndex: 'label',
				key: 'label',
			},
			{
				title: i18n.t('models.accounting_operation_category.account_number'),
				dataIndex: 'account_number',
				align: 'center',
				key: 'account_number'
			},
			{
				title: i18n.t('models.accounting_operation_category.account_name'),
				dataIndex: 'account_name',
				key: 'account_name'
			},
			{
				title: i18n.t('models.accounting_operation_category.is_internal_move'),
				key: 'is_internal_move',
				align: 'center',
				render: renderIsInternalMove
			},
			{
				title: i18n.t("common.actions"),
				key: 'actions',
				width: 100,
				render: (_text, record) => (
					<Space size="middle">
						<Link to={serviceInstance.createAdminUrl("/accounting/operations/categories/edit/"+record.id)}><EditOutlined /></Link>
						<Popconfirm 
							title={i18n.t("pages.accounting_operation_categories.remove", {label: record.label})}
							onConfirm={() => onConfirmRemove(record)} 
							okText="Yes" 
							cancelText="No">
							<a href="#delete"><DeleteOutlined /></a>
						</Popconfirm>
					</Space>
				),
			}
		];
	}
	
	const tableContent = (
		<Table
			columns={getColumns()}
			dataSource={items}
			rowKey={record => "accounting_operation_category_" + record.id} 
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
				title={i18n.t("pages.accounting_operation_categories.list")}
				content={tableContent}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default OperationCategoriesList;
