import React, { Fragment } from 'react';
import { Form, Button } from 'antd';

import AdvancedSearchForm from '../../components/forms/AdvancedSearchForm.js';
import SelectResponsive from '../../components/inputs/SelectResponsive.js';

import i18n from '../../utils/i18n.js';

const MembersSearchForm = (props) => {
	const [form] = Form.useForm();

	const fiscalYears = props.fiscalYears || [];
	const defaultFiscalYearId = props.defaultFiscalYearId;

	// Reflect default selection when provided/changes
	React.useEffect(() => {
		if (defaultFiscalYearId !== undefined && defaultFiscalYearId !== null) {
			form.setFieldsValue({ fiscal_year_id: defaultFiscalYearId });
		}
	}, [defaultFiscalYearId]);

	const fiscalYearOptions = [{ value: '', label: i18n.language === 'fr' ? 'Toutes' : 'All' }].concat(
		(fiscalYears || []).map(y => ({ value: y.id, label: y.title }))
	);

	const getFields = () => {
		return (
			<Fragment>
				<Form.Item
					name={`fiscal_year_id`}
					label={i18n.t("models.cotisation.fiscal_year")}
				>
					<SelectResponsive
						options={fiscalYearOptions}
						style={{width: "200px"}}
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
    >
        {getFields()}
    </AdvancedSearchForm>
  );
};

export default MembersSearchForm;
