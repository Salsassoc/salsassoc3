import React from 'react';

import {Form, Input, Button, Switch, Select} from 'antd';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const OperationCategoriesEdit = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Load get params
	const dataId = props.router.params.id;

	// Define data state
	const [dataObject, setDataObject] = React.useState(getDefaultData());

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
			label: "",
			account_number: "",
			account_name: "",
			account_type: 0,
			is_internal_move: false,
		}
	}

	function loadData()
	{
		return loadCategory();
	}

	function loadCategory()
	{
		// Check if mode add
		if(isModeAdd()){
			return Promise.resolve(dataObject);
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/accounting_operations/categories/get?id="+dataId);

		// Load data
		return fetchJSON(url)
			.then((response) => {
				const newDataObject = response.result.accounting_operations_category;
				setDataObject(newDataObject);
				formInstance.setFieldsValue(newDataObject);
			});
	}

	// Form management
	function onFinish(values)
	{
		pageLoader.startSaving();

		let path;
		if(isModeAdd()){
			path = "/accounting_operations/categories/save";
		}else{
			path = "/accounting_operations/categories/save?id="+dataId;
		}

		let url = serviceInstance.createServiceUrl(path);

		const opts = {
			method: "POST",
			body: JSON.stringify(values)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving();
				if(isModeAdd()){
					const url = serviceInstance.createAdminUrl("/settings/accounting_operations/categories/list");
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
		if(isModeAdd()){
			pageTitle = i18n.t("pages.accounting_operation_categories.add_title");
		}else{
			pageTitle = i18n.t("pages.accounting_operation_categories.edit_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl('/settings/accounting_operations/categories/list'),
				breadcrumbName: i18n.t("pages.accounting_operation_categories.title"),
			}
		];

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageBreadcrumb: pageBreadcrumb
		}
		return layoutData;
	}

	// Handle dataObject update
	React.useEffect(() => {
		formInstance.setFieldsValue(dataObject);
	}, [dataObject]);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<FormEdit
				name="operation_category-edit-form"
				onFinish={onFinish}
				form={formInstance}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}>
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t("pages.accounting_operation_categories.section_general")}>

					<Form.Item name={['label']} label={i18n.t("models.accounting_operation_category.label")} rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.Item name={['account_number']} label={i18n.t("models.accounting_operation_category.account_number")} rules={[{ required: false }]}>
						<Input />
					</Form.Item>

					<Form.Item name={['account_name']} label={i18n.t("models.accounting_operation_category.account_name")} rules={[{ required: false }]}>
						<Input />
					</Form.Item>

					{/* account_type not requested in list columns but present in data model; keep optional select */}
					<Form.Item name={['account_type']} label={i18n.t("models.accounting_operation_category.account_type")}>
						<Select
							options={[
								{ value: 0, label: i18n.t('models.accounting_operation_category.account_type_unknown') },
								{ value: 6, label: i18n.t('models.accounting_operation_category.account_type_charge') },
								{ value: 7, label: i18n.t('models.accounting_operation_category.account_type_income') },
							]}
						/>
					</Form.Item>

					<Form.Item label={i18n.t("models.accounting_operation_category.is_internal_move")} name={["is_internal_move"]} valuePropName='checked'>
						<Switch />
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

export default OperationCategoriesEdit;
