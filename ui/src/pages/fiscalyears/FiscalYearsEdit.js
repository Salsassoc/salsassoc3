import React from 'react';

import {Form, Input, Button, Switch, DatePicker} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const FiscalYearsEdit = (props) => {

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
			fiscal_year: {
				label: "",
				start_date: null,
				end_date: null,
				is_current: false,
			}
		}
	}

	// Utility function
	function jsonDateTimeReviver(key, value)
	{
		switch(key){
		case 'start_date':
		case 'end_date':
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
		return loadFiscalYear();
	}

	function loadFiscalYear()
	{
		// Check if mode add
		if(isModeAdd()){
			const defaultObject = getDefaultData();
			return Promise.resolve(defaultObject).then((newDataObject) => {
				setDataObject(newDataObject);
			});
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/fiscal_years/get?id="+dataId);

		// Load data
		return fetchJSON(url, null, jsonDateTimeReviver)
			.then((response) => {
				const newDataObject = response.result.fiscal_year;
				setDataObject(newDataObject);
			});
	}

	// Form management
	function onFinish(values)
	{
		pageLoader.startSaving();

		// Convert dates to the desired format
		if (values.start_date) {
			values.start_date = values.start_date.format('YYYY-MM-DD');
		}
		if (values.end_date) {
			values.end_date = values.end_date.format('YYYY-MM-DD');
		}

		let path;
		if(isModeAdd()){
			path = "/fiscal_years/save";
		}else{
			path = "/fiscal_years/save?id="+dataId;
		}
		let url = serviceInstance.createServiceUrl(path);

		const opts = {
			method: "POST",
			body: JSON.stringify(values)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving(i18n.t("pages.fiscal_year.saved"));
				if(isModeAdd()){
					const url = serviceInstance.createAdminUrl("/fiscal_years/list");
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
			pageTitle = i18n.t("pages.fiscal_year.edit_title");
		}else{
			pageTitle = i18n.t("pages.fiscal_year.add_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl("/fiscal_years/list"),
				breadcrumbName: i18n.t("pages.fiscal_years.title"),
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
				name="fiscal_year-edit-form"
				onFinish={onFinish}
				form={formInstance}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}>
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t("pages.fiscal_year.section_general")}>

					<Form.Item name={['title']} label={i18n.t("models.fiscal_years.title")} rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.Item name={['start_date']} label={i18n.t("models.fiscal_years.start_date")} rules={[{ required: true }]}>
						<DatePicker format={i18n.t("common.date_format")} />
					</Form.Item>

					<Form.Item name={['end_date']} label={i18n.t("models.fiscal_years.end_date")} rules={[{ required: true }]}>
						<DatePicker format={i18n.t("common.date_format")} />
					</Form.Item>

					<Form.Item name={['is_current']} label={i18n.t("models.fiscal_years.is_current")} rules={[{ type: 'boolean' }]} valuePropName="checked">
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

export default FiscalYearsEdit;
