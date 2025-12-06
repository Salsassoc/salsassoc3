import React from 'react';

import {Form, Input, Button, Select} from 'antd';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const AccountingAccountsEdit = (props) => {

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
			type: 0,
		}
	}

	function loadData()
	{
		return loadAccount();
	}

	function loadAccount()
	{
		// Check if mode add
		if(isModeAdd()){
			return Promise.resolve(dataObject);
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/accounting/accounts/get?id="+dataId);

		// Load data
		return fetchJSON(url)
			.then((response) => {
				const newDataObject = response.result.accounting_account;
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
			path = "/accounting/accounts/save";
		}else{
			path = "/accounting/accounts/save?id="+dataId;
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
					const url = serviceInstance.createAdminUrl("/accounting/accounts/list");
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
			pageTitle = i18n.t("pages.accounting_accounts.add_title");
		}else{
			pageTitle = i18n.t("pages.accounting_accounts.edit_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl('/accounting/accounts/list'),
				breadcrumbName: i18n.t("pages.accounting_accounts.title"),
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
				name="accounting_account-edit-form"
				onFinish={onFinish}
				form={formInstance}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}> 
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t("pages.accounting_accounts.section_general")}>

					<Form.Item name={['label']} label={i18n.t("models.accounting_account.label")} rules={[{ required: true }]}> 
						<Input />
					</Form.Item>

					<Form.Item name={['type']} label={i18n.t("models.accounting_account.type")}>
						<Select
							options={[
								{ value: 0, label: i18n.t('models.accounting_account.type_other') },
								{ value: 1, label: i18n.t('models.accounting_account.type_cash') },
								{ value: 2, label: i18n.t('models.accounting_account.type_bank') },
							]}
						/>
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

export default AccountingAccountsEdit;
