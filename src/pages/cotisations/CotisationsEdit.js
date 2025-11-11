import React from 'react';

import {Form, Input, Button, DatePicker, Select, InputNumber} from 'antd';

import dayjs from 'dayjs';

import i18n from '../../utils/i18n.js';

import {fetchJSON} from '../../authentication/backend.js';

import {AppContext} from "../../layout/AppContext.js";
import PageContentLayout from '../../layout/PageContentLayout.js';
import PageContentAlertError from '../../layout/PageContentAlertError.js';

import FormEdit from '../../components/forms/FormEdit.js';
import FormEditSection from '../../components/forms/FormEditSection.js';
import FormEditItemSubmit from '../../components/forms/FormEditItemSubmit.js';

const CotisationsEdit = (props) => {

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
            cotisation: {
                label: "",
                amount: 0,
                start_date: null,
                end_date: null,
                fiscal_year_id: null,
                type: 1,
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
	return loadCotisation()
            .then(_result => loadFiscalYears());
    }

    function loadCotisation()
    {
        // Check if mode add
        if(isModeAdd()){
            return Promise.resolve(dataObject);
        }

        // Compute request url
        let url = serviceInstance.createServiceUrl("/cotisations/get?id="+dataId);

        // Load data
        return fetchJSON(url, null, jsonDateTimeReviver)
            .then((response) => {
                const newDataObject = response.result.cotisation;
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

        // Convert dates to the desired format
        if (values.start_date) {
            values.start_date = values.start_date.format('YYYY-MM-DD');
        }
        if (values.end_date) {
            values.end_date = values.end_date.format('YYYY-MM-DD');
        }

        let path;
        if(isModeAdd()){
            path = "/cotisations/save";
        }else{
            path = "/cotisations/save?id="+dataId;
        }
        let url = serviceInstance.createServiceUrl(path);

        const opts = {
            method: "POST",
            body: JSON.stringify(values)
        };

        fetchJSON(url, opts)
            .then((_result) => {
                pageLoader.endSaving(i18n.t("pages.cotisation.saved"));
                if(isModeAdd()){
                    const url = serviceInstance.createAdminUrl("/cotisations/list");
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
            pageTitle = i18n.t("pages.cotisation.edit_title");
        }else{
            pageTitle = i18n.t("pages.cotisation.add_title");
        }

        // Set page breadcrumb
        const pageBreadcrumb = [
            {
                breadcrumbName: i18n.t("menu.settings"),
            },
            {
                href: serviceInstance.createAdminUrl('/cotisations/list'),
                breadcrumbName: i18n.t("pages.cotisations.title"),
            }
        ];

        // Compute layout data
        const layoutData = {
            pageTitle: pageTitle,
            pageBreadcrumb: pageBreadcrumb
        }
        return layoutData;
    }

    // Build options for fiscal years
    const fiscalYearOptions = fiscalYears.map(y => ({ value: y.id, label: y.title }));

    // Handle dataObject update
    React.useEffect(() => {
        formInstance.setFieldsValue(dataObject);
    }, [dataObject]);

    return (
        <PageContentLayout layoutData={getLayoutData()} loadData={loadData}>
            <FormEdit
                name="cotisation-edit-form"
                onFinish={onFinish}
                form={formInstance}
            >
                <PageContentAlertError pageLoader={pageLoader} />

                <Form.Item name={['id']} hidden={true} rules={[{ required: !isModeAdd() }]}>
                    <Input />
                </Form.Item>

                <FormEditSection title={i18n.t("pages.cotisation.section_general")}>

		        <Form.Item name="label" label={i18n.t("models.cotisation.label")} rules={[{ required: true }]}>
		            <Input />
		        </Form.Item>

		        <Form.Item name="type" label={i18n.t("models.cotisation.type")} rules={[{ required: true }]}>
		            <Select
		                options={[
		                    { value: 1, label: i18n.t("models.cotisation.type_membership") },
		                    { value: 2, label: i18n.t("models.cotisation.type_course") },
		                    { value: 3, label: i18n.t("models.cotisation.type_donation") },
		                    { value: 4, label: i18n.t("models.cotisation.type_credit") },
		                ]}
		            />
		        </Form.Item>

		        <Form.Item name={['amount']} label={i18n.t('models.cotisation.amount')} rules={[{ required: true }]}>
		            <InputNumber min={0} step={0.01} />
		        </Form.Item>

		        <Form.Item name={['start_date']} label={i18n.t("models.cotisation.start_date")} rules={[{ required: true }]}>
		            <DatePicker format={i18n.t("common.date_format")} />
		        </Form.Item>

		        <Form.Item name={['end_date']} label={i18n.t("models.cotisation.end_date")} rules={[{ required: true }]}>
		            <DatePicker format={i18n.t("common.date_format")} />
		        </Form.Item>

		        <Form.Item name={['fiscal_year_id']} label={i18n.t("models.cotisation.fiscal_year")} rules={[{ required: true }]}>
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

export default CotisationsEdit;
