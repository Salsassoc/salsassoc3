import React from 'react';
import {Link} from "react-router-dom";

import {Space, Popconfirm, Table} from 'antd';
import {EditOutlined, DeleteOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import {AppContext} from "../../layout/AppContext.js";

import i18n from '../../utils/i18n.js';

const MembersResults = (props) => {

	const items = props.items;
	const onConfirmRemove = props.onConfirmRemove;

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;

	function renderLastname(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.lastname}</span>;
	}

	function renderFirstname(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.firstname}</span>;
	}

	function renderBirthdate(_text, record)
	{
		if(!record.birthdate){ return null; }
		return dayjs(record.birthdate, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}

	function renderCity(_text, record)
	{
		const city = record.city || '';
		const zipcode = record.zipcode ? ` (${record.zipcode})` : '';
		return <span>{city}{zipcode}</span>;
	}

	function renderEmail(_text, record){
		return <span>{record.email || ''}</span>;
	}

	function renderPhone(_text, record){
		return <span>{record.phonenumber || ''}</span>;
	}

	function renderImageRights(_text, record){
		const yesNo = record.image_rights ? i18n.t('common.yes') : i18n.t('common.no');
		return <span>{yesNo}</span>;
	}

	function renderMembershipCount(_text, record){
		const n = record.membership_count || 0;
		return <span>{i18n.t('pages.members.membership_suffix', {"count": n})}</span>;
	}

	function formatCurrency(value) {
		try {
			return new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR' }).format(value || 0);
		} catch (e) {
			return `${value}`;
		}
	}

	function renderCollectedAmount(_text, record)
	{
		return <span>{formatCurrency(record.collected_amount || 0)}</span>;
	}

	function renderActions(_text, record)
	{
		return (
			<Space size="middle">
				<Link to={serviceInstance.createAdminUrl("/members/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.members.remove', {label: record.lastname + ' ' + record.firstname})}
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
				title: i18n.t('models.member.lastname'),
				dataIndex: 'lastname',
				key: 'lastname',
				render: renderLastname
			},
			{
				title: i18n.t('models.member.firstname'),
				dataIndex: 'firstname',
				key: 'firstname',
				render: renderFirstname
			},
			{
				title: i18n.t('models.member.birthdate'),
				dataIndex: 'birthdate',
				key: 'birthdate',
				render: renderBirthdate
			},
			{
				title: i18n.t('models.member.city'),
				key: 'city',
				render: renderCity
			},
			{
				title: i18n.t('models.member.email'),
				dataIndex: 'email',
				key: 'email',
				render: renderEmail
			},
			{
				title: i18n.t('models.member.phonenumber'),
				dataIndex: 'phonenumber',
				key: 'phonenumber',
				render: renderPhone
			},
			{
				title: i18n.t('models.member.image_rights'),
				dataIndex: 'image_rights',
				key: 'image_rights',
				render: renderImageRights
			},
			{
				title: i18n.t('pages.members.membership_count'),
				dataIndex: 'membership_count',
				key: 'membership_count',
				render: renderMembershipCount
			},
			{
				title: i18n.t('pages.members.collected_amount'),
				dataIndex: 'collected_amount',
				key: 'collected_amount',
				align: 'right',
				render: renderCollectedAmount
			},
			{
				title: i18n.t('common.actions'),
				key: 'action',
				render: renderActions,
			}
		];
	}

	return (
		<Table
			dataSource={items}
			columns={getColumns()}
			rowKey={record => "member_" + record.id} 
			pagination={{
				defaultPageSize: 50
			}}
			size="small"
		/>
	);
};

export default MembersResults;