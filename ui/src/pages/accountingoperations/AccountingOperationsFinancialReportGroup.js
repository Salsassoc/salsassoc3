import React, {Fragment} from 'react';
import {Card, Row, Col, Typography, Divider, Space} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import CurrencyText from "../common/CurrencyText.js";

const AccountingOperationsFinancialReportGroup = (props) => {
	const { group } = props;

	function formatDate(date_value)
	{
		if(!date_value){
			return "--/--/----";
		}
		return dayjs(date_value).format(i18n.t('common.date_format'));
	}

	function renderColumnContentEmpty() {
		return i18n.t('common.no_data');
	}

	function renderColumnContent(data) {
		const values = Array.from(data);
		return values.map(([key, category]) => {
			return (
				<div key={category.id} style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 4 }}>
						<span>{category.label} - {category.account_number}</span>
						<span><CurrencyText value={category.total_amount} /></span>
					</div>
					<div>
						{category.operations.map((it, idx) => (
							<div key={it.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
								<span>{formatDate(it.date)} - {it.label}</span>
								<span><CurrencyText value={category.amount} /></span>
							</div>
						))}
					</div>
				</div>
			)
		});
	}

	function renderColumn(title, data) {
		const total = <Typography.Text strong><CurrencyText value={data.total} /></Typography.Text>;
		const content = (data && data.items.size > 0 ? renderColumnContent(data.items) : renderColumnContentEmpty());
		return (
			<Card title={title} variant="outlined" size="small" type="inner" extra={total}>
				{content}
			</Card>
		);
	}

	const balance = group.items.incomes.total + group.items.outcomes.total;
	const total = <CurrencyText value={balance} colored={true} />;

	return (
		<Card title={group.title} size={"small"} extra={total}>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					{renderColumn(i18n.t('pages.accounting_operations_financial_report.incomes'), group.items.incomes)}
				</Col>
				<Col xs={24} md={12}>
					{renderColumn(i18n.t('pages.accounting_operations_financial_report.outcomes'), group.items.outcomes)}
				</Col>
			</Row>
		</Card>
	);
};

export default AccountingOperationsFinancialReportGroup;
