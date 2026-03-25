import React, {Fragment} from 'react';
import { Descriptions, Grid } from 'antd';

import i18n from '../../utils/i18n.js';

import CurrencyText from "../common/CurrencyText.js";

const AccountingOperationsFinancialReportSummaryItem = (props) => {

	const incomesTotal = props.incomesTotal;
	const outcomesTotal = props.outcomesTotal;
	const balance = props.balance;

	let columnCount = 3;

	const screens = Grid.useBreakpoint();
	if(screens.xs){
		columnCount = 1;
	}

	return (
		<Descriptions bordered={false} column={columnCount}>
			<Descriptions.Item label={i18n.t('pages.fiscal_years.income')}>
				<CurrencyText value={incomesTotal} />
			</Descriptions.Item>
			<Descriptions.Item label={i18n.t('pages.fiscal_years.outcome')}>
				<CurrencyText value={outcomesTotal} />
			</Descriptions.Item>
			<Descriptions.Item label={i18n.t('pages.fiscal_years.balance')}>
				<CurrencyText value={balance} colored={true} />
			</Descriptions.Item>
		</Descriptions>
	);
}

export default AccountingOperationsFinancialReportSummaryItem;
