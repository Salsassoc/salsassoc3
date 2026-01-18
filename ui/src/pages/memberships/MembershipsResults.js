import React from 'react';
import {Link} from "react-router-dom";

import {Space, Popconfirm, Table, Tag} from 'antd';
import {EditOutlined, DeleteOutlined, QuestionCircleOutlined, ManOutlined, WomanOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import {AppContext} from "../../layout/AppContext.js";

import i18n from '../../utils/i18n.js';

const MembershipsResults = (props) => {

	const items = props.items;
	const onConfirmRemove = props.onConfirmRemove;

	// Get application context
	const appContext = React.useContext(AppContext);
 const serviceInstance = appContext.serviceInstance;

 function getColor(type) {
     if (type === 'female'){
         return '#eb2f96'; // pink
     }
     if (type === 'male'){
         return '#1890ff'; // blue
     }
     return '#8c8c8c'; // grey
 }

 function renderGender(_text, record){
     const g = (record.gender == null ? 0 : record.gender);
     let type = 'unknown';
     if (g === 2){ type = 'female'; }
     else if (g === 1){ type = 'male'; }

     const color = getColor(type);
     const style = { color };
     if (type === 'female'){
         return <WomanOutlined style={style} title={i18n.t('models.member.gender_female')} />;
     }
     if (type === 'male'){
         return <ManOutlined style={style} title={i18n.t('models.member.gender_male')} />;
     }
     return <QuestionCircleOutlined style={style} title={i18n.t('models.member.gender_unknown')} />;
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
			4: i18n.t('models.membership.payment_method_banktransfert'),
			5: i18n.t('models.membership.payment_method_helloasso'),
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
					<a><DeleteOutlined /></a>
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
                render: renderLastname,
                sorter: (a, b) => a.lastname.localeCompare(b.lastname)
            },
            {
                title: i18n.t('models.member.firstname'),
                dataIndex: 'firstname',
                key: 'firstname',
                render: renderFirstname,
                sorter: (a, b) => a.firstname.localeCompare(b.firstname)
            },
            {
                title: i18n.t('models.member.gender'),
                dataIndex: 'gender',
                key: 'gender',
                align: 'center',
                width: 60,
                render: renderGender,
                sorter: (a, b) => (Number(a.gender || 0) - Number(b.gender || 0))
            },
            {
                title: i18n.t('models.member.birthdate'),
                dataIndex: 'birthdate',
                key: 'birthdate',
                render: renderBirthdate,
                sorter: (a, b) => dayjs(a.birthdate).unix() - dayjs(b.birthdate).unix()
            },
			{
				title: i18n.t('models.member.city'),
				key: 'city',
				render: renderCity,
				sorter: (a, b) => a.city.localeCompare(b.city)
			},
			{
				title: i18n.t('models.member.email'),
				dataIndex: 'email',
				key: 'email',
				sorter: (a, b) => a.email.localeCompare(b.email)
			},
			{
				title: i18n.t('models.member.phonenumber'),
				dataIndex: 'phonenumber',
				key: 'phonenumber',
				sorter: (a, b) => a.email.localeCompare(b.email)
			},
			{
				title: i18n.t('models.member.image_rights'),
				key: 'image_rights',
				render: renderImageRights,
				sorter: (a, b) => (a.image_rights === b.image_rights) ? 0 : (a.image_rights ? 1 : -1)
			},
			{
				title: i18n.t('models.membership.date'),
				dataIndex: 'membership_date',
				key: 'membership_date',
				render: renderDate,
				sorter: (a, b) => dayjs(a.membership_date).unix() - dayjs(b.membership_date).unix()
			},
			{
				title: i18n.t('models.membership.type'),
				dataIndex: 'membership_type',
				key: 'membership_type',
				render: renderType,
				sorter: (a, b) => (a.membership_type === b.membership_type) ? 0 : (a.membership_type > b.membership_type ? 1 : -1)
			},
			{
				title: i18n.t('pages.members.collected_amount'),
				key: 'collected_amount',
				align: 'right',
				render: renderCollectedAmount,
				sorter: (a, b) => (a.collected_amount - b.collected_amount)
			},
			{
				title: i18n.t('models.membership.payment'),
				key: 'payment',
				render: renderPaymentMethods,
				sorter: (a, b) => (a.payment_methods === b.payment_methods) ? 0 : (a.payment_methods > b.payment_methods ? 1 : -1)
			},
			{
				title: i18n.t("common.actions"),
				key: 'action',
				render: renderActions
			},
		];
	}

	return (
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
};

export default MembershipsResults;