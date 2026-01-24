import React from 'react';

import {Form, Input, Button, DatePicker, Select} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const ProjectsEdit = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Load get params
	const dataId = props.router.params.id;

	// Define data state
	const [dataObject, setDataObject] = React.useState(getDefaultData());
	const [fiscalYears, setFiscalYears] = React.useState([]);

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
			project: {
				name: "",
				project_date: null,
				fiscal_year_id: null,
			}
		}
	}

	// Utility function
	function jsonDateTimeReviver(key, value)
	{
		switch(key){
		case 'project_date':
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
		return loadProject()
			.then(_result => loadFiscalYears());
	}

	function loadProject()
	{
		// Check if mode add
		if(isModeAdd()){
			const defaultObject = getDefaultData();
			return Promise.resolve(defaultObject).then((newDataObject) => {
				setDataObject(newDataObject);
			});
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/projects/get?id="+dataId);

		// Load data
		return fetchJSON(url, null, jsonDateTimeReviver)
			.then((response) => {
				const newDataObject = response.result.project;
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

	// Form management
	function onFinish(values)
	{
		pageLoader.startSaving();

		// Normalize date values before save
		if (values.project_date) {
			values.project_date = values.project_date.format('YYYY-MM-DD');
		}

		let path;
		if(isModeAdd()){
			path = "/projects/save";
		}else{
			path = "/projects/save?id="+dataId;
		}
		let url = serviceInstance.createServiceUrl(path);

		const opts = {
			method: "POST",
			body: JSON.stringify(values)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving(i18n.t("pages.projects.saved"));
				if(isModeAdd()){
					const url = serviceInstance.createAdminUrl("/projects/list");
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
			pageTitle = i18n.t("pages.project.edit_title");
		}else{
			pageTitle = i18n.t("pages.project.add_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl("/projects/list"),
				breadcrumbName: i18n.t("pages.projects.title"),
			}
		];

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageBreadcrumb: pageBreadcrumb
		}
		return layoutData;
	}

	function getFiscalYearOptions()
	{
		return (fiscalYears || []).map(y => ({ value: y.id, label: y.title }));
	}

	// Build options for fiscal years
	const fiscalYearOptions = getFiscalYearOptions();

	// Handle dataObject update
	React.useEffect(() => {
		formInstance.setFieldsValue(dataObject);
	}, [dataObject]);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<FormEdit
				name="project-edit-form"
				form={formInstance}
				onFinish={onFinish}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}>
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t('pages.project.section_general')}>
					<Form.Item name={["name"]} label={i18n.t('models.project.name')} rules={[{ required: true }]}> 
						<Input />
					</Form.Item>
					<Form.Item name={["project_date"]} label={i18n.t('models.project.project_date')}> 
						<DatePicker format={i18n.t("common.date_format")} />
					</Form.Item>
					<Form.Item name={["fiscal_year_id"]} label={i18n.t('models.project.fiscal_year')} rules={[{ required: true }]}> 
						<Select options={fiscalYearOptions} style={{width: "300px"}} />
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

export default ProjectsEdit;
