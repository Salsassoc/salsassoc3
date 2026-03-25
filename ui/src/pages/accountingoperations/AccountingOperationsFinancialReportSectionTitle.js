import React from 'react';
import {Typography} from 'antd';

const AccountingOperationsFinancialReportSectionTitle = (props) => {
	const title = props.title;
	return (
		<Typography.Title level={5}>{title}</Typography.Title>
	);
}

export default AccountingOperationsFinancialReportSectionTitle;
