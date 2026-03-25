import React, {Fragment} from 'react';
import {Space, Descriptions, Grid, Typography} from 'antd';

import i18n from '../../utils/i18n.js';

import AccountingOperationsFinancialReportSummaryItem from "./AccountingOperationsFinancialReportSummaryItem.js";
import AccountingOperationsFinancialReportGroup from "./AccountingOperationsFinancialReportGroup.js";
import CurrencyText from "../common/CurrencyText.js";
import AccountingOperationsFinancialReportSectionTitle from "./AccountingOperationsFinancialReportSectionTitle.js";

const AccountingOperationsFinancialReportSummary = (props) => {

	const incomesTotal = props.incomesTotal;
	const outcomesTotal = props.outcomesTotal;
	const balance = props.balance;

	let columnCount = 1;

	const screens = Grid.useBreakpoint();
	if(screens.xs){
		columnCount = 1;
	}

	return (
		<Space orientation="vertical">
			<AccountingOperationsFinancialReportSectionTitle title={i18n.t("pages.accounting_operations_financial_report.report")} />
			<Descriptions
				size="small"
				bordered={true}
				column={columnCount}
				styles={{label: {minWidth: '250px'}}}
			>
				<Descriptions.Item label={i18n.t('pages.accounting_operations_financial_report.total')}>
					<AccountingOperationsFinancialReportSummaryItem
						incomesTotal={incomesTotal}
						outcomesTotal={outcomesTotal}
						balance={balance}
					/>
				</Descriptions.Item>
			</Descriptions>
		</Space>
	);
}

export default AccountingOperationsFinancialReportSummary;
