import React from 'react';

import {Form, Input, Button, DatePicker, Select, Switch} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const MembersEdit = (props) => {

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
			lastname: "",
			firstname: "",
			gender: 0,
			birthdate: null,
			email: "",
			phonenumber: "",
			creation_date: null,
			password: "",
			is_member: false,
			image_rights: false,
			comments: "",
			address: "",
			zipcode: "",
			city: "",
			phonenumber2: "",
		}
	}

	// Utility function
	function jsonDateTimeReviver(key, value)
	{
		switch(key){
		case 'birthdate':
			if(value == null || value === 0){
				return null;
			}
			return dayjs(value, "YYYY-MM-DD");
		case 'creation_date':
			if(value == null || value === 0){
				return null;
			}
			// Try parse datetime
			return dayjs(value, ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD"]);
		default:
			break;
		}
		return value;
	}

	function loadData()
	{
		return loadMember();
	}

	function loadMember()
	{
		// Check if mode add
		if(isModeAdd()){
			const defaultObject = getDefaultData();
			return Promise.resolve(defaultObject).then((newDataObject) => {
				setDataObject(newDataObject);
			});
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/members/get?id="+dataId);

		// Load data
		return fetchJSON(url, null, jsonDateTimeReviver)
			.then((response) => {
				const newDataObject = response.result.member;
				setDataObject(newDataObject);
			});
	}

	// Form management
	function onFinish(values)
	{
		pageLoader.startSaving();

		// Convert dates to the desired format
		if (values.birthdate) {
			values.birthdate = values.birthdate.format('YYYY-MM-DD');
		}
		if (values.creation_date) {
			values.creation_date = values.creation_date.format('YYYY-MM-DD HH:mm:ss');
		}

		let path;
		if(isModeAdd()){
			path = "/members/save";
		}else{
			path = "/members/save?id="+dataId;
		}
		let url = serviceInstance.createServiceUrl(path);

		const opts = {
			method: "POST",
			body: JSON.stringify(values)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving(i18n.t("pages.member.saved"));
				if(isModeAdd()){
					const url = serviceInstance.createAdminUrl("/members/list");
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
			pageTitle = i18n.t("pages.member.edit_title");
		}else{
			pageTitle = i18n.t("pages.member.add_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl("/members/list"),
				breadcrumbName: i18n.t("pages.members.title"),
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
				name="member-edit-form"
				onFinish={onFinish}
				form={formInstance}
			>
				<PageContentAlertError pageLoader={pageLoader} />

				<Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}> 
					<Input />
				</Form.Item>

				<FormEditSection title={i18n.t("pages.member.section_general")}> 

					<Form.Item name={['lastname']} label={i18n.t("models.member.lastname")} rules={[{ required: true }]}> 
						<Input />
					</Form.Item>

					<Form.Item name={['firstname']} label={i18n.t("models.member.firstname")} rules={[{ required: true }]}> 
						<Input />
					</Form.Item>

					<Form.Item name="gender" label={i18n.t("models.member.gender")}>
						<Select
							options={[
								{ value: 0, label: i18n.t('models.member.gender_unknown') },
								{ value: 1, label: i18n.t('models.member.gender_male') },
								{ value: 2, label: i18n.t('models.member.gender_female') },
							]}
						/>
					</Form.Item>

					<Form.Item name={['birthdate']} label={i18n.t("models.member.birthdate")}>
						<DatePicker format={i18n.t("common.date_format")} />
					</Form.Item>

					<Form.Item name={['email']} label={i18n.t("models.member.email")}> 
						<Input />
					</Form.Item>

					<Form.Item name={['phonenumber']} label={i18n.t("models.member.phonenumber")}> 
						<Input />
					</Form.Item>

					<Form.Item name={['phonenumber2']} label={i18n.t("models.member.phonenumber2")}> 
						<Input />
					</Form.Item>

					<Form.Item name={['address']} label={i18n.t("models.member.address")}>
						<Input />
					</Form.Item>

					<Form.Item name={['zipcode']} label={i18n.t("models.member.zipcode")}>
						<Input />
					</Form.Item>

					<Form.Item name={['city']} label={i18n.t("models.member.city")}>
						<Input />
					</Form.Item>

					<Form.Item name={['creation_date']} label={i18n.t("models.member.creation_date")}>
						<DatePicker showTime format={'YYYY-MM-DD HH:mm:ss'} />
					</Form.Item>

					<Form.Item name={['password']} label={i18n.t("models.member.password")}>
						<Input.Password />
					</Form.Item>

					<Form.Item name={['is_member']} label={i18n.t("models.member.is_member")} valuePropName="checked">
						<Switch />
					</Form.Item>

					<Form.Item name={['image_rights']} label={i18n.t("models.member.image_rights")} valuePropName="checked">
						<Switch />
					</Form.Item>

					<Form.Item name={['comments']} label={i18n.t("models.member.comments")}>
						<Input.TextArea rows={4} />
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

export default MembersEdit;
