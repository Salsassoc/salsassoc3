import React, { Fragment } from 'react';
import { Form, Button } from 'antd';

import AdvancedSearchForm from '../../components/forms/AdvancedSearchForm.js';
import SelectResponsive from '../../components/inputs/SelectResponsive.js';

import i18n from '../../utils/i18n.js';

const AccountingOperationsFinancialReportSearchForm = (props) => {
	const [form] = Form.useForm();

	const fiscalYears = props.fiscalYears || [];
	const defaultFiscalYearId = props.defaultFiscalYearId;
	const accounts = props.accounts || [];
	
	// Reflect default selection when provided/changes
	React.useEffect(() => {
		if (defaultFiscalYearId !== undefined && defaultFiscalYearId !== null) {
			form.setFieldsValue({ fiscal_year_id: defaultFiscalYearId });
		}
	}, [defaultFiscalYearId]);
	/*
	React.useEffect(() => {
		if (defaultFiscalYearId !== undefined && defaultFiscalYearId !== null) {
			form.setFieldsValue({ fiscal_year_id: defaultFiscalYearId });
		}
	}, []);*/

	const currentYear = new Date().getFullYear();
	const years = [];
	for(let y = currentYear; y >= 1999; --y){
		years.push(y);
	}

	const fiscalYearOptions = [{ value: '', label: i18n.t("models.fiscal_years.all")}].concat(
		(fiscalYears || []).map(y => ({ value: y.id, label: y.title }))
	);
	const yearOptions = [{ value: '', label: i18n.t("models.fiscal_years.all")}].concat(
		years.map(y => ({ value: y, label: ''+y }))
	);
	const accountOptions = [{ value: '', label: i18n.t("models.accounting_account.all")}].concat(
		(accounts || []).map(a => ({ value: a.id, label: a.label }))
	);

	const getFields = () => {
		return (
			<Fragment>
				<Form.Item
					name={`fiscal_year_id`}
					label={i18n.t("models.accounting_operation.fiscal_year")}
				>
					<SelectResponsive
						options={fiscalYearOptions}
						style={{width: "200px"}}
					/>
				</Form.Item>
				<Form.Item
					name={`year`}
					label={i18n.t("common.calendar_year")}
				>
					<SelectResponsive 
						style={{width: "160px"}}
						options={yearOptions}
					/>
				</Form.Item>
				<Form.Item
					name={`accounting_account_id`}
					label={i18n.t("models.accounting_operation.account")}
				>
					<SelectResponsive 
						style={{width: "220px"}}
						options={accountOptions}
					/>
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						{i18n.t("common.search")}
					</Button>
				</Form.Item>
			</Fragment>
    	);
  };

  return (
    <AdvancedSearchForm
      form={form}
      onFinish={props.onFinish}
	  initialValues={{
		fiscal_year_id: '',
		year: '',
		accounting_account_id: ''
	  }}
    >
        {getFields()}
    </AdvancedSearchForm>
  );
};

export default AccountingOperationsFinancialReportSearchForm;
