import React, { Fragment } from 'react';
import { Form, Input, Button } from 'antd';

import AdvancedSearchForm from '../../components/forms/AdvancedSearchForm.js';

import i18n from '../../utils/i18n.js';

const UsersSearchForm = (props) => {
	const [form] = Form.useForm();

	const getFields = () => {
		return (
			<Fragment>
				<Form.Item
					name={`search`}
					label={i18n.t("common.search")}
				>
					<Input
						placeholder={i18n.t("pages.users.search_placeholder")}
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

export default UsersSearchForm;
