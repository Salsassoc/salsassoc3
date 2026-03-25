import React from 'react';
import {Descriptions, Grid, Space} from 'antd';

import i18n from '../../utils/i18n.js';

import AccountingOperationsFinancialReportSummaryItem from "./AccountingOperationsFinancialReportSummaryItem.js";
import AccountingOperationsFinancialReportGroup from "./AccountingOperationsFinancialReportGroup.js";
import CurrencyText from "../common/CurrencyText.js";
import AccountingOperationsFinancialReportSectionTitle from "./AccountingOperationsFinancialReportSectionTitle.js";

const AccountingOperationsFinancialReportProjectsSummary = (props) => {
	const projectGroups = props.projectGroups;

	let columnCount = 1;

	const screens = Grid.useBreakpoint();
	if(screens.xs){
		columnCount = 1;
	}

	return (
		<Space orientation="vertical">
			<AccountingOperationsFinancialReportSectionTitle title={i18n.t("pages.accounting_operations_financial_report.projects_report")} />
			<Descriptions
				size="small"
				bordered={true}
				column={columnCount}
				styles={{label: {minWidth: '250px'}}}
			>
				{projectGroups.map(group => {
					const balance = group.items.incomes.total + group.items.outcomes.total;

					return (
						<Descriptions.Item label={group.title}>
							<AccountingOperationsFinancialReportSummaryItem
								incomesTotal={group.items.incomes.total}
								outcomesTotal={group.items.outcomes.total}
								balance={balance}
							/>
						</Descriptions.Item>
					);
				})}
			</Descriptions>
		</Space>
	);
}

export default AccountingOperationsFinancialReportProjectsSummary;
