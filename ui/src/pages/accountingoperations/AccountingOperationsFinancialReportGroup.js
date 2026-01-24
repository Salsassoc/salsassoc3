import React from 'react';
import { Row, Col } from 'antd';

import i18n from '../../utils/i18n.js';

const AccountingOperationsFinancialReportGroup = (props) => {
	// Props: items { incomes, outcomes }, renderColumn(title, data)
	const { items, renderColumn } = props;

	return (
		<Row gutter={16}>
			<Col xs={24} md={12}>
				{renderColumn(i18n.t('pages.accounting_operations_financial_report.incomes'), items.incomes)}
			</Col>
			<Col xs={24} md={12}>
				{renderColumn(i18n.t('pages.accounting_operations_financial_report.outcomes'), items.outcomes)}
			</Col>
		</Row>
	);
};

export default AccountingOperationsFinancialReportGroup;
