import React from 'react';
import {Collapse, Space} from 'antd';

import i18n from '../../utils/i18n.js';

import AccountingOperationsFinancialReportGroup from "./AccountingOperationsFinancialReportGroup.js";
import AccountingOperationsFinancialReportSectionTitle from "./AccountingOperationsFinancialReportSectionTitle.js";
import CurrencyText from "../common/CurrencyText.js";

const AccountingOperationsFinancialReportProjectsDetails = (props) => {
	const projectGroups = props.projectGroups;

	function getExtra(group) {
		const balance = group.items.incomes.total + group.items.outcomes.total;
		return <CurrencyText value={balance} colored={true} />
	}

	let listOpenKeys = [];

	const items = projectGroups.map((g, index) => {
		listOpenKeys.push(index);
		return {
			key: index,
				label: g.title,
			children: <AccountingOperationsFinancialReportGroup group={g} />,
			extra: getExtra(g),
		}
	});

	return (
		<Space orientation="vertical" style={{width: '100%'}}>
			<AccountingOperationsFinancialReportSectionTitle title={i18n.t("pages.accounting_operations_financial_report.projects_details")} />

			<Collapse
				defaultActiveKey={listOpenKeys}
				//onChange={onChange}
				//expandIconPlacement={expandIconPlacement}
				items={items}
				style={{width: '100%'}}
			/>
		</Space>
	);
}

export default AccountingOperationsFinancialReportProjectsDetails;
