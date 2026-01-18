import React from 'react';

import {
	Form,
	Input,
	Button,
	DatePicker,
	Select,
	InputNumber,
	Switch,
	AutoComplete,
	Row,
	Col,
	Space,
	Typography
} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const MembershipsEdit = (props) => {

	// Get application context
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;
	const pageLoader = appContext.pageLoader;

	// Load get params
	const dataId = props.router.params.id;

	// Define data state
	const [dataObject, setDataObject] = React.useState(getDefaultData());
	const [fiscalYears, setFiscalYears] = React.useState([]);
	const [members, setMembers] = React.useState([]);
	const [cotisations, setCotisations] = React.useState([]);
	const [cotisationLines, setCotisationLines] = React.useState([]);

	// Create form instance
	const [form] = Form.useForm();

	// Utility function
	function isModeAdd() {
		return (dataId === undefined);
	}

	// Data loading and initialization
	function getDefaultData() {
		return {
			person_id: null,
			lastname: "",
			firstname: "",
			gender: 0,
			birthdate: null,
			address: "",
			zipcode: null,
			city: "",
			email: "",
			phonenumber: "",
			phonenumber2: "",
			image_rights: true,
			membership_date: dayjs(),
			membership_type: 1,
			fiscal_year_id: null,
			comments: "",
			cotisations: []
		}
	}

	// Utility function
	function jsonDateTimeReviver(key, value) {
		switch (key) {
			case 'birthdate':
			case 'membership_date':
				if (value == null || value === 0) {
					return null;
				}
				return dayjs(value, "YYYY-MM-DD");
			default:
				break;
		}
		return value;
	}

	function loadData() {
		return loadMembership()
			.then(_ => loadFiscalYears())
			.then(_ => loadMembers())
			.then(_ => loadCotisations());
	}

	function loadMembership() {
		// Check if mode add
		if (isModeAdd()) {
			const defaultObject = getDefaultData();
			return Promise.resolve(defaultObject).then((newDataObject) => {
				setDataObject(newDataObject);
			});
		}

		// Compute request url
		let url = serviceInstance.createServiceUrl("/memberships/get?id=" + dataId);

		// Load data
		return fetchJSON(url, null, jsonDateTimeReviver)
			.then((response) => {
				const newDataObject = response.result.membership;
				setDataObject(newDataObject);
				form.setFieldsValue(newDataObject);
				setCotisationLines((newDataObject.cotisations || []).map(l => ({...l, checked: true})));
			});
	}

	function loadFiscalYears() {
		const url = serviceInstance.createServiceUrl("/fiscal_years/list?order=desc");
		return fetchJSON(url)
			.then((response) => {
				setFiscalYears(response.result.fiscal_years || []);
				// If add and no fiscal year selected, pick current if any
				if (isModeAdd()) {
					const years = response.result.fiscal_years || [];
					const current = years.find(y => y.is_current);
					if (current) {
						form.setFieldsValue({fiscal_year_id: current.id});
					}
				}
			});
	}

	function loadMembers() {
		const url = serviceInstance.createServiceUrl("/members/list");
		return fetchJSON(url)
			.then((response) => {
				setMembers(response.result.members || []);
			});
	}

	function loadCotisations() {
		const url = serviceInstance.createServiceUrl("/cotisations/list");
		return fetchJSON(url)
			.then((response) => {
				setCotisations(response.result.cotisations || []);
				// If add: prefill cotisation lines for current FY
				if (isModeAdd()) {
					const fyId = form.getFieldValue('fiscal_year_id');
					if (fyId) {
						prefillCotisationsForFiscalYear(fyId);
					}
				}
			});
	}

	function prefillCotisationsForFiscalYear(fyId) {
		const list = (cotisations || []).filter(c => c.fiscal_year_id === fyId)
			.map(c => ({
				cotisation_id: c.id,
				label: c.label,
				date: dayjs().format('YYYY-MM-DD'),
				amount: c.amount,
				payment_method: 0,
				checked: true
			}));
		setCotisationLines(list);
	}

	// Form management
	function onFinish(values) {
		pageLoader.startSaving();

		// Convert dates to the desired format
		if (values.birthdate) {
			values.birthdate = values.birthdate.format('YYYY-MM-DD');
		}
		if (values.membership_date) {
			values.membership_date = values.membership_date.format('YYYY-MM-DD');
		}

		// Attach cotisations
		values.cotisations = (cotisationLines || []).map(l => ({
			cotisation_id: l.cotisation_id || l.id,
			date: (l.date && l.date.format ? l.date.format('YYYY-MM-DD') : l.date),
			amount: l.amount,
			payment_method: (l.payment_method === '' ? null : l.payment_method),
			checked: !!l.checked,
		}));

		let path;
		if (isModeAdd()) {
			path = "/memberships/save";
		} else {
			path = "/memberships/save?id=" + dataId;
		}
		let url = serviceInstance.createServiceUrl(path);

		const opts = {
			method: "POST",
			body: JSON.stringify(values)
		};

		fetchJSON(url, opts)
			.then((_result) => {
				pageLoader.endSaving(i18n.t("pages.membership.saved"));
				if (isModeAdd()) {
					const url = serviceInstance.createAdminUrl("/memberships/list");
					props.router.navigate(url);
				} else {
					return loadData();
				}
			})
			.catch((error) => {
				pageLoader.errorSaving(error);
			});
	}

	function renderAutoCompleteLabel(m) {
		let name = `${m.lastname} ${m.firstname}`;
		let address = null;
		let birthdate = null;
		if (m.city || m.zipcode || m.address) {
			address = (
				<Typography.Text type="secondary">
					&nbsp; {m.address} {m.zipcode} {m.city}
				</Typography.Text>
			)
		}
		if (m.birthdate) {
			birthdate = "(" + dayjs(m.birthdate, "YYYY-MM-DD").format(i18n.t('common.date_format')) + ")";
		}
		return (
			<Space orientation="vertical">
				<Space>{name}{birthdate}</Space>
				<Space>{address}</Space>
			</Space>
		);
	}

	function renderAutoCompleteValue(m) {
		let value = `${m.id}`;
		return value;
	}

	function renderAutoCompleteSearch(m) {
		let value = `${m.lastname} ${m.firstname}`;
		return value;
	}

	// Autocomplete options for members (by lastname firstname)
	const memberOptions = (members || []).map(m => ({
		key: m.id,
		label: renderAutoCompleteLabel(m),
		value: renderAutoCompleteValue(m),
		search: renderAutoCompleteSearch(m),
		m
	}));

	function onMemberSelect(value, option) {
		const m = option.m;
		// Set person fields and person_id
		const patch = {
			person_id: m.id,
			lastname: m.lastname,
			firstname: m.firstname,
			gender: m.gender,
			birthdate: m.birthdate ? dayjs(m.birthdate, 'YYYY-MM-DD') : null,
			address: m.address || '',
			zipcode: m.zipcode || null,
			city: m.city || '',
			email: m.email || '',
			phonenumber: m.phonenumber || '',
			phonenumber2: m.phonenumber2 || '',
			image_rights: !!m.image_rights,
		};
		form.setFieldsValue(patch);
	}

	function onFiscalYearChange(fyId) {
		prefillCotisationsForFiscalYear(fyId);
	}

	function getCotisationPaymentOptions() {
		return [
			{label: "--" + i18n.t('models.membership.payment_method_unknown') + "--"},
			{value: 0, label: i18n.t('models.membership.payment_method_none')},
			{value: 1, label: i18n.t('models.membership.payment_method_check')},
			{value: 2, label: i18n.t('models.membership.payment_method_cash')},
			{value: 3, label: i18n.t('models.membership.payment_method_card')},
			{value: 4, label: i18n.t('models.membership.payment_method_banktransfert')},
			{value: 5, label: i18n.t('models.membership.payment_method_helloasso')},
		];
	}

	function renderCotisationsEditor() {
		const fyId = form.getFieldValue('fiscal_year_id');
		const fyCotisations = (cotisations || []).filter(c => c.fiscal_year_id === fyId);
		if (!fyId) {
			return null;
		}
		return (
			<div>
				{fyCotisations.length === 0 && (<div>{i18n.t('pages.membership.no_cotisation_for_year')}</div>)}
				{fyCotisations.map(c => {
					const idx = cotisationLines.findIndex(l => (l.cotisation_id || l.id) === c.id);
					const current = idx >= 0 ? cotisationLines[idx] : {
						cotisation_id: c.id,
						amount: c.amount,
						date: dayjs(),
						payment_method: 0,
						checked: false
					};

					function updateLine(patch) {
						const list = [...cotisationLines];
						if (idx >= 0) {
							list[idx] = {...current, ...patch};
						} else {
							list.push({...current, ...patch});
						}
						setCotisationLines(list);
					}

					return (
						<div key={c.id} style={{
							display: 'grid',
							gridTemplateColumns: '20px 1fr 140px 160px 160px',
							gap: 8,
							alignItems: 'center',
							marginBottom: 6
						}}>
							<input type="checkbox" checked={!!current.checked}
							       onChange={e => updateLine({checked: e.target.checked})}/>
							<span>{c.label}</span>
							<InputNumber
								min={0}
								step={0.01}
								value={current.amount}
								onChange={(v) => updateLine({amount: v})}
							/>
							<DatePicker
								format={i18n.t('common.date_format')}
								value={current.date ? (current.date.format ? current.date : dayjs(current.date, 'YYYY-MM-DD')) : null}
								onChange={(d) => updateLine({date: d})}
							/>
							<Select
								style={{width: '100%'}}
								value={(current.payment_method === null || current.payment_method === undefined) ? undefined : current.payment_method}
								options={getCotisationPaymentOptions()}
								onChange={(v) => updateLine({payment_method: v})}
							/>
						</div>
					);
				})}
			</div>
		);
	}

	// Compute layout data
	function getLayoutData() {
		// Set page title
		let pageTitle;
		if (!isModeAdd()) {
			pageTitle = i18n.t("pages.membership.edit_title");
		} else {
			pageTitle = i18n.t("pages.membership.add_title");
		}

		// Set page breadcrumb
		const pageBreadcrumb = [
			{
				href: serviceInstance.createAdminUrl("/memberships/list"),
				breadcrumbName: i18n.t("pages.memberships.title"),
			}
		];

		// Compute layout data
		const layoutData = {
			pageTitle: pageTitle,
			pageBreadcrumb: pageBreadcrumb
		}
		return layoutData;
	}

	function goToMember() {
		const person_id = (dataObject && dataObject.person_id);
		if (!person_id) {
			return;
		}
		const url = serviceInstance.createAdminUrl("/members/edit/" + person_id);
		props.router.navigate(url);
	}

	function renderViewMemberButton() {
		if (isModeAdd()) {
			return null;
		}
		return (
			<Button onClick={goToMember}>
				{i18n.t("pages.membership.view_member")}
			</Button>
		)
	}

	// Build options
	const fiscalYearOptions = fiscalYears.map(y => ({value: y.id, label: y.title}));

	// Handle dataObject update
	React.useEffect(() => {
		form.setFieldsValue(dataObject);
	}, [dataObject]);

	return (
		<PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
			<FormEdit
				name="membership-edit-form"
				onFinish={onFinish}
				form={form}
			>
				<PageContentAlertError pageLoader={pageLoader}/>

				<Form.Item name={['id']} hidden={true} rules={[{required: !isModeAdd()}]}>
					<Input/>
				</Form.Item>

				{isModeAdd() ?
					<Form.Item label={i18n.t('pages.membership.search_member')}>
						<Select
							style={{width: '100%'}}
							options={memberOptions}
							onSelect={onMemberSelect}
							placeholder={i18n.t('pages.membership.search_member_placeholder')}
							showSearch={{
								filterOption: (inputValue, option) => option.search.toUpperCase().includes(inputValue.toUpperCase())
							}}
						/>
					</Form.Item>
					: null
				}

				<Row gutter={[8, 8]}>
					<Col span={12}>

						<FormEditSection title={i18n.t("pages.membership.section_personal_data")}>

							<Form.Item name={['person_id']} hidden={true}><Input/></Form.Item>

							<Form.Item name={['lastname']} label={i18n.t("models.member.lastname")}
							           rules={[{required: true}]}>
								<Input/>
							</Form.Item>

							<Form.Item name={['firstname']} label={i18n.t("models.member.firstname")}
							           rules={[{required: true}]}>
								<Input/>
							</Form.Item>

							<Form.Item name="gender" label={i18n.t("models.member.gender")}>
								<Select
									options={[
										{value: 0, label: i18n.t('models.member.gender_unknown')},
										{value: 1, label: i18n.t('models.member.gender_male')},
										{value: 2, label: i18n.t('models.member.gender_female')},
									]}
								/>
							</Form.Item>

							<Form.Item name={['birthdate']} label={i18n.t("models.member.birthdate")}>
								<DatePicker format={i18n.t("common.date_format")}/>
							</Form.Item>

							<Form.Item name={['address']} label={i18n.t("models.member.address")}>
								<Input/>
							</Form.Item>

							<Form.Item name={['zipcode']} label={i18n.t("models.member.zipcode")}>
								<InputNumber min={0}/>
							</Form.Item>

							<Form.Item name={['city']} label={i18n.t("models.member.city")}>
								<Input/>
							</Form.Item>

							<Form.Item name={['email']} label={i18n.t("models.member.email")}>
								<Input/>
							</Form.Item>

							<Form.Item name={['phonenumber']} label={i18n.t("models.member.phonenumber")}>
								<Input/>
							</Form.Item>

							<Form.Item name={['phonenumber2']} label={i18n.t("models.member.phonenumber2")}>
								<Input/>
							</Form.Item>

							<Form.Item name={['image_rights']} valuePropName="checked"
							           label={i18n.t("models.member.image_rights")}>
								<Switch/>
							</Form.Item>

						</FormEditSection>
					</Col>
					<Col span={12}>

						<FormEditSection title={i18n.t('pages.membership.section_membership')}>

							<Form.Item name={['membership_date']} label={i18n.t("models.membership.date")}
							           rules={[{required: true}]}>
								<DatePicker format={i18n.t("common.date_format")}/>
							</Form.Item>

							<Form.Item name="membership_type" label={i18n.t("models.membership.type")}>
								<Select
									options={[
										{label: i18n.t('models.membership.type_unknown')},
										{value: 1, label: i18n.t('models.membership.type_standard')},
										{value: 2, label: i18n.t('models.membership.type_young')},
										{value: 3, label: i18n.t('models.membership.type_board')},
										{value: 4, label: i18n.t('models.membership.type_teacher')},
									]}
								/>
							</Form.Item>

							<Form.Item name={['fiscal_year_id']} label={i18n.t("models.cotisation.fiscal_year")}
							           rules={[{required: true}]}>
								<Select options={fiscalYearOptions} onChange={onFiscalYearChange}/>
							</Form.Item>

							<Form.Item name={['comments']} label={i18n.t("models.membership.comments")}>
								<Input.TextArea />
							</Form.Item>


						</FormEditSection>

						<FormEditSection title={i18n.t('pages.membership.section_cotisations')}>
							{renderCotisationsEditor()}
						</FormEditSection>
					</Col>
				</Row>

				<FormEditItemSubmit>
					<Space>
						{renderViewMemberButton()}
						<Button type="primary" htmlType="submit">
							{isModeAdd() ? i18n.t("common.add") : i18n.t("common.save")}
						</Button>
					</Space>
				</FormEditItemSubmit>
			</FormEdit>
		</PageContentLayout>
	)
};

export default MembershipsEdit;
