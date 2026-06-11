import React, { Fragment } from 'react';
import { Form, Button, Input } from 'antd';

import AdvancedSearchForm from '../../components/forms/AdvancedSearchForm.js';
import SelectResponsive from '../../components/inputs/SelectResponsive.js';

import i18n from '../../utils/i18n.js';

const MembershipsSearchForm = (props) => {
    const [form] = Form.useForm();

    const fiscalYears = props.fiscalYears || [];
	const filter = props.filter;

	// Update the default fiscal year
	React.useEffect(() => {
		if(filter.fiscalYearId != null) {
			form.setFieldsValue({fiscal_year_id: filter.fiscalYearId});
		}
	}, [filter]);

    const fiscalYearOptions = [{ value: '', label: i18n.t('models.fiscal_years.all') }].concat(
        (fiscalYears || []).map(y => ({ value: y.id, label: y.title }))
    );

    const genderOptions = [
        { value: '', label: i18n.t('models.member.gender_all') },
        { value: 0, label: i18n.t('models.member.gender_unknown') },
        { value: 1, label: i18n.t('models.member.gender_male') },
        { value: 2, label: i18n.t('models.member.gender_female') },
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
                    name={`gender`}
                    label={i18n.t('models.member.gender')}
                >
                    <SelectResponsive
                        options={genderOptions}
                        style={{width: "200px"}}
                    />
                </Form.Item>
                <Form.Item
                    name={`search`}
                    label={i18n.t('models.member.lastname')}
                >
                    <Input
                        placeholder={i18n.t('pages.memberships.search_name_placeholder')}
                        style={{width: "240px"}}
                        allowClear
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
	      fiscal_year_id: filter.fiscalYearId,
	      gender: filter.gender,
	      search: filter.search,
      }}
    >
        {getFields()}
    </AdvancedSearchForm>
  );
};

export default MembershipsSearchForm;
