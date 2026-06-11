import React, { Fragment } from 'react';
import { Form, Input, Button } from 'antd';

import AdvancedSearchForm from '../../components/forms/AdvancedSearchForm.js';
import SelectResponsive from '../../components/inputs/SelectResponsive.js';

import i18n from '../../utils/i18n.js';

const ProjectsSearchForm = (props) => {
	const [form] = Form.useForm();

	const fiscalYears = props.fiscalYears || [];
	const filter = props.filter;

	const fiscalYearOptions = [{ value: '', label: i18n.t('models.fiscal_years.all') }].concat(
		(fiscalYears || []).map(y => ({ value: y.id, label: y.title }))
	);

	const getFields = () => {
		return (
			<Fragment>
				<Form.Item
					name={`fiscal_year_id`}
					label={i18n.t('models.project.fiscal_year')}
				>
					<SelectResponsive
						options={fiscalYearOptions}
						style={{width: '200px'}}
					/>
				</Form.Item>
				<Form.Item
					name={`name`}
					label={i18n.t('models.project.name')}
				>
					<Input style={{width: '220px'}} />
				</Form.Item>
				<Form.Item>
					<Button type="primary" htmlType="submit">
						{i18n.t('common.search')}
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
				name: filter.name,
			}}
		>
			{getFields()}
		</AdvancedSearchForm>
	);
};

export default ProjectsSearchForm;
