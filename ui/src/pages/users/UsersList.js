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

import UsersSearchForm from './UsersSearchForm.js';

const UsersList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);
	const [filter, setFilter] = React.useState({
		search: null,
	});

	// Data loading and initialization
	function loadData()
	{
		return loadUsersList();
	}

	function loadUsersList()
	{
		let params = "";
		if (filter.search) {
			params += "&search=" + encodeURIComponent(filter.search);
		}

		let url = serviceInstance.createServiceUrl("/users/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.users;
				setItems(items);
			});
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/users/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.users.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/users/add")} />;
	}

	function renderIsAdmin(_text, record)
	{
		if (record.is_admin) {
			return <Tag color="gold">{i18n.t('models.user.admin')}</Tag>;
		}
		return null;
	}

	function renderIsActive(_text, record)
	{
		if (record.deleted) {
			return <Tag color="error">{i18n.t('models.user.inactive')}</Tag>;
		}
		return <Tag color="success">{i18n.t('models.user.active')}</Tag>;
	}

	function renderActions(_text, record)
	{
		return (
			<Space size="middle">
				<Link to={serviceInstance.createAdminUrl("/users/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.users.remove', {name: record.first_name + " " + record.last_name})}
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
				title: i18n.t('models.user.last_name'),
				dataIndex: 'last_name',
				key: 'last_name',
				sorter: (a, b) => a.last_name.localeCompare(b.last_name),
			},
			{
				title: i18n.t('models.user.first_name'),
				dataIndex: 'first_name',
				key: 'first_name',
			},
			{
				title: i18n.t('models.user.email'),
				dataIndex: 'email',
				key: 'email',
			},
			{
				title: i18n.t('models.user.is_admin'),
				dataIndex: 'is_admin',
				key: 'is_admin',
				render: renderIsAdmin
			},
			{
				title: i18n.t('models.user.is_active'),
				dataIndex: 'deleted',
				key: 'is_active',
				render: renderIsActive
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
			search: values.search,
		});
	}

	// Handle dataObject update
	React.useEffect(() => {
		loadUsersList();
	}, [filter]);

	const form = (
		<UsersSearchForm
			onFinish={onFormSearchFinished}
		/>
	);

	const tableContent = (
		<Table
			dataSource={items}
			columns={getColumns()}
			rowKey={record => "user_" + record.id} 
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
				title={i18n.t("pages.users.list", { count: (items ? items.length : 0) })}
				content={tableContent}
				form={form}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default UsersList;
