import React from 'react';

import {Form, Input, Button, DatePicker, Select, InputNumber, Switch} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const AccountingOperationsEdit = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Load get params
	const dataId = props.router.params.id;

	// Define data state
	const [dataObject, setDataObject] = React.useState(getDefaultData());
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [categories, setCategories] = React.useState([]);
	const [accounts, setAccounts] = React.useState([]);

	// Create form instance
	const [formInstance] = Form.useForm();

	// Utility function
	function isModeAdd()
	{
		return (dataId === undefined);
	}

	// Data loading and initialization
	function getDefaultData()
	{
		return {
			accounting_operation: {
				date_value: null,
				date_effective: null,
				label: "",
				category: null,
				op_method: 0,
				op_number: "",
				amount_debit: null,
				amount_credit: null,
				project_id: null,
				checked: false,
				fiscalyear_id: null,
				account_id: null,
				label_bank: "",
			}
		}
	}

	// Utility function
	function jsonDateTimeReviver(key, value)
	{
		switch(key){
		case 'date_value':
		case 'date_effective':
			if(value == null || value === 0){
				return null;
			}
			return dayjs(value, "YYYY-MM-DD");
		default:
			break;
		}
		return value;
	}

	function loadData()
	{
		return loadOperation()
			.then(_result => loadFiscalYears())
			.then(_result => loadCategories())
			.then(_result => loadAccounts());
	}

	function loadOperation()
	{
		// Check if mode add
		if(isModeAdd()){
			return Promise.resolve(dataObject);
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/accounting/operations/get?id="+dataId);

		// Load data
		return fetchJSON(url, null, jsonDateTimeReviver)
			.then((response) => {
				const newDataObject = response.result.accounting_operation;
				setDataObject(newDataObject);
				formInstance.setFieldsValue(newDataObject);
			});
	}

	function loadFiscalYears()
	{
		const url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");
		return fetchJSON(url)
			.then((response) => {
				setFiscalYears(response.result.fiscal_years || []);
			});
	}

	function loadCategories()
	{
		const url = serviceInstance.createServiceUrl("/accounting/operations/categories/list");
		return fetchJSON(url)
			.then((response) => {
				setCategories(response.result.accounting_operations_categories || []);
			});
	}

	function loadAccounts()
	{
		const url = serviceInstance.createServiceUrl("/accounting/accounts/list");
		return fetchJSON(url)
			.then((response) => {
				setAccounts(response.result.accounting_accounts || []);
			});
	}

	// Form management
	function onFinish(values)
	{
		pageLoader.startSaving();

		// Convert dates to the desired format
		if (values.date_value) {
			values.date_value = values.date_value.format('YYYY-MM-DD');
		}
		if (values.date_effective) {
			values.date_effective = values.date_effective.format('YYYY-MM-DD');
		}

		let path;
		if(isModeAdd()){
			path = "/accounting/operations/save";
		}else{
			path = "/accounting/operations/save?id="+dataId;
		}
		let url = serviceInstance.createServiceUrl(path);

		const opts = {
			method: "POST",
			body: JSON.stringify(values)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving(i18n.t("pages.accounting_operation.saved"));
				if(isModeAdd()){
					const url = serviceInstance.createAdminUrl("/accounting/operations/list");
					props.router.navigate(url);
				}else{
					return loadData();
				}
			})
			.catch((error) => {
				pageLoader.errorSaving(error);
			});
	}

	// Compute layout data
	function getLayoutData()
	{
		// Set page title
		let pageTitle;
		if(!isModeAdd()){
			pageTitle = i18n.t("pages.accounting_operation.edit_title");
		}else{
			pageTitle = i18n.t("pages.accounting_operation.add_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl("/accounting/operations/list"),
				breadcrumbName: i18n.t("pages.accounting_operations.title"),
			}
		];

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageBreadcrumb: pageBreadcrumb
		}
		return layoutData;
	}

	// Build options
	const fiscalYearOptions = fiscalYears.map(y => ({ value: y.id, label: y.title }));
	const categoryOptions = categories.map(c => ({ value: c.id, label: c.label }));
	const accountOptions = accounts.map(a => ({ value: a.id, label: a.label }));

	// Handle dataObject update
	React.useEffect(() => {
		formInstance.setFieldsValue(dataObject);
	}, [dataObject]);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<FormEdit
				name="accounting-operation-edit-form"
				onFinish={onFinish}
				form={formInstance}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}> 
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t("pages.accounting_operation.section_general")}>

					<Form.Item name={['date_value']} label={i18n.t("models.accounting_operation.date_value")} rules={[{ required: true }]}>
						<DatePicker format={i18n.t("common.date_format")} />
					</Form.Item>

					<Form.Item name={['date_effective']} label={i18n.t("models.accounting_operation.date_effective")}>
						<DatePicker format={i18n.t("common.date_format")} />
					</Form.Item>

					<Form.Item name={['label']} label={i18n.t("models.accounting_operation.label")} rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.Item name="op_method" label={i18n.t("models.accounting_operation.op_method")}>
						<Select
							options={[
								{ value: 0, label: i18n.t('models.accounting_operation.op_method_unknown') },
								{ value: 10, label: i18n.t('models.accounting_operation.op_method_checkin') },
								{ value: 11, label: i18n.t('models.accounting_operation.op_method_checkout') },
								{ value: 20, label: i18n.t('models.accounting_operation.op_method_cash_in') },
								{ value: 21, label: i18n.t('models.accounting_operation.op_method_cash_out') },
								{ value: 30, label: i18n.t('models.accounting_operation.op_method_transfer_in') },
								{ value: 31, label: i18n.t('models.accounting_operation.op_method_transfer_out') },
								{ value: 32, label: i18n.t('models.accounting_operation.op_method_direct_debit') },
								{ value: 33, label: i18n.t('models.accounting_operation.op_method_interest') },
							]}
						/>
					</Form.Item>

					<Form.Item name={['op_number']} label={i18n.t('models.accounting_operation.op_number')}>
						<Input />
					</Form.Item>

					<Form.Item name={['category']} label={i18n.t('models.accounting_operation.category')}>
						<Select options={categoryOptions} />
					</Form.Item>

					<Form.Item name={['account_id']} label={i18n.t('models.accounting_operation.account')}>
						<Select options={accountOptions} />
					</Form.Item>

					<Form.Item name={['amount_debit']} label={i18n.t('models.accounting_operation.amount_debit')}>
						<InputNumber max={0} step={0.01} />
					</Form.Item>

					<Form.Item name={['amount_credit']} label={i18n.t('models.accounting_operation.amount_credit')}>
						<InputNumber min={0} step={0.01} />
					</Form.Item>

					<Form.Item name={['label_bank']} label={i18n.t('models.accounting_operation.label_bank')}>
						<Input />
					</Form.Item>

					<Form.Item name={['project_id']} label={i18n.t('models.accounting_operation.project_id')}>
						<InputNumber min={0} />
					</Form.Item>

					<Form.Item name={['checked']} valuePropName="checked" label={i18n.t('models.accounting_operation.checked')}>
						<Switch />
					</Form.Item>

					<Form.Item name={['fiscalyear_id']} label={i18n.t("models.accounting_operation.fiscal_year")} rules={[{ required: true }]}>
						<Select options={fiscalYearOptions} />
					</Form.Item>

				</FormEditSection>

				<FormEditItemSubmit>
					<Button type="primary" htmlType="submit">
						{isModeAdd() ? i18n.t("common.add") : i18n.t("common.save")}
					</Button>
				</FormEditItemSubmit>
			</FormEdit>
		</PageContentLayout>
	)
};

export default AccountingOperationsEdit;
