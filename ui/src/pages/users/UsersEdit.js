import React from 'react';

import {Form, Input, Button, Switch} from 'antd';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const UsersEdit = (props) => {

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
			user: {
				first_name: "",
				last_name: "",
				email: "",
				is_admin: false,
				is_active: true,
				password: "",
			}
		}
	}

	function loadData()
	{
		return loadUser();
	}

	function loadUser()
	{
		// Check if mode add
		if(isModeAdd()){
			const defaultObject = getDefaultData();
			return Promise.resolve(defaultObject).then((newDataObject) => {
				setDataObject(newDataObject.user);
			});
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/users/get?id="+dataId);

		// Load data
		return fetchJSON(url)
			.then((response) => {
				const newDataObject = response.result.user;
				newDataObject.is_active = !newDataObject.deleted;
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
			path = "/users/save";
		}else{
			path = "/users/save?id="+dataId;
		}
		let url = serviceInstance.createServiceUrl(path);

		const body = {
			...values,
			deleted: !values.is_active
		};

		const opts = {
			method: "POST",
			body: JSON.stringify(body)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving(i18n.t("pages.user.saved"));
				if(isModeAdd()){
					const url = serviceInstance.createAdminUrl("/users/list");
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
			pageTitle = i18n.t("pages.user.edit_title");
		}else{
			pageTitle = i18n.t("pages.user.add_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl("/users/list"),
				breadcrumbName: i18n.t("pages.users.title"),
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
				name="user-edit-form"
				onFinish={onFinish}
				form={formInstance}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true}>
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t("pages.user.section_general")}>

					<Form.Item name={['first_name']} label={i18n.t("models.user.first_name")} rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.Item name={['last_name']} label={i18n.t("models.user.last_name")} rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.Item name={['email']} label={i18n.t("models.user.email")} rules={[{ required: true, type: 'email' }]}>
						<Input />
					</Form.Item>

					<Form.Item name={['is_admin']} label={i18n.t("models.user.is_admin")} valuePropName="checked">
						<Switch />
					</Form.Item>

					<Form.Item name={['is_active']} label={i18n.t("models.user.is_active")} valuePropName="checked">
						<Switch />
					</Form.Item>

					<Form.Item 
						name={['password']} 
						label={i18n.t("models.user.password")} 
						rules={[{ required: isModeAdd() }]}
						extra={!isModeAdd() ? i18n.t("pages.user.password_extra") : null}
					>
						<Input.Password />
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

export default UsersEdit;
