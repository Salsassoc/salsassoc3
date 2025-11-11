import React, { Fragment } from 'react';
import { Form, Input, Select, Button } from 'antd';

import AdvancedSearchForm from '../../components/forms/AdvancedSearchForm.js';
import SelectResponsive from '../../components/inputs/SelectResponsive.js';

import i18n from '../../utils/i18n.js';

const CotisationsSearchForm = (props) => {
	const [form] = Form.useForm();

	const fiscalYears = props.fiscalYears || [];

	const fiscalYearOptions = [{ value: '', label: i18n.language === 'fr' ? 'Toutes' : 'All' }].concat(
		(fiscalYears || []).map(y => ({ value: y.id, label: y.title }))
	);
	const typeOptions = [
		{ value: '', label: i18n.language === 'fr' ? 'Tous' : 'All' },
		{ value: 1, label: i18n.t('models.cotisation.type_membership') },
		{ value: 2, label: i18n.t('models.cotisation.type_course') },
		{ value: 3, label: i18n.t('models.cotisation.type_donation') },
		{ value: 4, label: i18n.t('models.cotisation.type_credit') },
	];


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
				<Form.Item
					name={`cotisation_type`}
					label={i18n.t("models.cotisation.type")}
				>
					<SelectResponsive 
						style={{width: "200px"}}
						options={typeOptions}
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

export default CotisationsSearchForm;