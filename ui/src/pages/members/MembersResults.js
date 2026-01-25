import React from 'react';
import {Link} from "react-router-dom";

import {Space, Popconfirm, Table} from 'antd';
import {EditOutlined, DeleteOutlined, QuestionCircleOutlined, ManOutlined, WomanOutlined} from '@ant-design/icons';

import dayjs from 'dayjs';

import {AppContext} from "../../layout/AppContext.js";

import i18n from '../../utils/i18n.js';
import CurrencyText from "../common/CurrencyText.js";

const MembersResults = (props) => {

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

	function sortText(a, b) {
		if (!a && !b) {
			return 0;
		}
		if(!a){
			return 1;
		}
		if(!b){
			return -1;
		}
		return a.localeCompare(b);
	}

	function renderLastname(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.lastname}</span>;
	}

	function renderFirstname(_text, record){
		return <span style={{textWrap:'nowrap'}}>{record.firstname}</span>;
	}

	function renderBirthdate(_text, record)
	{
		if(!record.birthdate){
			return '/';
		}
		return dayjs(record.birthdate, "YYYY-MM-DD").format(i18n.t('common.date_format'));
	}

	function sortBirthdate(a, b)
	{
		if(!a.birthdate && !b.birthdate){
			return 0;
		}
		if(!a.birthdate){
			return 1;
		}
		if(!b.birthdate){
			return -1;
		}
		return dayjs(a.birthdate, "YYYY-MM-DD").unix() - dayjs(b.birthdate, "YYYY-MM-DD").unix();
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

	function renderCollectedAmount(_text, record)
	{
		return <CurrencyText value={record.collected_amount || 0} />
	}

	function renderActions(_text, record)
	{
		return (
			<Space size="middle">
				<Link to={serviceInstance.createAdminUrl("/members/edit/"+record.id)}><EditOutlined /></Link>
				<Popconfirm title={i18n.t('pages.members.remove', {label: record.lastname + ' ' + record.firstname})}
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
	            sorter: (a, b) => sortText(a.lastname, b.lastname)
            },
            {
                title: i18n.t('models.member.firstname'),
                dataIndex: 'firstname',
                key: 'firstname',
                render: renderFirstname,
	            sorter: (a, b) => sortText(a.firstname, b.firstname)
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
	            sorter: sortBirthdate
            },
			{
				title: i18n.t('models.member.city'),
				key: 'city',
				render: renderCity,
				sorter: (a, b) => sortText(a.city, b.city)
			},
			{
				title: i18n.t('models.member.email'),
				dataIndex: 'email',
				key: 'email',
				render: renderEmail,
				sorter: (a, b) => sortText(a.email, b.email)
			},
			{
				title: i18n.t('models.member.phonenumber'),
				dataIndex: 'phonenumber',
				key: 'phonenumber',
				render: renderPhone,
				sorter: (a, b) => sortText(a.phonenumber, b.phonenumber)
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
				render: renderMembershipCount,
				sorter: (a, b) => (a.membership_count - b.membership_count)
			},
			{
				title: i18n.t('pages.members.collected_amount'),
				dataIndex: 'collected_amount',
				key: 'collected_amount',
				align: 'right',
				render: renderCollectedAmount,
				sorter: (a, b) => (a.collected_amount - b.collected_amount)
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