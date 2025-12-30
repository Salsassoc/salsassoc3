import React from 'react';
import { Row, Col, Card, Descriptions, Space } from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';
import { fetchJSON } from '../../authentication/backend.js';

import TCALayout from '../../components/layout/TCALayout.js';

import { AppContext } from '../../layout/AppContext.js';
import PageContentLayout from '../../layout/PageContentLayout.js';

import AccountingOperationsFinancialReportSearchForm from './AccountingOperationsFinancialReportSearchForm.js';

const AccountingOperationsFinancialReport = (props) => {

	// Context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// State
	const [items, setItems] = React.useState([]);
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [accounts, setAccounts] = React.useState([]);
	const [filter, setFilter] = React.useState({
		fiscalYearId: null,
		dateStart: null,
		dateEnd: null,
		accountingAccountId: null,
	});

	// Data loading and initialization
	function loadData() {
		return loadOperationsList()
			.then(_result => loadFiscalYears())
			.then(_result => loadAccounts());
	}

	function loadOperationsList() {
		let params = "";
		if (filter.fiscalYearId) {
			params += "&fiscal_year_id=" + filter.fiscalYearId;
		}
		if (filter.dateStart) {
			params += `&date_start=${filter.dateStart}`;
		}
		if (filter.dateEnd) {
			params += `&date_end=${filter.dateEnd}`;
		}
		if (filter.accountingAccountId) {
			params += `&account_id=${filter.accountingAccountId}`;
		}

		let url = serviceInstance.createServiceUrl("/accounting/operations/list?" + params);

		return fetchJSON(url)
			.then((response) => {
				const rawItems = response.result.accounting_operations || [];
				setItems(computeItemsByCategory(rawItems));
			});
	}

	function loadFiscalYears() {
		const url = serviceInstance.createServiceUrl('/fiscal_years/list?order=desc');
		return fetchJSON(url).then(res => {
			setFiscalYears(res.result.fiscal_years || [])
		}
		);
	}

	function loadAccounts() {
		const url = serviceInstance.createServiceUrl('/accounting/accounts/list');
		return fetchJSON(url).then(res => {
			setAccounts(res.result.accounting_accounts || [])
		});
	}

	function computeItemsByCategory(operations) {
		let incomes = new Map();
		let incomes_amount = 0.0;
		let outcomes = new Map();
		let outcomes_amount = 0.0;

		operations.forEach((operation) => {
			const categoryId = operation.category;
			const amount = (operation.amount_credit !== null ? operation.amount_credit : operation.amount_debit);

			const op = {
				id: operation.id,
				label: operation.label,
				date: operation.date_effective,
				amount: amount,
			}

			let group = null;

			if (amount < 0) {
				if (outcomes.has(categoryId)) {
					group = outcomes.get(categoryId);
				} else {
					group = {
						id: categoryId,
						label: operation.category_label,
						account_number: operation.category_account_number,
						total_amount: 0,
						operations: []
					}
				}
				outcomes_amount += amount;
				group.total_amount += amount;
				group.operations.push(op);
				outcomes.set(categoryId, group);
			} else {
				if (incomes.has(categoryId)) {
					group = incomes.get(categoryId);
				} else {
					group = {
						id: categoryId,
						label: operation.category_label,
						account_number: operation.category_account_number,
						total_amount: 0,
						operations: []
					}
				}
				incomes_amount += amount;
				group.total_amount += amount;
				group.operations.push(op);
				incomes.set(categoryId, group);
			}
		})

		return {
			incomes: { items: incomes, total: incomes_amount },
			outcomes: { items: outcomes, total: outcomes_amount }
		}
	}

	// Helpers
	function formatCurrency(value) {
		try {
			const n = Number(value || 0);
			return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
		} catch (_e) {
			return (Number(value || 0)).toFixed(2) + ' €';
		}
	}

	function onFormSearchFinished(values) {
		const f = { ...filter };
		f.fiscalYearId = values.fiscal_year_id || null;

		if (values.year && values.year !== '') {
			f.dateStart = values.year + '-01-01';
			f.dateEnd = values.year + '-12-31';
		}else{
			f.dateStart = null;
			f.dateEnd = null;
		}

		f.accountingAccountId = values.accounting_account_id || null;
		setFilter(f);
	}

	function getLayoutData() {
		// Set page title
		let pageTitle = i18n.t("pages.accounting_operations_financial_report.title");

		// Set page breadcrumb
		const pageBreadcrumb = [
		];

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageBreadcrumb: pageBreadcrumb
		}
		return layoutData;
	}

	function formatDate(date_value)
	{
		if(!date_value){
			return "--/--/----";
		}
		return dayjs(date_value).format(i18n.t('common.date_format'));
	}

	function renderColumnContent(data) {
		const values = Array.from(data);
		return values.map(([key, category]) => {
			return (
				<div key={category.id} style={{ marginBottom: 16 }}>
					<div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 4 }}>
						<span>{category.label} - {category.account_number}</span>
						<span>{formatCurrency(category.total_amount)}</span>
					</div>
					<div>
						{category.operations.map((it, idx) => (
							<div key={it.id || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
								<span>{formatDate(it.date)} - {it.label}</span>
								<span>{formatCurrency((Number(it.amount)))}</span>
							</div>
						))}
					</div>
				</div>
			)
		});
	}

	function renderColumnContentEmpty() {
		return i18n.t('common.no_data');
	}

	function renderColumn(title, data) {
		const content = (data && data.items.size > 0 ? renderColumnContent(data.items) : renderColumnContentEmpty());
		return (
			<Card title={title} variant="outlined" size="small">
				{content}
			</Card>
		);
	}

	// Default to current fiscal year when list is loaded
	React.useEffect(() => {
		if (fiscalYears && fiscalYears.length > 0) {
			const current = fiscalYears.find(y => y.is_current);
			if (current && filter.fiscalYearId == null) {
				setFilter({ fiscalYearId: current.id });
			}
		}
	}, [fiscalYears]);

	// Reload list when filter changes
	React.useEffect(() => {
		loadOperationsList();
	}, [filter]);

	const form = (
		<AccountingOperationsFinancialReportSearchForm
			fiscalYears={fiscalYears}
			defaultFiscalYearId={filter.fiscalYearId}
			accounts={accounts}
			onFinish={onFormSearchFinished}
		/>
	);

	const incomesTotal = items?.incomes?.total || 0;
	const outcomesTotal = items?.outcomes?.total || 0;
	const balance = (incomesTotal + outcomesTotal);
	const balanceColor = balance > 0 ? '#3f8600' : (balance < 0 ? '#cf1322' : undefined);

	const tableContent = (
		<Space direction='vertical'>
			<Card>
				<Descriptions size="small" column={3} >
					<Descriptions.Item label={i18n.t('pages.fiscal_years.income')}>
						{formatCurrency(incomesTotal)}
					</Descriptions.Item>
					<Descriptions.Item label={i18n.t('pages.fiscal_years.outcome')}>
						{formatCurrency(outcomesTotal)}
					</Descriptions.Item>
					<Descriptions.Item label={i18n.t('pages.fiscal_years.balance')}>
						<span style={{ color: balanceColor }}>{formatCurrency(balance)}</span>
					</Descriptions.Item>
				</Descriptions>
			</Card>
			<Row gutter={16}>
				<Col xs={24} md={12}>
					{renderColumn(i18n.t('pages.accounting_operations_financial_report.incomes'), items.incomes)}
				</Col>
				<Col xs={24} md={12}>
					{renderColumn(i18n.t('pages.accounting_operations_financial_report.outcomes'), items.outcomes)}
				</Col>
			</Row>
		</Space>
	);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<TCALayout
				title={i18n.t("pages.accounting_operations_financial_report.report", { count: (items ? items.length : 0) })}
				content={tableContent}
				form={form}
			//actions={tableActions}
			/>
		</PageContentLayout>
	);
}

export default AccountingOperationsFinancialReport;
