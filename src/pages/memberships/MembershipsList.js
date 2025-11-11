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

const MembershipsList = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Define data state
	const [items, setItems] = React.useState([]);

	// Data loading and initialization
	function loadData()
	{
		return loadMembershipsList();
	}

	function loadMembershipsList()
	{
		let url = serviceInstance.createServiceUrl("/memberships/list");

		return fetchJSON(url)
			.then((response) => {
				const items = response.result.memberships || [];
				setItems(items);
			});
	}

	function onConfirmRemove(record)
	{
		pageLoader.startRemoving();

		let url = serviceInstance.createServiceUrl("/memberships/delete?id="+record.id);

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
		let pageTitle = i18n.t("pages.memberships.title");

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
		return <ButtonAdd title={i18n.t("common.add")} url={serviceInstance.createAdminUrl("/memberships/add")} />;
	}

	function renderLastname(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.lastname}</span>;
	}
	function renderFirstname(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.firstname}</span>;
	}
	function renderBirthdate(_text, record){
		if(!record.birthdate){ return null; }
		return dayjs(record.birthdate, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}
	function renderCity(_text, record){
		const city = record.city || '';
		const zip = record.zipcode ? ` (${record.zipcode})` : '';
		return <span>{city}{zip}</span>;
	}
	function renderImageRights(_text, record){
		return <span>{record.image_rights ? i18n.t('common.yes') : i18n.t('common.no')}</span>;
	}
	function renderDate(_text, record){
		if(!record.membership_date){ return null; }
		return dayjs(record.membership_date, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}
	function renderType(_text, record){
		const map = {
			'': i18n.t('models.membership.type_unknown'),
			0: i18n.t('models.membership.type_unknown'),
			1: i18n.t('models.membership.type_standard'),
			2: i18n.t('models.membership.type_young'),
			3: i18n.t('models.membership.type_board'),
			4: i18n.t('models.membership.type_teacher'),
		};
		const label = map[record.membership_type] || record.membership_type;
		return <span>{label}</span>;
	}
	function formatCurrency(value) {
		try {
			const n = Number(value || 0);
			return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
		} catch(_e){
			return (Number(value || 0)).toFixed(2) + ' €';
		}
	}
	function renderCollectedAmount(_text, record){
		return <span>{formatCurrency(record.collected_amount)}</span>;
	}
	function renderPaymentMethods(_text, record){
		const map = {
			null: i18n.t('models.membership.payment_method_unknown'),
			0: i18n.t('models.membership.payment_method_none'),
			1: i18n.t('models.membership.payment_method_check'),
			2: i18n.t('models.membership.payment_method_cash'),
			3: i18n.t('models.membership.payment_method_card'),
		};
		const list = (record.payment_methods || []).map(v => map[v] || v);
		if(list.length === 0){ return null; }
		return (
			<Space size="small">
				{list.map((label, idx) => <Tag key={idx}>{label}</Tag>)}
			</Space>
		);
	}
	function renderActions(_text, record)
	{
		return (
			<Space size="middle">
				<Link to={serviceInstance.createAdminUrl("/memberships/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.memberships.remove', {label: record.lastname+" "+record.firstname})}
							onConfirm={() => onConfirmRemove(record)}>
					<a href="#remove"><DeleteOutlined /></a>
				</Popconfirm>
			</Space>
		);
	}

	function getColumns()
	{
		return [
			{ title: i18n.t('models.member.lastname'), dataIndex: 'lastname', key: 'lastname', render: renderLastname },
			{ title: i18n.t('models.member.firstname'), dataIndex: 'firstname', key: 'firstname', render: renderFirstname },
			{ title: i18n.t('models.member.birthdate'), dataIndex: 'birthdate', key: 'birthdate', render: renderBirthdate },
			{ title: i18n.t('models.member.city'), key: 'city', render: renderCity },
			{ title: i18n.t('models.member.email'), dataIndex: 'email', key: 'email' },
			{ title: i18n.t('models.member.phonenumber'), dataIndex: 'phonenumber', key: 'phonenumber' },
			{ title: i18n.t('models.member.image_rights'), key: 'image_rights', render: renderImageRights },
			{ title: i18n.t('models.membership.date'), dataIndex: 'membership_date', key: 'membership_date', render: renderDate },
			{ title: i18n.t('models.membership.type'), dataIndex: 'membership_type', key: 'membership_type', render: renderType },
			{ title: i18n.t('pages.members.collected_amount'), key: 'collected_amount', align: 'right', render: renderCollectedAmount },
			{ title: i18n.t('models.membership.payment'), key: 'payment', render: renderPaymentMethods },
			{ title: i18n.t("common.actions"), key: 'action', render: renderActions },
		];
	}

	const tableContent = (
		<Table
			dataSource={items}
			columns={getColumns()}
			rowKey={record => "membership_" + record.id}
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
				title={i18n.t("pages.memberships.list")}
				content={tableContent}
				actions={tableActions}
			/>
		</PageContentLayout>
	)
};

export default MembershipsList;
