import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Form, Input, Alert, message } from 'antd';

import i18n from '../utils/i18n.js';
import { AppContext } from "../layout/AppContext.js";
import BaseLayout from '../layout/BaseLayout.js';

const Initialize = (props) => {
	const navigate = useNavigate();
	const appContext = React.useContext(AppContext);
	const serviceInstance = appContext.serviceInstance;

	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const onFinish = (values) => {
		if (values.password !== values.confirm_password) {
			setError(i18n.t("pages.initialize.password_mismatch"));
			return;
		}

		setError(null);
		setLoading(true);

		const url = serviceInstance.createServiceUrl("/users/init");
		fetch(url, {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			body: JSON.stringify({
				email: values.email,
				first_name: values.first_name,
				last_name: values.last_name,
				password: values.password
			})
		})
		.then(response => response.json())
		.then(data => {
			setLoading(false);
			if (data.success) {
				message.success(i18n.t("pages.initialize.success"));
				navigate("/login");
			} else {
				setError(data.error || "Error");
			}
		})
		.catch(err => {
			setLoading(false);
			setError(err.message);
		});
	};

	const layoutData = {
		pageTitle: i18n.t("pages.initialize.title"),
		pageStatic: true,
	};

	return (
		<BaseLayout layoutData={layoutData}>
			<Layout.Content style={{ margin: '7px 0px 7px 0px', padding: 0 }}>
				<Card title={i18n.t("pages.initialize.title")} style={{ margin: 'auto', width: "100%", maxWidth: "600px" }}>
					<p>{i18n.t("pages.initialize.intro")}</p>
					{error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
					<Form name="initialize" layout="vertical" onFinish={onFinish}>
						<Form.Item
							label={i18n.t("pages.initialize.first_name")}
							name="first_name"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label={i18n.t("pages.initialize.last_name")}
							name="last_name"
							rules={[{ required: true }]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label={i18n.t("pages.initialize.email")}
							name="email"
							rules={[{ required: true, type: 'email' }]}
						>
							<Input />
						</Form.Item>
						<Form.Item
							label={i18n.t("pages.initialize.password")}
							name="password"
							rules={[{ required: true }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item
							label={i18n.t("pages.initialize.confirm_password")}
							name="confirm_password"
							rules={[{ required: true }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit" block loading={loading}>
								{i18n.t("pages.initialize.create")}
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</Layout.Content>
		</BaseLayout>
	);
};

export default Initialize;
